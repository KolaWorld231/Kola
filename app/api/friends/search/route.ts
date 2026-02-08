import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/friends/search?q=query - Search for users to add as friends
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by name or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
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
      take: 20,
    });

    // Get friendship status for each user
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id, friendId: { in: users.map((u) => u.id) } },
          { friendId: session.user.id, userId: { in: users.map((u) => u.id) } },
        ],
      },
    });

    const friendshipMap = new Map(
      friendships.map((f) => [
        f.userId === session.user.id ? f.friendId : f.userId,
        f.status,
      ])
    );

    const usersWithStatus = users.map((user) => ({
      ...user,
      friendshipStatus: friendshipMap.get(user.id) || null,
    }));

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

