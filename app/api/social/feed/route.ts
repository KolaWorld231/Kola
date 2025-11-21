import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/social/feed - Get social feed (friends' activities)
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's friends
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, status: "accepted" },
          { friendId: session.user.id, status: "accepted" },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.userId === session.user.id ? f.friendId : f.userId
    );

    // Include user's own activities
    friendIds.push(session.user.id);

    // Get public social activities from friends
    const activities = await prisma.socialActivity.findMany({
      where: {
        userId: { in: friendIds },
        isPublic: true,
      },
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching social feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

