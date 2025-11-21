import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/notifications/latest - Get latest notifications since timestamp
 * Used for polling-based real-time updates
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(_request.url);
    const since = searchParams.get("since");

    // Get user's recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: session.user.id,
        ...(since ? { unlockedAt: { gte: new Date(since) } } : {}),
      },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
      take: 10,
    });

    // Get user data for streak notifications
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        totalXP: true,
        hearts: true,
        lastActivityDate: true,
        createdAt: true,
      },
    });

    // Build notifications from achievements
    const notifications: Array<{
      id: string;
      type: "achievement" | "streak" | "challenge" | "daily_goal" | "milestone";
      title: string;
      message: string;
      icon?: string;
      read: boolean;
      createdAt: Date;
      link?: string;
    }> = recentAchievements.map((ua) => ({
      id: `achievement-${ua.id}`,
      type: "achievement" as const,
      title: "Achievement Unlocked! 🎉",
      message: `You unlocked: ${ua.achievement.name}`,
      icon: ua.achievement.icon || "🏆",
      read: false,
      createdAt: ua.unlockedAt,
      link: "/profile",
    }));

    // Add streak milestone notifications
    if (user) {
      const milestones = [3, 7, 30, 100];
      for (const milestone of milestones) {
        if (user.currentStreak === milestone) {
          notifications.unshift({
            id: `streak-${milestone}`,
            type: "streak" as const,
            title: `🔥 ${milestone}-Day Streak!`,
            message: `You've maintained a ${milestone}-day streak! Keep it up!`,
            icon: "🔥",
            read: false,
            createdAt: new Date(),
            link: "/dashboard",
          });
        }
      }
    }

    return NextResponse.json({
      notifications: notifications.slice(0, 20),
      count: notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching latest notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


