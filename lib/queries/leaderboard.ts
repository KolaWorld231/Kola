import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "@/lib/types";

const API_BASE = "/api";

interface LeaderboardParams {
  period?: "daily" | "weekly" | "monthly" | "all_time";
  languageId?: string;
  limit?: number;
}

// Fetch leaderboard
export function useLeaderboard(params: LeaderboardParams = {}) {
  const { period = "weekly", languageId, limit = 100 } = params;

  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", period, languageId, limit],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        period,
        limit: limit.toString(),
      });
      if (languageId) searchParams.append("languageId", languageId);

      const res = await fetch(`${API_BASE}/leaderboard?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}






