import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * Get user notifications
 */
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
      take: 5,
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
      read: false, // In a real app, you'd have a Notification model
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

      // Add daily goal completion notification (if completed today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayXP = await prisma.userXP.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      });

      if (todayXP._sum.amount && todayXP._sum.amount >= 50) {
        notifications.unshift({
          id: "daily-goal-complete",
          type: "daily_goal" as const,
          title: "Daily Goal Complete! 🎯",
          message: `You've earned ${todayXP._sum.amount} XP today!`,
          icon: "✅",
          read: false,
          createdAt: new Date(),
          link: "/dashboard",
        });
      }
    }

    // Sort by date (newest first)
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: notifications.slice(0, 20), // Limit to 20 most recent
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

