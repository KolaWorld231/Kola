"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TrendingUp } from "lucide-react";

interface DailyXP {
  date: string;
  xp: number;
}

interface ProgressChartProps {
  title: string;
  dailyXP: DailyXP[];
  weeklyGoal?: number;
  currentWeekXP?: number;
}

export function ProgressChart({
  title,
  dailyXP,
  weeklyGoal = 500,
  currentWeekXP = 0,
}: ProgressChartProps) {
  const maxXP = Math.max(...dailyXP.map((d) => d.xp), weeklyGoal);
  const progress = weeklyGoal > 0 ? (currentWeekXP / weeklyGoal) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-foreground-light">
              {currentWeekXP} / {weeklyGoal} XP
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Weekly Goal Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-light">Weekly Goal</span>
              <span className="font-medium text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar value={progress} variant="success" />
          </div>

          {/* Daily XP Chart */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground-light mb-3">
              Daily Activity (Last 7 Days)
            </div>
            <div className="flex items-end justify-between gap-1 h-32">
              {dailyXP.map((day, index) => {
                const height = maxXP > 0 ? (day.xp / maxXP) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:opacity-80 relative group"
                      style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                      title={`${day.date}: ${day.xp} XP`}
                    >
                      {day.xp > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground dark:bg-foreground-darkMode text-background dark:text-background-darkMode text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                          {day.xp} XP
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-foreground-light dark:text-foreground-darkModeLight">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



