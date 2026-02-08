/**
 * Create social activities for user achievements and milestones
 */

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { toDB } from "./json-fields";

interface CreateActivityParams {
  userId: string;
  type: "achievement" | "lesson_completed" | "streak_milestone" | "challenge_won";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isPublic?: boolean;
}

/**
 * Create a social activity
 */
export async function createSocialActivity({
  userId,
  type,
  title,
  message,
  data,
  isPublic = true,
}: CreateActivityParams): Promise<void> {
  try {
    await prisma.socialActivity.create({
      data: {
        userId,
        type,
        title,
        message,
        data: toDB(data) ?? undefined,
        isPublic,
      },
    });
  } catch (error) {
    console.error("Error creating social activity:", error);
    // Don't throw - social activities are non-critical
  }
}

/**
 * Create activity for achievement unlock
 */
export async function createAchievementActivity(
  userId: string,
  achievementName: string,
  achievementIcon: string | null,
  xpReward: number
): Promise<void> {
  await createSocialActivity({
    userId,
    type: "achievement",
    title: "Achievement Unlocked! 🎉",
    message: `${achievementName} - Earned ${xpReward} XP!`,
    data: {
      achievementName,
      achievementIcon,
      xpReward,
    },
    isPublic: true,
  });
}

/**
 * Create activity for lesson completion
 */
export async function createLessonCompletedActivity(
  userId: string,
  lessonTitle: string,
  xpEarned: number,
  accuracy: number
): Promise<void> {
  await createSocialActivity({
    userId,
    type: "lesson_completed",
    title: "Lesson Completed! 📚",
    message: `Completed "${lessonTitle}" with ${Math.round(accuracy)}% accuracy! Earned ${xpEarned} XP.`,
    data: {
      lessonTitle,
      xpEarned,
      accuracy,
    },
    isPublic: true,
  });
}

/**
 * Create activity for streak milestone
 */
export async function createStreakMilestoneActivity(
  userId: string,
  streakDays: number
): Promise<void> {
  const milestones = [3, 7, 30, 100];
  if (!milestones.includes(streakDays)) {
    return; // Only create activities for specific milestones
  }

  await createSocialActivity({
    userId,
    type: "streak_milestone",
    title: `${streakDays}-Day Streak! 🔥`,
    message: `Maintained a ${streakDays}-day learning streak! Keep it up!`,
    data: {
      streakDays,
    },
    isPublic: true,
  });
}


