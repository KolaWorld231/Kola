import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/study-groups - Get study groups
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(_request.url);
    const languageId = searchParams.get("languageId");
    const userId = searchParams.get("userId"); // Get groups for specific user

    const where: {
      languageId?: string;
      members?: {
        some: {
          userId: string;
        };
      };
    } = {};

    if (languageId) {
      where.languageId = languageId;
    }

    if (userId) {
      where.members = {
        some: {
          userId,
        },
      };
    }

    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        language: {
          select: {
            id: true,
            name: true,
            flagEmoji: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                totalXP: true,
                currentStreak: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching study groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/study-groups - Create a study group
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, languageId, isPublic = true, maxMembers = 50 } = body;

    if (!name || !languageId) {
      return NextResponse.json(
        { error: "name and languageId are required" },
        { status: 400 }
      );
    }

    // Check if language exists
    const language = await prisma.language.findUnique({
      where: { id: languageId },
    });

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Create study group with creator as owner
    const group = await prisma.studyGroup.create({
      data: {
        name,
        description: description || null,
        languageId,
        isPublic,
        maxMembers,
        members: {
          create: {
            userId: session.user.id,
            role: "owner",
          },
        },
      },
      include: {
        language: {
          select: {
            id: true,
            name: true,
            flagEmoji: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                totalXP: true,
                currentStreak: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error creating study group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

