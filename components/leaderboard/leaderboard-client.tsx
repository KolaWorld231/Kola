"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Globe, Shield, Star, Calendar, Users } from "lucide-react";
import Image from "next/image";
import { LanguageFilter } from "./language-filter";
import { ErrorMessage } from "@/components/ui/error-message";
import { LeaderboardSkeleton } from "./leaderboard-skeleton";

interface Language {
  id: string;
  code: string;
  name: string;
  flagEmoji?: string | null;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  rank: number;
  xp: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface LeaderboardClientProps {
  languages: Language[];
}

// League system based on XP ranges
function getLeagueFromXP(xp: number): { name: string; color: string; icon: React.ReactNode } {
  if (xp >= 10000) {
    return {
      name: "Diamond",
      color: "text-cyan-400",
      icon: <Trophy className="h-8 w-8 text-cyan-400 fill-cyan-400" />,
    };
  }
  if (xp >= 5000) {
    return {
      name: "Ruby",
      color: "text-red-500",
      icon: <Trophy className="h-8 w-8 text-red-500 fill-red-500" />,
    };
  }
  if (xp >= 2000) {
    return {
      name: "Sapphire",
      color: "text-blue-500",
      icon: <Trophy className="h-8 w-8 text-blue-500 fill-blue-500" />,
    };
  }
  if (xp >= 1000) {
    return {
      name: "Pearl",
      color: "text-purple-400",
      icon: <Medal className="h-8 w-8 text-purple-400 fill-purple-400" />,
    };
  }
  if (xp >= 500) {
    return {
      name: "Emerald",
      color: "text-green-500",
      icon: <Medal className="h-8 w-8 text-green-500 fill-green-500" />,
    };
  }
  if (xp >= 200) {
    return {
      name: "Amethyst",
      color: "text-indigo-500",
      icon: <Medal className="h-8 w-8 text-indigo-500 fill-indigo-500" />,
    };
  }
  if (xp >= 100) {
    return {
      name: "Silver",
      color: "text-gray-400",
      icon: <Medal className="h-8 w-8 text-gray-400 fill-gray-400" />,
    };
  }
  return {
    name: "Bronze",
    color: "text-amber-700",
    icon: <Shield className="h-8 w-8 text-amber-700 fill-amber-700" />,
  };
}

export function LeaderboardClient({ languages }: LeaderboardClientProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "all_time">("weekly");
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null);
  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; xp: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period,
        limit: "100",
      });

      if (selectedLanguageId) {
        params.append("languageId", selectedLanguageId);
      }

      if (friendsOnly) {
        params.append("friendsOnly", "true");
      }

      const response = await fetch(`/api/leaderboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setUserRank(data.userRank || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedLanguageId, friendsOnly]);

  const periodLabels = {
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
    all_time: "All Time",
  };

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error loading leaderboard"
        message={error}
        onRetry={fetchLeaderboard}
      />
    );
  }

  const currentUserLeague = userRank ? getLeagueFromXP(userRank.xp) : null;

  return (
    <div className="space-y-8">
      {/* League Badges */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          {/* Bronze */}
          <div className={`flex flex-col items-center ${userRank && userRank.xp < 100 ? "opacity-100" : "opacity-30"}`}>
            <Shield className="h-12 w-12 text-amber-700 fill-amber-700" />
            <span className="text-sm font-medium text-gray-700 mt-1">Bronze</span>
          </div>
          {/* Silver */}
          <div className={`flex flex-col items-center ${userRank && userRank.xp >= 100 && userRank.xp < 200 ? "opacity-100" : "opacity-30"}`}>
            <Medal className="h-12 w-12 text-gray-400 fill-gray-400" />
            <span className="text-sm font-medium text-gray-700 mt-1">Silver</span>
          </div>
          {/* Gold */}
          <div className={`flex flex-col items-center ${userRank && userRank.xp >= 200 && userRank.xp < 500 ? "opacity-100" : "opacity-30"}`}>
            <Medal className="h-12 w-12 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-700 mt-1">Gold</span>
          </div>
          {/* Emerald */}
          <div className={`flex flex-col items-center ${userRank && userRank.xp >= 500 ? "opacity-100" : "opacity-30"}`}>
            <Medal className="h-12 w-12 text-green-500 fill-green-500" />
            <span className="text-sm font-medium text-gray-700 mt-1">Emerald</span>
          </div>
        </div>

        {currentUserLeague && (
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">{currentUserLeague.name} League</h2>
            {entries.length === 0 ? (
              <p className="text-gray-600">Complete a lesson to join this week&apos;s leaderboard</p>
            ) : (
              <p className="text-gray-600">
                Your rank: #{userRank?.rank || "—"} with {userRank?.xp.toLocaleString() || 0} XP
              </p>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Period Selection */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div className="flex gap-2">
                {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod(p)}
                    className={period === p ? "bg-liberian-red hover:bg-liberian-red/90 text-white" : ""}
                  >
                    {periodLabels[p]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <LanguageFilter
                languages={languages}
                selectedLanguageId={selectedLanguageId}
                onLanguageChange={setSelectedLanguageId}
              />
            </div>

            {/* Friends Only Filter */}
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <Button
                variant={friendsOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFriendsOnly(!friendsOnly)}
                className={friendsOnly ? "bg-liberian-blue hover:bg-liberian-blue/90 text-white" : ""}
              >
                Friends Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Rank Card */}
      {userRank && (
        <Card className="bg-liberian-red/5 border-liberian-red/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Your Rank</div>
                <div className="text-3xl font-bold text-liberian-red">#{userRank.rank}</div>
                <div className="text-lg text-gray-700 mt-1">{userRank.xp.toLocaleString()} XP</div>
              </div>
              {currentUserLeague && (
                <div className="flex flex-col items-center">
                  {currentUserLeague.icon}
                  <span className="text-sm font-medium text-gray-700 mt-2">{currentUserLeague.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Entries */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-lg text-gray-600">No leaderboard data available yet.</p>
                <p className="text-gray-500">Complete a lesson to join this week&apos;s leaderboard!</p>
              </div>
            ) : (
              entries.map((entry, index) => {
                const medal =
                  index === 0 ? (
                    <Trophy className="h-7 w-7 text-yellow-500 fill-yellow-500" />
                  ) : index === 1 ? (
                    <Medal className="h-7 w-7 text-gray-400 fill-gray-400" />
                  ) : index === 2 ? (
                    <Medal className="h-7 w-7 text-orange-400 fill-orange-400" />
                  ) : (
                    <span className="text-gray-400 font-semibold text-lg">#{entry.rank}</span>
                  );

                const isTopThree = index < 3;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      isTopThree
                        ? "bg-gradient-to-r from-liberian-red/5 to-liberian-blue/5 border-liberian-red/20 shadow-md"
                        : "bg-white border-gray-200 hover:border-liberian-red/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {medal}
                      </div>
                      <div className="flex items-center gap-3">
                        {entry.user.image ? (
                          <Image
                            src={entry.user.image}
                            alt={entry.user.name || "User"}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full border-2 border-liberian-red/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-liberian-blue text-white flex items-center justify-center text-lg font-bold border-2 border-liberian-red/20">
                            {entry.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-lg text-gray-900">
                            {entry.user.name || "Anonymous"}
                          </div>
                          {isTopThree && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Top performer
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-liberian-red">
                      {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
