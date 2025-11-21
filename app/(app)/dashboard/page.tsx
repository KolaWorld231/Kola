import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, Award, Heart, Trophy, TrendingUp, BookOpen, Lightbulb, Mic, Gift, ShoppingBag, Settings } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DailyGoal } from "@/components/dashboard/daily-goal";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { HeartsWidget } from "@/components/dashboard/hearts-widget";
import { DailyChallenges } from "@/components/dashboard/daily-challenges";
import { LearningInsights } from "@/components/dashboard/learning-insights";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      selectedLanguage: true,
      settings: true,
      achievements: {
        include: { achievement: true },
        take: 5,
        orderBy: { unlockedAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Ensure user has completed onboarding before accessing dashboard
  // This is a redundant check (app layout already handles this) but provides extra safety
  if (!user.settings?.assessmentCompleted) {
    console.log("[DASHBOARD] User has not completed onboarding, redirecting");
    redirect("/onboarding");
  }

  // Get XP history for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const xpHistory = await prisma.userXP.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "asc" },
  });

  // Calculate daily XP for chart
  const dailyXPMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split("T")[0];
    dailyXPMap.set(dateKey, 0);
  }

  xpHistory.forEach((entry) => {
    const dateKey = entry.createdAt.toISOString().split("T")[0];
    const current = dailyXPMap.get(dateKey) || 0;
    dailyXPMap.set(dateKey, current + entry.amount);
  });

  const dailyXP = Array.from(dailyXPMap.entries())
    .map(([date, xp]) => ({ date, xp }))
    .reverse();

  // Calculate weekly XP
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyXP = await prisma.userXP.aggregate({
    where: {
      userId: session.user.id,
      createdAt: { gte: weekStart },
    },
    _sum: { amount: true },
  });

  const currentWeekXP = weeklyXP._sum.amount || 0;

  // Calculate last week's XP for comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  
  const lastWeekXPData = await prisma.userXP.aggregate({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: lastWeekStart,
        lt: lastWeekEnd,
      },
    },
    _sum: { amount: true },
  });
  
  const lastWeekXP = lastWeekXPData._sum.amount || 0;

  // Get weekly exercises count
  const weeklyExercises = await prisma.userXP.count({
    where: {
      userId: session.user.id,
      source: "exercise",
      createdAt: { gte: weekStart },
    },
  });

  // Get weekly lessons count
  const weeklyLessons = await prisma.userProgress.count({
    where: {
      userId: session.user.id,
      isCompleted: true,
      completedAt: { gte: weekStart },
    },
  });

  // Calculate average accuracy for completed lessons this week
  const weeklyProgressData = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      isCompleted: true,
      completedAt: { gte: weekStart },
    },
    select: { accuracy: true },
  });

  const averageAccuracy = weeklyProgressData.length > 0
    ? weeklyProgressData.reduce((sum, p) => sum + (p.accuracy || 0), 0) / weeklyProgressData.length
    : 0;

  // Calculate today's XP
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayXP = await prisma.userXP.aggregate({
    where: {
      userId: session.user.id,
      createdAt: { gte: todayStart },
    },
    _sum: { amount: true },
  });

  const currentDayXP = todayXP._sum.amount || 0;

  // Get recent activity (lessons completed)
  const recentProgress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      isCompleted: true,
      completedAt: { not: null },
    },
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              language: true,
            },
          },
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  const recentActivities = recentProgress.map((progress) => ({
    id: progress.id,
    type: "lesson" as const,
    title: progress.lesson.title,
    language: progress.lesson.unit.language.name,
    xp: progress.lesson.xpReward,
    completedAt: progress.completedAt || progress.createdAt,
    accuracy: progress.accuracy || undefined,
  }));

  // Calculate streak bonus (10% bonus for each day of streak)
  const streakBonus = Math.min(Math.floor(user.currentStreak * 10), 50);

  // Calculate streak status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActivity = user.lastActivityDate
    ? new Date(user.lastActivityDate)
    : null;
  const lastActivityDate = lastActivity
    ? new Date(lastActivity.setHours(0, 0, 0, 0))
    : null;

  const daysDiff =
    lastActivityDate && lastActivityDate.getTime() === today.getTime()
      ? 0
      : lastActivityDate
      ? Math.floor(
          (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

  const needsStreakUpdate = daysDiff !== null && daysDiff > 1;

  // Calculate heart regeneration info
  const now = new Date();
  const lastUpdate = user.lastActivityDate || user.updatedAt;
  const timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();
  const HEART_REGENERATION_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
  const MAX_HEARTS = 5;
  
  let nextHeartRegeneration: Date | null = null;
  if (user.hearts < MAX_HEARTS) {
    const heartsToRegenerate = Math.floor(
      timeSinceLastUpdate / HEART_REGENERATION_INTERVAL_MS
    );
    if (heartsToRegenerate === 0) {
      const timeUntilNextHeart =
        HEART_REGENERATION_INTERVAL_MS -
        (timeSinceLastUpdate % HEART_REGENERATION_INTERVAL_MS);
      nextHeartRegeneration = new Date(now.getTime() + timeUntilNextHeart);
    } else {
      nextHeartRegeneration = new Date(now.getTime() + HEART_REGENERATION_INTERVAL_MS);
    }
  }

  return (
    <DashboardClient>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Welcome back, {user.name || "Learner"}! 🇱🇷
          </h1>
          <p className="text-lg text-foreground-light">
            Continue your Liberian language learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total XP"
            value={user.totalXP.toLocaleString()}
            description="Keep learning to earn more!"
            icon={TrendingUp}
            iconColor="text-secondary"
          />
          <StatsCard
            title="Current Streak"
            value={`${user.currentStreak} 🔥`}
            description={
              needsStreakUpdate
                ? "Complete a lesson to maintain your streak!"
                : "Great job! Keep it up!"
            }
            icon={Flame}
            iconColor="text-primary"
          />
          <StatsCard
            title="Hearts"
            value={"❤️".repeat(Math.min(user.hearts, 5)) + (user.hearts > 5 ? `+${user.hearts - 5}` : "")}
            description={
              user.hearts === 5
                ? "Full hearts! Ready to learn"
                : `${Math.max(0, 5 - user.hearts)} hearts remaining`
            }
            icon={Heart}
            iconColor="text-destructive"
          />
          <StatsCard
            title="Achievements"
            value={user.achievements.length}
            description="Unlocked achievements"
            icon={Award}
            iconColor="text-accent"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Daily Goal & Quick Actions */}
          <div className="space-y-6">
            <DailyGoal
              currentXP={currentDayXP}
              goalXP={user.settings?.assessmentDailyGoal || 50}
              completed={currentDayXP >= (user.settings?.assessmentDailyGoal || 50)}
              streakBonus={streakBonus}
            />

            {/* Heart Recovery Widget */}
            <HeartsWidget
              initialHearts={user.hearts}
              maxHearts={5}
              nextHeartRegeneration={nextHeartRegeneration}
            />

            {/* Daily Challenges */}
            <DailyChallenges />

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>
                    {user.selectedLanguage
                      ? `Continue learning ${user.selectedLanguage.name}`
                      : "Select a language to get started"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.selectedLanguage ? (
                    <Link href={`/learn/${user.selectedLanguage.code}`}>
                      <Button className="w-full">
                        Continue with {user.selectedLanguage.name}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/learn">
                      <Button className="w-full">Choose a Language</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice</CardTitle>
                  <CardDescription>
                    Review vocabulary and practice speaking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/practice">
                    <Button variant="outline" className="w-full">
                      Start Practice Session
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Access Cards */}
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Access</CardTitle>
                  <CardDescription>
                    Jump into learning modes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/stories">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Story Mode
                    </Button>
                  </Link>
                  <Link href="/grammar">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Grammar Tips
                    </Button>
                  </Link>
                  <Link href="/pronunciation">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Mic className="mr-2 h-4 w-4" />
                      Pronunciation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Middle Column: Progress Chart & Learning Insights */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressChart
              title="Weekly Progress"
              dailyXP={dailyXP}
              weeklyGoal={500}
              currentWeekXP={currentWeekXP}
            />
            <LearningInsights
              weeklyXP={currentWeekXP}
              lastWeekXP={lastWeekXP}
              weeklyGoal={500}
              currentStreak={user.currentStreak}
              averageAccuracy={averageAccuracy}
              lessonsCompleted={weeklyLessons}
              exercisesCompleted={weeklyExercises}
            />
          </div>
        </div>

        {/* Bottom Row: Recent Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentActivity activities={recentActivities} />

          {user.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {user.achievements.map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <span className="text-3xl">
                        {userAchievement.achievement.icon || "🏆"}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          {userAchievement.achievement.name}
                        </div>
                        <div className="text-xs text-foreground-light">
                          {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {user.achievements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link href="/dashboard/achievements" className="block text-center">
                      <Button variant="outline" className="w-full">
                        View All Achievements
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Explore More</CardTitle>
              <CardDescription>Discover all Volo features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/stories">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm">Stories</span>
                  </Button>
                </Link>
                <Link href="/grammar">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-sm">Grammar</span>
                  </Button>
                </Link>
                <Link href="/pronunciation">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <Mic className="h-5 w-5" />
                    <span className="text-sm">Pronunciation</span>
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm">Leaderboard</span>
                  </Button>
                </Link>
                <Link href="/quests">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <Gift className="h-5 w-5" />
                    <span className="text-sm">Quests</span>
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-sm">Shop</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-2">
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </DashboardClient>
  );
}

