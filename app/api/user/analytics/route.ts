import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "7d":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get user with selected language
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        selectedLanguage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // XP Statistics
    const xpStats = await prisma.userXP.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    // Lesson Statistics
    const lessonStats = await prisma.userProgress.aggregate({
      where: {
        userId: session.user.id,
        isCompleted: true,
        completedAt: { gte: startDate },
      },
      _count: { id: true },
      _avg: { accuracy: true },
    });

    // Exercise Statistics
    const exerciseXP = await prisma.userXP.findMany({
      where: {
        userId: session.user.id,
        source: "exercise",
        createdAt: { gte: startDate },
      },
    });

    const correctExercises = exerciseXP.length;
    const totalExerciseXP = exerciseXP.reduce((sum, entry) => sum + entry.amount, 0);

    // Get all user progress for selected language
    let languageProgress = null;
    if (user.selectedLanguageId) {
      const languageProgressData = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: {
            unit: {
              languageId: user.selectedLanguageId,
            },
          },
        },
        include: {
          lesson: {
            include: {
              unit: true,
            },
          },
        },
      });

      const completedLessons = languageProgressData.filter((p) => p.isCompleted);
      const totalLessons = await prisma.lesson.count({
        where: {
          unit: {
            languageId: user.selectedLanguageId,
          },
        },
      });

      const totalUnits = await prisma.unit.count({
        where: {
          languageId: user.selectedLanguageId,
        },
      });

      const completedUnits = await prisma.unit.findMany({
        where: {
          languageId: user.selectedLanguageId,
          lessons: {
            every: {
              progress: {
                some: {
                  userId: session.user.id,
                  isCompleted: true,
                },
              },
            },
          },
        },
      });

      const averageAccuracy =
        completedLessons.length > 0
          ? completedLessons.reduce((sum, p) => sum + (p.accuracy || 0), 0) /
            completedLessons.length
          : 0;

      languageProgress = {
        completedLessons: completedLessons.length,
        totalLessons,
        completedUnits: completedUnits.length,
        totalUnits,
        progressPercentage: totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0,
        averageAccuracy: Math.round(averageAccuracy),
      };
    }

    // Daily XP breakdown for the period
    const dailyXPBreakdown: Record<string, number> = {};
    const xpEntries = await prisma.userXP.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    xpEntries.forEach((entry) => {
      const dateKey = entry.createdAt.toISOString().split("T")[0];
      dailyXPBreakdown[dateKey] = (dailyXPBreakdown[dateKey] || 0) + entry.amount;
    });

    // Source breakdown
    const sourceBreakdown: Record<string, { count: number; totalXP: number }> = {};
    xpEntries.forEach((entry) => {
      if (!sourceBreakdown[entry.source]) {
        sourceBreakdown[entry.source] = { count: 0, totalXP: 0 };
      }
      sourceBreakdown[entry.source].count += 1;
      sourceBreakdown[entry.source].totalXP += entry.amount;
    });

    // Vocabulary statistics
    const vocabularyCount = await prisma.vocabulary.count({
      where: {
        languageId: user.selectedLanguageId || undefined,
      },
    });

    // Streak statistics
    const streakInfo = {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakBonus: Math.min(Math.floor(user.currentStreak * 10), 50),
    };

    // Time spent estimation (rough calculation: ~2 min per exercise, ~10 min per lesson)
    const estimatedMinutes =
      correctExercises * 2 + (lessonStats._count.id || 0) * 10;
    const estimatedHours = Math.floor(estimatedMinutes / 60);

    return NextResponse.json({
      period,
      xp: {
        total: xpStats._sum.amount || 0,
        average: Math.round(xpStats._avg.amount || 0),
        entries: xpStats._count.id || 0,
      },
      lessons: {
        completed: lessonStats._count.id || 0,
        averageAccuracy: Math.round(lessonStats._avg.accuracy || 0),
      },
      exercises: {
        completed: correctExercises,
        totalXP: totalExerciseXP,
      },
      languageProgress,
      dailyXPBreakdown,
      sourceBreakdown,
      vocabulary: {
        total: vocabularyCount,
      },
      streaks: streakInfo,
      timeSpent: {
        minutes: estimatedMinutes,
        hours: estimatedHours,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}







