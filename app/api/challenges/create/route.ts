import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/challenges/create - Create a new challenge
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
      select: {
        id: true,
        name: true,
        image: true,
      },
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






