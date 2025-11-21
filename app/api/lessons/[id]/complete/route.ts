import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { updateLeaderboard } from "@/lib/leaderboard";
import { updateChallengeProgress } from "@/lib/daily-challenges";
import {
  createLessonCompletedActivity,
  createAchievementActivity,
  createStreakMilestoneActivity,
} from "@/lib/social-activity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { correctAnswers, totalQuestions } = await request.json();

    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const accuracy = (correctAnswers / totalQuestions) * 100;

    // Update or create user progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: id,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        attempts: { increment: 1 },
        correctAnswers: { increment: correctAnswers },
        totalQuestions: { increment: totalQuestions },
        accuracy,
      },
      create: {
        userId: session.user.id,
        lessonId: id,
        isCompleted: true,
        completedAt: new Date(),
        attempts: 1,
        correctAnswers,
        totalQuestions,
        accuracy,
      },
    });

    // Award XP
    const xpEarned = lesson.xpReward;
    await prisma.userXP.create({
      data: {
        userId: session.user.id,
        amount: xpEarned,
        source: "lesson",
        sourceId: id,
        description: `Completed lesson: ${lesson.title}`,
      },
    });

    // Update user's total XP
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalXP: { increment: xpEarned },
        lastActivityDate: new Date(),
      },
    });

    // Update streak - fetch user data if needed
    // Note: We already have user.id, so we only need to fetch if we need streak data
    // Optimize: We could get this from the user update above, but for now we fetch separately
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivity = user.lastActivityDate
        ? new Date(user.lastActivityDate)
        : null;
      const lastActivityDate = lastActivity
        ? new Date(lastActivity.setHours(0, 0, 0, 0))
        : null;

      if (!lastActivityDate || lastActivityDate.getTime() < today.getTime()) {
        const daysDiff = lastActivityDate
          ? Math.floor(
              (today.getTime() - lastActivityDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        if (daysDiff === 1 || lastActivityDate === null) {
          // Consecutive day
          const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
              currentStreak: { increment: 1 },
              longestStreak: {
                increment:
                  user.currentStreak + 1 > user.longestStreak ? 1 : 0,
              },
            },
          });

          // Check streak-based achievements
          await checkAndUnlockAchievements(session.user.id, {
            type: "streak_updated",
            data: {
              currentStreak: updatedUser.currentStreak,
              longestStreak: updatedUser.longestStreak,
            },
          });
        } else if (daysDiff && daysDiff > 1) {
          // Streak broken, reset to 1
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              currentStreak: 1,
            },
          });
        }
      }
    }

    // Check and unlock achievements
    const unlockedAchievements = await checkAndUnlockAchievements(
      session.user.id,
      {
        type: "lesson_completed",
        data: {
          lessonId: id,
          correctAnswers,
          totalQuestions,
          accuracy,
        },
      }
    );

    // Update leaderboard (don't await to avoid blocking)
    // Optimize: Only fetch language ID instead of full include
    const lessonWithLanguage = await prisma.lesson.findUnique({
      where: { id },
      select: {
        unit: {
          select: {
            languageId: true,
          },
        },
      },
    });

    updateLeaderboard(
      session.user.id,
      xpEarned,
      lessonWithLanguage?.unit?.languageId || undefined
    ).catch(console.error);

    // Update daily challenge progress (don't await to avoid blocking)
    updateChallengeProgress(session.user.id, "xp", xpEarned).catch(console.error);
    updateChallengeProgress(session.user.id, "lessons", 1).catch(console.error);

    // Create social activities (don't await to avoid blocking)
    // Optimize: Use lesson.title from the initial query instead of fetching again
    createLessonCompletedActivity(
      session.user.id,
      lesson.title,
      xpEarned,
      accuracy || 0
    ).catch(console.error);

    // Create activities for unlocked achievements
    unlockedAchievements
      .filter((a) => a.unlocked && a.achievement)
      .forEach((a) => {
        if (a.achievement) {
          createAchievementActivity(
            session.user.id,
            a.achievement.name,
            a.achievement.icon ?? null,
            a.achievement.xpReward
          ).catch(console.error);
        }
      });

    // Create activity for streak milestones (don't await to avoid blocking)
    // Fetch current user to get updated streak
    prisma.user
      .findUnique({
        where: { id: session.user.id },
        select: { currentStreak: true },
      })
      .then((currentUser) => {
        if (currentUser && currentUser.currentStreak > 0) {
          createStreakMilestoneActivity(
            session.user.id,
            currentUser.currentStreak
          ).catch(console.error);
        }
      })
      .catch(console.error);

    return NextResponse.json({
      message: "Lesson completed",
      xpEarned,
      progress,
      achievements: unlockedAchievements
        .filter((a) => a.unlocked && a.achievement)
        .map((a) => a.achievement!),
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

