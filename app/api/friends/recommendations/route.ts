import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/friends/recommendations - Get friend recommendations
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current friends (accepted only)
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
    friendIds.push(session.user.id); // Exclude self

    // Get user's selected language
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        selectedLanguageId: true,
        totalXP: true,
      },
    });

    // Find users with similar interests (same language, similar XP level)
    const recommendations = await prisma.user.findMany({
      where: {
        id: { notIn: friendIds },
        selectedLanguageId: currentUser?.selectedLanguageId || undefined,
        totalXP: {
          gte: currentUser && currentUser.totalXP > 100 ? currentUser.totalXP * 0.5 : 0,
          lte: currentUser && currentUser.totalXP > 100 ? currentUser.totalXP * 2 : 10000,
        },
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
      orderBy: { totalXP: "desc" },
      take: 10,
    });

    // If not enough recommendations, add users with highest XP
    if (recommendations.length < 5) {
      const additionalUsers = await prisma.user.findMany({
        where: {
          id: { notIn: [...friendIds, ...recommendations.map((r) => r.id)] },
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
        orderBy: { totalXP: "desc" },
        take: 5 - recommendations.length,
      });

      recommendations.push(...additionalUsers);
    }

    return NextResponse.json({ recommendations: recommendations.slice(0, 10) });
  } catch (error) {
    console.error("Error fetching friend recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


