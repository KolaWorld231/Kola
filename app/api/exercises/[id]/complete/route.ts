import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { updateLeaderboard } from "@/lib/leaderboard";
import { updateChallengeProgress } from "@/lib/daily-challenges";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { isCorrect } = await request.json();

    const exercise = await prisma.exercise.findUnique({
      where: { id: resolvedParams.id },
      include: { lesson: true },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    let xpEarned = 0;
    let heartsLost = 0;

    if (isCorrect) {
      // Award XP for correct answer
      xpEarned = exercise.xpReward;
      await prisma.userXP.create({
        data: {
          userId: session.user.id,
          amount: xpEarned,
          source: "exercise",
          sourceId: resolvedParams.id,
          description: `Completed exercise: ${exercise.question.substring(0, 50)}...`,
        },
      });

      // Update user's total XP
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { increment: xpEarned },
        },
      });

      // Check exercise-based achievements
      const unlockedAchievements = await checkAndUnlockAchievements(
        session.user.id,
        {
          type: "exercise_completed",
          data: {
            isCorrect: true,
            exerciseId: resolvedParams.id,
            totalXP: updatedUser.totalXP,
          },
        }
      );

      // Check XP-based achievements
      await checkAndUnlockAchievements(session.user.id, {
        type: "xp_earned",
        data: {
          totalXP: updatedUser.totalXP,
        },
      });

      // Update leaderboard (don't await to avoid blocking)
      const lesson = await prisma.lesson.findUnique({
        where: { id: exercise.lessonId },
        include: { unit: { include: { language: true } } },
      });

      updateLeaderboard(
        session.user.id,
        xpEarned,
        lesson?.unit?.language?.id
      ).catch(console.error);

      // Update daily challenge progress (don't await to avoid blocking)
      updateChallengeProgress(session.user.id, "xp", xpEarned).catch(console.error);
      updateChallengeProgress(session.user.id, "practice", 1).catch(console.error);

      const unlockedAchievementData = unlockedAchievements.filter((a) => a.unlocked).map((a) => a.achievement);

      return NextResponse.json({
        message: "Correct!",
        xpEarned,
        heartsLost: 0,
        heartsRemaining: updatedUser.hearts,
        achievements: unlockedAchievementData,
      });
    } else {
      // Lose a heart for incorrect answer (if hearts > 0)
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hearts: true },
      });

      if (user && user.hearts > 0) {
        heartsLost = 1;
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            hearts: { decrement: 1 },
          },
        });
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hearts: true },
      });

      return NextResponse.json({
        message: "Incorrect",
        xpEarned: 0,
        heartsLost,
        heartsRemaining: updatedUser?.hearts || 0,
        achievements: [],
      });
    }
  } catch (error) {
    console.error("Error completing exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

