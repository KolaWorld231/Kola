import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyGoalProps {
  currentXP: number;
  goalXP: number;
  completed?: boolean;
  streakBonus?: number;
}

export function DailyGoal({
  currentXP,
  goalXP = 50,
  completed = false,
  streakBonus = 0,
}: DailyGoalProps) {
  const progress = Math.min((currentXP / goalXP) * 100, 100);
  const remainingXP = Math.max(goalXP - currentXP, 0);

  return (
    <Card className={cn(completed && "border-success")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Daily Goal
          {completed && (
            <CheckCircle2 className="h-5 w-5 text-success ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-light">
                {completed ? "Goal completed!" : `${remainingXP} XP to go`}
              </span>
              <span className="font-medium text-foreground">
                {currentXP} / {goalXP} XP
              </span>
            </div>
            <ProgressBar
              value={progress}
              variant={completed ? "success" : "default"}
              className="h-3"
            />
          </div>
          {streakBonus > 0 && (
            <div className="p-3 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent dark:border-accent/30">
              <div className="text-sm font-medium text-foreground dark:text-foreground-darkMode">
                🔥 Streak Bonus: +{streakBonus} XP
              </div>
              <div className="text-xs text-foreground-light dark:text-foreground-darkModeLight mt-1">
                Keep your streak going for bonus XP!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

