import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/achievements - Get user's achievements
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: "desc",
      },
    });

    // Get all available achievements
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: {
        xpReward: "desc",
      },
    });

    // Mark which ones are unlocked
    const unlockedCodes = new Set(
      userAchievements.map((ua) => ua.achievement.code)
    );

    const achievements = allAchievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedCodes.has(achievement.code),
      unlockedAt: userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      )?.unlockedAt || null,
    }));

    // Calculate statistics
    const unlockedCount = userAchievements.length;
    const totalCount = allAchievements.length;
    const totalXPEarned = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.xpReward,
      0
    );

    return NextResponse.json({
      achievements,
      statistics: {
        unlocked: unlockedCount,
        total: totalCount,
        progress: totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0,
        totalXPEarned,
      },
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





