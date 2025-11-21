import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/leaderboard/recalculate
 * Cron job endpoint to recalculate leaderboard rankings
 * Protected by CRON_SECRET environment variable
 * 
 * This endpoint should be called periodically (e.g., daily, weekly) to ensure
 * leaderboard rankings are accurate, especially after periods of high activity.
 * 
 * Can be triggered by:
 * - Vercel Cron Jobs
 * - External cron services
 * - Manual API calls with secret
 * 
 * Query params:
 * - period: "daily" | "weekly" | "monthly" | "all_time" (optional, recalculates all if not specified)
 * - languageId: optional language filter
 * - secret: CRON_SECRET value for authentication
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const periodParam = searchParams.get("period") as "daily" | "weekly" | "monthly" | "all_time" | null;
    const languageId = searchParams.get("languageId") || null;

    const periods = periodParam
      ? [periodParam]
      : (["daily", "weekly", "monthly", "all_time"] as const);

    const now = new Date();
    const results: Array<{ period: string; entriesUpdated: number; totalEntries: number }> = [];

    for (const period of periods) {
      let periodStart: Date;

      switch (period) {
        case "daily":
          periodStart = new Date(now);
          periodStart.setHours(0, 0, 0, 0);
          break;
        case "weekly":
          periodStart = new Date(now);
          periodStart.setDate(periodStart.getDate() - periodStart.getDay());
          periodStart.setHours(0, 0, 0, 0);
          break;
        case "monthly":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          break;
        case "all_time":
          periodStart = new Date(0);
          break;
      }

      // Get all entries for this period (and language if specified)
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          period,
          periodStart: {
            lte: period === "all_time" ? new Date(8640000000000000) : new Date(now),
            gte: periodStart,
          },
          ...(languageId ? { languageId } : {}),
        },
        orderBy: { xp: "desc" },
      });

      // Update ranks
      let updatedCount = 0;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].rank !== i + 1) {
          await prisma.leaderboardEntry.update({
            where: { id: entries[i].id },
            data: { rank: i + 1 },
          });
          updatedCount++;
        }
      }

      results.push({
        period,
        entriesUpdated: updatedCount,
        totalEntries: entries.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Leaderboard rankings recalculated",
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: unknown) {
    console.error("Error recalculating leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


