import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/friends - Get user's friends list
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get accepted friends (both directions)
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: "accepted" },
          { friendId: session.user.id, status: "accepted" },
        ],
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
            selectedLanguage: {
              select: {
                name: true,
                flagEmoji: true,
              },
            },
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
            selectedLanguage: {
              select: {
                name: true,
                flagEmoji: true,
              },
            },
          },
        },
      },
    });

    // Map to friend objects (the other user)
    const friends = friendships.map((friendship) => {
      const isSent = friendship.userId === session.user.id;
      return {
        id: isSent ? friendship.friend.id : friendship.user.id,
        name: isSent ? friendship.friend.name : friendship.user.name,
        email: isSent ? friendship.friend.email : friendship.user.email,
        image: isSent ? friendship.friend.image : friendship.user.image,
        totalXP: isSent ? friendship.friend.totalXP : friendship.user.totalXP,
        currentStreak: isSent ? friendship.friend.currentStreak : friendship.user.currentStreak,
        selectedLanguage: isSent
          ? friendship.friend.selectedLanguage
          : friendship.user.selectedLanguage,
        friendshipId: friendship.id,
        status: friendship.status,
        createdAt: friendship.createdAt,
      };
    });

    // Get pending requests
    const pendingSent = await prisma.friend.findMany({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const pendingReceived = await prisma.friend.findMany({
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
          },
        },
      },
    });

    return NextResponse.json({
      friends,
      pendingSent: pendingSent.map((f) => ({
        id: f.friend.id,
        name: f.friend.name,
        email: f.friend.email,
        image: f.friend.image,
        requestId: f.id,
      })),
      pendingReceived: pendingReceived.map((f) => ({
        id: f.user.id,
        name: f.user.name,
        email: f.user.email,
        image: f.user.image,
        requestId: f.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends - Send friend request or accept/decline
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { friendId, action } = body; // action: "send", "accept", "decline", "remove"

    if (!friendId || !action) {
      return NextResponse.json(
        { error: "friendId and action are required" },
        { status: 400 }
      );
    }

    if (friendId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    // Check if friend exists
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
    });

    if (!friend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check existing friendship
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id },
        ],
      },
    });

    if (action === "send") {
      if (existing) {
        if (existing.status === "accepted") {
          return NextResponse.json({ error: "Already friends" }, { status: 400 });
        }
        if (existing.status === "pending") {
          return NextResponse.json({ error: "Friend request already sent" }, { status: 400 });
        }
      }

      // Create friend request
      const friendship = await prisma.friend.create({
        data: {
          userId: session.user.id,
          friendId,
          status: "pending",
        },
        include: {
          friend: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        friendship: {
          id: friendship.friend.id,
          name: friendship.friend.name,
          email: friendship.friend.email,
          image: friendship.friend.image,
          requestId: friendship.id,
        },
      });
    }

    if (action === "accept" || action === "decline") {
      if (!existing || existing.friendId !== session.user.id) {
        return NextResponse.json(
          { error: "Friend request not found" },
          { status: 404 }
        );
      }

      if (action === "accept") {
        await prisma.friend.update({
          where: { id: existing.id },
          data: { status: "accepted" },
        });

        return NextResponse.json({ success: true, message: "Friend request accepted" });
      } else {
        await prisma.friend.delete({
          where: { id: existing.id },
        });

        return NextResponse.json({ success: true, message: "Friend request declined" });
      }
    }

    if (action === "remove") {
      if (!existing || existing.status !== "accepted") {
        return NextResponse.json(
          { error: "Friendship not found" },
          { status: 404 }
        );
      }

      await prisma.friend.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ success: true, message: "Friend removed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing friend:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

