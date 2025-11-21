import { prisma } from "@/lib/prisma";

export interface ChallengeProgress {
  challengeId: string;
  type: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  rewardXP: number;
  rewardClaimed: boolean;
}

/**
 * Ensure daily challenges exist for today
 * Creates challenges if they don't exist
 */
export async function ensureDailyChallenges(date: Date = new Date()): Promise<void> {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  // Default daily challenges
  const challenges = [
    {
      type: "xp",
      target: 50,
      rewardXP: 20,
    },
    {
      type: "lessons",
      target: 3,
      rewardXP: 15,
    },
    {
      type: "practice",
      target: 5, // 5 exercises
      rewardXP: 10,
    },
  ];

  for (const challenge of challenges) {
    await prisma.dailyChallenge.upsert({
      where: {
        type_date: {
          type: challenge.type,
          date: today,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        type: challenge.type,
        target: challenge.target,
        rewardXP: challenge.rewardXP,
        date: today,
        isActive: true,
      },
    });
  }
}

/**
 * Get daily challenges for a user with their progress
 */
export async function getUserDailyChallenges(
  userId: string,
  date: Date = new Date()
): Promise<ChallengeProgress[]> {
  // Ensure challenges exist
  await ensureDailyChallenges(date);

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  const challenges = await prisma.dailyChallenge.findMany({
    where: {
      date: today,
      isActive: true,
    },
  });

  const userChallenges = await prisma.userDailyChallenge.findMany({
    where: {
      userId,
      challengeId: {
        in: challenges.map((c) => c.id),
      },
    },
  });

  const progressMap = new Map(
    userChallenges.map((uc) => [uc.challengeId, uc])
  );

  return challenges.map((challenge) => {
    const userChallenge = progressMap.get(challenge.id);
    return {
      challengeId: challenge.id,
      type: challenge.type,
      target: challenge.target,
      progress: userChallenge?.progress || 0,
      isCompleted: userChallenge?.isCompleted || false,
      rewardXP: challenge.rewardXP,
      rewardClaimed: userChallenge?.rewardClaimed || false,
    };
  });
}

/**
 * Update challenge progress based on activity
 */
export async function updateChallengeProgress(
  userId: string,
  type: "xp" | "lessons" | "practice",
  amount: number = 1
): Promise<{
  completed: boolean;
  rewardXP?: number;
  challengeId?: string;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenge = await prisma.dailyChallenge.findUnique({
    where: {
      type_date: {
        type,
        date: today,
      },
    },
  });

  if (!challenge || !challenge.isActive) {
    return { completed: false };
  }

  // Get or create user challenge
  let userChallenge = await prisma.userDailyChallenge.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId: challenge.id,
      },
    },
  });

  if (!userChallenge) {
    // Create new user challenge
    const isCompleted = amount >= challenge.target;
    userChallenge = await prisma.userDailyChallenge.create({
      data: {
        userId,
        challengeId: challenge.id,
        progress: amount,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });
  } else if (!userChallenge.isCompleted) {
    // Update progress
    const newProgress = userChallenge.progress + amount;
    const isCompleted = newProgress >= challenge.target;

    userChallenge = await prisma.userDailyChallenge.update({
      where: { id: userChallenge.id },
      data: {
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });
  } else {
    // Already completed, refresh from database
    userChallenge = await prisma.userDailyChallenge.findUnique({
      where: { id: userChallenge.id },
    });
  }

  // Check if just completed and reward not claimed
  if (userChallenge && userChallenge.isCompleted && !userChallenge.rewardClaimed) {
    // Award reward XP
    await prisma.userXP.create({
      data: {
        userId,
        amount: challenge.rewardXP,
        source: "challenge",
        sourceId: challenge.id,
        description: `Daily challenge completed: ${challenge.type}`,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: { increment: challenge.rewardXP },
      },
    });

    await prisma.userDailyChallenge.update({
      where: { id: userChallenge.id },
      data: {
        rewardClaimed: true,
      },
    });

    // Update leaderboard
    const { updateLeaderboard } = await import("./leaderboard");
    updateLeaderboard(userId, challenge.rewardXP, null).catch(console.error);

    return {
      completed: true,
      rewardXP: challenge.rewardXP,
      challengeId: challenge.id,
    };
  }

  return {
    completed: userChallenge?.isCompleted || false,
    challengeId: challenge.id,
  };
}

/**
 * Claim reward for a completed challenge
 */
export async function claimChallengeReward(
  userId: string,
  challengeId: string
): Promise<{ success: boolean; rewardXP?: number }> {
  const userChallenge = await prisma.userDailyChallenge.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
    include: {
      challenge: true,
    },
  });

  if (!userChallenge || !userChallenge.isCompleted || userChallenge.rewardClaimed) {
    return { success: false };
  }

  const rewardXP = userChallenge.challenge.rewardXP;

  // Award reward XP
  await prisma.userXP.create({
    data: {
      userId,
      amount: rewardXP,
      source: "challenge",
      sourceId: challengeId,
      description: `Daily challenge reward: ${userChallenge.challenge.type}`,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXP: { increment: rewardXP },
    },
  });

  await prisma.userDailyChallenge.update({
    where: { id: userChallenge.id },
    data: {
      rewardClaimed: true,
    },
  });

  // Update leaderboard
  const { updateLeaderboard } = await import("./leaderboard");
  updateLeaderboard(userId, rewardXP, null).catch(console.error);

  return {
    success: true,
    rewardXP,
  };
}

