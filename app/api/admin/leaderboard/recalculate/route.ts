import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/leaderboard/recalculate
 * Admin-only endpoint to recalculate all leaderboard rankings
 * 
 * Query params:
 * - period: "daily" | "weekly" | "monthly" | "all_time" (optional, recalculates all if not specified)
 * - languageId: optional language filter
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period") as "daily" | "weekly" | "monthly" | "all_time" | null;
    const languageId = searchParams.get("languageId") || null;

    const periods = periodParam
      ? [periodParam]
      : (["daily", "weekly", "monthly", "all_time"] as const);

    const now = new Date();
    const results: Array<{ period: string; entriesUpdated: number }> = [];

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
            lte: periodStart,
            gte: period === "all_time" ? new Date(0) : periodStart,
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
      });
    }

    return NextResponse.json({
      success: true,
      message: "Leaderboard rankings recalculated",
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

