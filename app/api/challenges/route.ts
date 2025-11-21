import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/challenges - Get user's challenges
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(_request.url);
    const type = searchParams.get("type") || "all"; // sent, received, all

    const where: {
      senderId?: string;
      receiverId?: string;
      OR?: Array<{ senderId: string } | { receiverId: string }>;
    } = {};

    if (type === "sent") {
      where.senderId = session.user.id;
    } else if (type === "received") {
      where.receiverId = session.user.id;
    } else {
      where.OR = [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ];
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            totalXP: true,
            currentStreak: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            totalXP: true,
            currentStreak: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges - Create a challenge
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, type, target, description, expiresInDays = 7 } = body;

    if (!receiverId || !type) {
      return NextResponse.json(
        { error: "receiverId and type are required" },
        { status: 400 }
      );
    }

    // Check if users are friends
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: receiverId, status: "accepted" },
          { userId: receiverId, friendId: session.user.id, status: "accepted" },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Can only challenge friends" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const challenge = await prisma.challenge.create({
      data: {
        senderId: session.user.id,
        receiverId,
        type,
        target: target || null,
        description: description || null,
        expiresAt,
        status: "pending",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

