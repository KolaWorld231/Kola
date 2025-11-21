import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/study-groups/[id] - Get a specific study group
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.studyGroup.findUnique({
      where: { id },
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
                email: true,
                totalXP: true,
                currentStreak: true,
                selectedLanguage: {
                  select: {
                    name: true,
                    flagEmoji: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { role: "asc" }, // owner first, then admin, then member
            { joinedAt: "asc" },
          ],
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Study group not found" }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error fetching study group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/study-groups/[id] - Update study group
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if user is owner or admin
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId: session.user.id,
          studyGroupId: id,
        },
      },
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return NextResponse.json(
        { error: "Only owners and admins can update the group" },
        { status: 403 }
      );
    }

    const updateData: {
      name?: string;
      description?: string | null;
      isPublic?: boolean;
      maxMembers?: number;
    } = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
    if (body.maxMembers !== undefined) updateData.maxMembers = body.maxMembers;

    const group = await prisma.studyGroup.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating study group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/study-groups/[id] - Delete study group
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is owner
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        userId_studyGroupId: {
          userId: session.user.id,
          studyGroupId: id,
        },
      },
    });

    if (!membership || membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can delete the group" },
        { status: 403 }
      );
    }

    await prisma.studyGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting study group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

