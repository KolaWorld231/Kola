import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.friend.findMany({
      where: {
        friendId: session.user.id,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            totalXP: true,
            currentStreak: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            totalXP: true,
            currentStreak: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedRequests = requests.map((req) => ({
      id: req.id,
      sender: req.user,
      receiver: req.friend,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await request.json();

    if (!receiverId || receiverId === session.user.id) {
      return NextResponse.json({ error: "Invalid receiver" }, { status: 400 });
    }

    // Check if already friends or request exists
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: receiverId },
          { userId: receiverId, friendId: session.user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
    }

    const friendRequest = await prisma.friend.create({
      data: {
        userId: session.user.id,
        friendId: receiverId,
        status: "pending",
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}