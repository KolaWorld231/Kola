"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningInsightsProps {
  weeklyXP: number;
  lastWeekXP: number;
  weeklyGoal: number;
  currentStreak: number;
  averageAccuracy: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
}

export function LearningInsights({
  weeklyXP,
  lastWeekXP,
  weeklyGoal,
  currentStreak: _currentStreak,
  averageAccuracy,
  lessonsCompleted,
  exercisesCompleted,
}: LearningInsightsProps) {
  const xpChange = weeklyXP - lastWeekXP;
  const xpChangePercent = lastWeekXP > 0 ? Math.round((xpChange / lastWeekXP) * 100) : 0;
  const weeklyProgress = weeklyGoal > 0 ? Math.round((weeklyXP / weeklyGoal) * 100) : 0;

  const insights = [
    {
      icon: TrendingUp,
      title: "Weekly Progress",
      value: `${weeklyProgress}%`,
      description: `${weeklyXP} / ${weeklyGoal} XP`,
      trend: xpChange,
      color: weeklyProgress >= 80 ? "text-green-600" : weeklyProgress >= 50 ? "text-yellow-600" : "text-red-600",
    },
    {
      icon: Target,
      title: "Accuracy",
      value: `${Math.round(averageAccuracy)}%`,
      description: "Average lesson accuracy",
      trend: null,
      color: averageAccuracy >= 80 ? "text-green-600" : averageAccuracy >= 60 ? "text-yellow-600" : "text-red-600",
    },
    {
      icon: BookOpen,
      title: "Lessons",
      value: `${lessonsCompleted}`,
      description: "Completed this week",
      trend: null,
      color: "text-liberian-blue",
    },
    {
      icon: Zap,
      title: "Exercises",
      value: `${exercisesCompleted}`,
      description: "Completed this week",
      trend: null,
      color: "text-liberian-gold",
    },
  ];

  const getTrendIcon = (trend: number | null) => {
    if (trend === null) return null;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendText = (trend: number | null) => {
    if (trend === null) return null;
    const absTrend = Math.abs(trend);
    if (trend > 0) return `+${absTrend} XP from last week`;
    if (trend < 0) return `${absTrend} XP less than last week`;
    return "Same as last week";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-liberian-gold" />
          Learning Insights
        </CardTitle>
        <CardDescription>Your weekly performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 dark:border-border-darkMode bg-gray-50/50 dark:bg-background-darkModeSecondary hover:bg-gray-50 dark:hover:bg-background-darkMode transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", insight.color)} />
                    <span className="text-sm font-medium text-gray-700 dark:text-foreground-darkMode">{insight.title}</span>
                  </div>
                  {getTrendIcon(insight.trend)}
                </div>
                <div className={cn("text-2xl font-bold mb-1", insight.color)}>
                  {insight.value}
                </div>
                <p className="text-xs text-gray-600 dark:text-foreground-darkModeLight mb-1">{insight.description}</p>
                {insight.trend !== null && (
                  <p className="text-xs text-gray-500 dark:text-foreground-darkModeMuted">
                    {getTrendText(insight.trend)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-border-darkMode">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-foreground-darkMode">XP Change</p>
              <p className="text-xs text-gray-500 dark:text-foreground-darkModeMuted">
                {xpChangePercent > 0 ? "↑" : xpChangePercent < 0 ? "↓" : "→"} {Math.abs(xpChangePercent)}%
              </p>
            </div>
            <div className={cn(
              "text-lg font-bold",
              xpChange > 0 ? "text-green-600" : xpChange < 0 ? "text-red-600" : "text-gray-600 dark:text-foreground-darkModeLight"
            )}>
              {xpChange > 0 ? "+" : ""}{xpChange} XP
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

