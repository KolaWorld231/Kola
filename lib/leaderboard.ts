import { prisma } from "@/lib/prisma";

/**
 * Update leaderboard entries for a user
 * Called when user earns XP
 */
export async function updateLeaderboard(
  userId: string,
  xpEarned: number,
  languageId?: string | null
) {
  try {
    const now = new Date();

    // Update for different periods
    const periods = [
      {
        name: "daily" as const,
        start: new Date(now.setHours(0, 0, 0, 0)),
        end: new Date(now.setHours(23, 59, 59, 999)),
      },
      {
        name: "weekly" as const,
        start: (() => {
          const start = new Date(now);
          start.setDate(start.getDate() - start.getDay());
          start.setHours(0, 0, 0, 0);
          return start;
        })(),
        end: (() => {
          const end = new Date(now);
          end.setDate(end.getDate() - end.getDay() + 6);
          end.setHours(23, 59, 59, 999);
          return end;
        })(),
      },
      {
        name: "monthly" as const,
        start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      },
      {
        name: "all_time" as const,
        start: new Date(0),
        end: new Date(8640000000000000), // Far future date
      },
    ];

    for (const period of periods) {
      // Update or create leaderboard entry
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_period_periodStart: {
            userId,
            period: period.name,
            periodStart: period.start,
          },
        },
        update: {
          xp: { increment: xpEarned },
        },
        create: {
          userId,
          period: period.name,
          periodStart: period.start,
          periodEnd: period.end,
          xp: xpEarned,
          rank: 0, // Will be calculated below
          languageId: languageId || null,
        },
      });

      // Calculate ranking for this period
      await calculateRankings(period.name, period.start, languageId);
    }
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    // Don't throw - leaderboard update shouldn't block XP earning
  }
}

/**
 * Calculate and update rankings for a given period
 */
async function calculateRankings(
  period: "daily" | "weekly" | "monthly" | "all_time",
  periodStart: Date,
  languageId?: string | null
) {
  try {
    // Get all entries for this period (and language if specified)
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        period,
        periodStart,
        ...(languageId ? { languageId } : {}),
      },
      orderBy: { xp: "desc" },
    });

    // Update ranks
    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboardEntry.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }
  } catch (error) {
    console.error("Error calculating rankings:", error);
  }
}

/**
 * Get leaderboard entries for a specific period and optional language
 */
export async function getLeaderboard(
  period: "daily" | "weekly" | "monthly" | "all_time" = "weekly",
  languageId?: string | null,
  limit: number = 100
) {
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  switch (period) {
    case "daily":
      periodStart = new Date(now.setHours(0, 0, 0, 0));
      periodEnd = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "weekly":
      periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "all_time":
      periodStart = new Date(0);
      periodEnd = new Date(8640000000000000);
      break;
  }

  return await prisma.leaderboardEntry.findMany({
    where: {
      period,
      periodStart: {
        gte: periodStart,
        lte: periodEnd,
      },
      ...(languageId ? { languageId } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { rank: "asc" },
    take: limit,
  });
}

