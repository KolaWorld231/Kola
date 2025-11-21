import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Lock, CheckCircle2, Play, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description?: string | null;
    xpReward: number;
    exerciseCount: number;
  };
  status: "locked" | "unlocked" | "completed";
  progress?: {
    accuracy?: number | null;
    attempts: number;
    isCompleted: boolean;
  };
  onClick?: () => void;
}

export function LessonCard({
  lesson,
  status,
  progress,
  onClick,
}: LessonCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isUnlocked = status === "unlocked";

  const accuracy = progress?.accuracy;
  const attempts = progress?.attempts || 0;

  return (
    <Link
      href={isUnlocked ? `/lesson/${lesson.id}` : "#"}
      onClick={(e) => {
        if (isLocked || onClick) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "block transition-smooth hover-lift",
        isLocked && "pointer-events-none cursor-not-allowed"
      )}
    >
      <Card
        className={cn(
          "h-full transition-all",
          isLocked && "opacity-50 bg-background-dark border-border/50",
          isCompleted &&
            "border-success/50 bg-success/5 hover:border-success",
          isUnlocked &&
            !isCompleted &&
            "border-primary/30 hover:border-primary bg-background hover:shadow-lg"
        )}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isLocked ? (
                <Lock className="h-5 w-5 text-foreground-light flex-shrink-0" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              ) : (
                <Play className="h-5 w-5 text-primary flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    "font-semibold truncate",
                    isCompleted ? "text-foreground" : "text-foreground",
                    isLocked && "text-foreground-light"
                  )}
                >
                  {lesson.title}
                </h3>
              </div>
            </div>
            {isCompleted && (
              <Trophy className="h-4 w-4 text-accent flex-shrink-0" />
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <p className="text-sm text-foreground-light mb-3 line-clamp-2">
              {lesson.description}
            </p>
          )}

          {/* Progress Bar (if started but not completed) */}
          {progress && !isCompleted && attempts > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-foreground-light mb-1">
                <span>Progress</span>
                {accuracy !== null && accuracy !== undefined && (
                  <span>{Math.round(accuracy)}% accuracy</span>
                )}
              </div>
              <ProgressBar
                value={accuracy || 0}
                variant="default"
                className="h-2"
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-foreground-light">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {lesson.exerciseCount} exercises
              </span>
              {attempts > 0 && (
                <span className="text-foreground-light">
                  {attempts} {attempts === 1 ? "attempt" : "attempts"}
                </span>
              )}
            </div>
            <div
              className={cn(
                "font-semibold",
                isCompleted ? "text-success" : "text-secondary"
              )}
            >
              +{lesson.xpReward} XP
            </div>
          </div>

          {/* Accuracy Badge (if completed) */}
          {isCompleted && accuracy !== null && accuracy !== undefined && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-light">Accuracy</span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    accuracy >= 80
                      ? "text-success"
                      : accuracy >= 60
                      ? "text-accent"
                      : "text-foreground-light"
                  )}
                >
                  {Math.round(accuracy)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

