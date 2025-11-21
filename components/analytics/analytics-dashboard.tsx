"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  Award,
  BarChart3,
  Activity,
  Calendar,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
}

interface AnalyticsDashboardProps {
  selectedLanguage: Language | null;
}

interface AnalyticsData {
  period: string;
  xp: {
    total: number;
    average: number;
    entries: number;
  };
  lessons: {
    completed: number;
    averageAccuracy: number;
  };
  exercises: {
    completed: number;
    totalXP: number;
  };
  languageProgress?: {
    completedLessons: number;
    totalLessons: number;
    completedUnits: number;
    totalUnits: number;
    progressPercentage: number;
    averageAccuracy: number;
  } | null;
  dailyXPBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, { count: number; totalXP: number }>;
  vocabulary: {
    total: number;
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
    streakBonus: number;
  };
  timeSpent: {
    minutes: number;
    hours: number;
  };
}

export function AnalyticsDashboard({ selectedLanguage }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorMessage
        title="Error loading analytics"
        message={error || "No data available"}
        onRetry={fetchAnalytics}
      />
    );
  }

  const periodLabels = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    all: "All Time",
  };

  // Prepare daily XP chart data
  const dailyXPEntries = Object.entries(data.dailyXPBreakdown)
    .map(([date, xp]) => ({ date, xp }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const maxDailyXP = Math.max(...dailyXPEntries.map((d) => d.xp), 1);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(["7d", "30d", "90d", "all"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {data.xp.total.toLocaleString()}
            </div>
            <div className="text-xs text-foreground-light mt-1">
              {data.xp.entries} entries • Avg {data.xp.average} XP
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Lessons Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data.lessons.completed}
            </div>
            <div className="text-xs text-foreground-light mt-1">
              {data.lessons.averageAccuracy}% avg accuracy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Exercises Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {data.exercises.completed}
            </div>
            <div className="text-xs text-foreground-light mt-1">
              {data.exercises.totalXP} XP earned
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-success" />
              Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {data.timeSpent.hours > 0
                ? `${data.timeSpent.hours}h ${data.timeSpent.minutes % 60}m`
                : `${data.timeSpent.minutes}m`}
            </div>
            <div className="text-xs text-foreground-light mt-1">
              Estimated learning time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Progress */}
      {data.languageProgress && selectedLanguage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {selectedLanguage.name} Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-light">Course Progress</span>
                <span className="font-medium text-foreground">
                  {Math.round(data.languageProgress.progressPercentage)}%
                </span>
              </div>
              <ProgressBar
                value={data.languageProgress.progressPercentage}
                variant="default"
                className="h-3"
              />
              <div className="text-xs text-foreground-light">
                {data.languageProgress.completedLessons} /{" "}
                {data.languageProgress.totalLessons} lessons completed
              </div>
            </div>

            {/* Units and Lessons Breakdown */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <div className="text-sm font-medium text-foreground-light mb-1">
                  Units
                </div>
                <div className="text-2xl font-bold text-primary">
                  {data.languageProgress.completedUnits} /{" "}
                  {data.languageProgress.totalUnits}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground-light mb-1">
                  Average Accuracy
                </div>
                <div className="text-2xl font-bold text-success">
                  {data.languageProgress.averageAccuracy}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily XP Chart */}
      {dailyXPEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              Daily XP Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyXPEntries.slice(-14).map((entry) => {
                const date = new Date(entry.date);
                const progress = (entry.xp / maxDailyXP) * 100;

                return (
                  <div key={entry.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-light">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="font-medium text-foreground">
                        {entry.xp} XP
                      </span>
                    </div>
                    <ProgressBar
                      value={progress}
                      variant="default"
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Breakdown */}
      {Object.keys(data.sourceBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              XP by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.sourceBreakdown)
                .sort((a, b) => b[1].totalXP - a[1].totalXP)
                .map(([source, stats]) => {
                  const sourceLabel =
                    source === "exercise"
                      ? "Exercises"
                      : source === "lesson"
                      ? "Lessons"
                      : source === "challenge"
                      ? "Challenges"
                      : source === "achievement"
                      ? "Achievements"
                      : source === "streak"
                      ? "Streak Bonus"
                      : source.charAt(0).toUpperCase() + source.slice(1);

                  const percentage =
                    data.xp.total > 0
                      ? (stats.totalXP / data.xp.total) * 100
                      : 0;

                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-light">
                          {sourceLabel}
                        </span>
                        <span className="font-medium text-foreground">
                          {stats.totalXP} XP ({stats.count} {stats.count === 1 ? "entry" : "entries"})
                        </span>
                      </div>
                      <ProgressBar
                        value={percentage}
                        variant="default"
                        className="h-2"
                      />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak & Vocabulary Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Streak Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground-light">Current Streak</span>
              <span className="text-xl font-bold text-primary">
                {data.streaks.currentStreak} 🔥
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-light">Longest Streak</span>
              <span className="text-xl font-bold text-foreground">
                {data.streaks.longestStreak} 🔥
              </span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-sm text-foreground-light">
                Current streak bonus
              </div>
              <div className="text-2xl font-bold text-success">
                +{data.streaks.streakBonus}% XP
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedLanguage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary mb-2">
                {data.vocabulary.total} words
              </div>
              <div className="text-sm text-foreground-light">
                Available in {selectedLanguage.name} vocabulary
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

