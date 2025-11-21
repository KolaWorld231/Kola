import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, TrendingUp, Award, Shield, Star, Settings, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLeaderboard } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      selectedLanguage: {
        select: {
          code: true,
          name: true,
          nativeName: true,
          flagEmoji: true,
        },
      },
      achievements: {
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Get leaderboard rank
  const leaderboard = await getLeaderboard("weekly", null, 100);
  const userRank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1;

  // Get league info
  function getLeague(xp: number): { name: string; color: string; nextXP: number } {
    if (xp >= 10000) return { name: "Diamond", color: "text-cyan-400", nextXP: Infinity };
    if (xp >= 5000) return { name: "Ruby", color: "text-red-500", nextXP: 10000 };
    if (xp >= 2000) return { name: "Sapphire", color: "text-blue-500", nextXP: 5000 };
    if (xp >= 1000) return { name: "Pearl", color: "text-purple-400", nextXP: 2000 };
    if (xp >= 500) return { name: "Emerald", color: "text-green-500", nextXP: 1000 };
    if (xp >= 200) return { name: "Amethyst", color: "text-indigo-500", nextXP: 500 };
    if (xp >= 100) return { name: "Silver", color: "text-gray-400", nextXP: 200 };
    return { name: "Bronze", color: "text-amber-700", nextXP: 100 };
  }

  const league = getLeague(user.totalXP);
  const xpUntilNext = league.nextXP === Infinity ? 0 : league.nextXP - user.totalXP;

  // Get top 3 finishes (weeks where user finished in top 3)
  const weeklyLeaderboards = await Promise.all([
    getLeaderboard("weekly", null, 3),
    // Could add more weeks here
  ]);
  const top3Finishes = weeklyLeaderboards.filter(
    (board) => board.slice(0, 3).some((entry) => entry.userId === user.id)
  ).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={user.name || "User"}
                  width={120}
                  height={120}
                  className="w-32 h-32 rounded-full border-4 border-liberian-red shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-liberian-blue border-4 border-liberian-red shadow-lg flex items-center justify-center text-4xl font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user.name || "Learner"}
              </h1>
              <p className="text-gray-600 mb-4">
                {user.email}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                {user.selectedLanguage && (
                  <div className="flex items-center gap-2">
                    <span>{user.selectedLanguage.flagEmoji || "🏳️"}</span>
                    <span>Learning {user.selectedLanguage.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Link href="/settings">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-sm text-gray-600">Day streak</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{user.currentStreak}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-liberian-blue" />
                <span className="text-sm text-gray-600">Total XP</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{user.totalXP.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className={cn("h-6 w-6", league.color)} />
                <span className="text-sm text-gray-600">Current league</span>
              </div>
              <div className={cn("text-2xl font-bold", league.color)}>{league.name}</div>
              {xpUntilNext > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {xpUntilNext.toLocaleString()} XP to next league
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-sm text-gray-600">Top 3 finishes</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{top3Finishes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Achievements */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Achievements</CardTitle>
                <Link href="/dashboard/achievements">
                  <Button variant="ghost" size="sm" className="text-liberian-blue">
                    VIEW ALL
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {user.achievements.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No achievements unlocked yet.</p>
                    <p className="text-sm mt-2">Complete lessons to earn achievements!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.achievements.map((userAchievement) => {
                      const achievement = userAchievement.achievement;
                      return (
                        <div
                          key={userAchievement.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-liberian-red/30 hover:shadow-sm transition-all"
                        >
                          <div className="w-16 h-16 rounded-lg bg-liberian-red/10 flex items-center justify-center text-3xl flex-shrink-0">
                            {achievement.icon || "🏆"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1">
                              {achievement.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {achievement.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                            </div>
                          </div>
                          {achievement.xpReward > 0 && (
                            <div className="text-liberian-blue font-bold flex-shrink-0">
                              +{achievement.xpReward} XP
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics Details */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
                    <div className="text-2xl font-bold text-gray-900">{user.longestStreak} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Weekly Rank</div>
                    <div className="text-2xl font-bold text-liberian-red">
                      #{userRank > 0 ? userRank : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Achievements</div>
                    <div className="text-2xl font-bold text-gray-900">{user.achievements.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Member Since</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Language Progress */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {user.selectedLanguage ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{user.selectedLanguage.flagEmoji || "🏳️"}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{user.selectedLanguage.name}</div>
                        <div className="text-sm text-gray-600">{user.selectedLanguage.nativeName}</div>
                      </div>
                    </div>
                    <Link href={`/learn/${user.selectedLanguage.code}`}>
                      <Button className="w-full bg-liberian-red hover:bg-liberian-red/90">
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-4">No language selected</p>
                    <Link href="/learn">
                      <Button className="bg-liberian-blue hover:bg-liberian-blue/90">
                        Choose a Language
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Friends Section */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm mb-4">Connect with friends and learn together!</p>
                  <Link href="/friends">
                    <Button className="mt-4">View Friends & Social</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

