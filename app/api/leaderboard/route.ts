import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getLeaderboard } from "@/lib/leaderboard";

/**
 * GET /api/leaderboard - Get leaderboard rankings
 * Query params:
 * - period: "daily" | "weekly" | "monthly" | "all_time" (default: "weekly")
 * - languageId: optional language filter
 * - limit: number of entries (default: 100)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const period = (searchParams.get("period") ||
      "weekly") as "daily" | "weekly" | "monthly" | "all_time";
    const languageId = searchParams.get("languageId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");

    // Validate period
    if (!["daily", "weekly", "monthly", "all_time"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Must be: daily, weekly, monthly, or all_time" },
        { status: 400 }
      );
    }

    // Get leaderboard entries
    const entries = await getLeaderboard(period, languageId, limit);

    // Get current user's rank if authenticated
    let userRank = null;
    if (session?.user?.id) {
      const userEntry = entries.find((e) => e.userId === session.user.id);
      if (userEntry) {
        userRank = {
          rank: userEntry.rank,
          xp: userEntry.xp,
          userId: userEntry.userId,
        };
      } else {
        // User not in top entries, find their rank
        const allEntries = await getLeaderboard(period, languageId, 10000);
        const userEntry = allEntries.find((e) => e.userId === session.user.id);
        if (userEntry) {
          userRank = {
            rank: userEntry.rank,
            xp: userEntry.xp,
            userId: userEntry.userId,
          };
        }
      }
    }

    return NextResponse.json({
      period,
      languageId: languageId || null,
      entries: entries.map((entry) => ({
        rank: entry.rank,
        xp: entry.xp,
        user: {
          id: entry.user.id,
          name: entry.user.name,
          image: entry.user.image,
        },
      })),
      userRank,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
