import { prisma } from "@/lib/prisma";

interface AchievementCheckResult {
  unlocked: boolean;
  achievement?: {
    id: string;
    code: string;
    name: string;
    icon?: string | null;
    xpReward: number;
  };
}

/**
 * Check and unlock achievements for a user
 */
export async function checkAndUnlockAchievements(
  userId: string,
  context: {
    type: "lesson_completed" | "streak_updated" | "exercise_completed" | "xp_earned";
    data?: Record<string, unknown>;
  }
): Promise<AchievementCheckResult[]> {
  const results: AchievementCheckResult[] = [];
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: { achievement: true },
      },
    },
  });

  if (!user) return results;

  const unlockedAchievementCodes = new Set(
    user.achievements.map((ua) => ua.achievement.code)
  );

  // Get all active achievements
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
  });

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (unlockedAchievementCodes.has(achievement.code)) {
      continue;
    }

    let shouldUnlock = false;

    // Check achievement criteria based on type and code
    switch (achievement.code) {
      case "first_lesson":
        if (context.type === "lesson_completed") {
          const completedLessons = await prisma.userProgress.count({
            where: {
              userId,
              isCompleted: true,
            },
          });
          shouldUnlock = completedLessons >= 1;
        }
        break;

      case "streak_3":
        if (context.type === "streak_updated" || context.type === "lesson_completed") {
          shouldUnlock = user.currentStreak >= 3;
        }
        break;

      case "streak_7":
        if (context.type === "streak_updated" || context.type === "lesson_completed") {
          shouldUnlock = user.currentStreak >= 7;
        }
        break;

      case "streak_30":
        if (context.type === "streak_updated" || context.type === "lesson_completed") {
          shouldUnlock = user.currentStreak >= 30;
        }
        break;

      case "perfect_10":
        if (context.type === "exercise_completed" && context.data?.isCorrect) {
          const perfectExercises = await prisma.userProgress.count({
            where: {
              userId,
              isCompleted: true,
              accuracy: { gte: 100 },
            },
          });
          shouldUnlock = perfectExercises >= 10;
        }
        break;

      case "xp_100":
        if (context.type === "xp_earned" || context.type === "lesson_completed") {
          shouldUnlock = user.totalXP >= 100;
        }
        break;

      default:
        // Handle custom criteria from JSON
        if (achievement.criteria) {
          shouldUnlock = await checkCustomCriteria(
            userId,
            achievement.criteria as Record<string, unknown>,
            context
          );
        }
    }

    if (shouldUnlock) {
      // Unlock achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP for achievement
      if (achievement.xpReward > 0) {
        await prisma.userXP.create({
          data: {
            userId,
            amount: achievement.xpReward,
            source: "achievement",
            sourceId: achievement.id,
            description: `Achievement unlocked: ${achievement.name}`,
          },
        });

        // Update user's total XP
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalXP: { increment: achievement.xpReward },
          },
        });
      }

      results.push({
        unlocked: true,
        achievement: {
          id: achievement.id,
          code: achievement.code,
          name: achievement.name,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        },
      });
    }
  }

  return results;
}

/**
 * Check custom achievement criteria
 */
async function checkCustomCriteria(
  _userId: string,
  _criteria: Record<string, unknown>,
  _context: {
    type: string;
    data?: Record<string, unknown>;
  }
): Promise<boolean> {
  // Implement custom criteria checking logic
  // This is a placeholder for future expansion
  return false;
}

