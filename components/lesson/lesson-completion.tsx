"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Trophy, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
  xpReward: number;
}

interface LessonCompletionProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  score: {
    correct: number;
    total: number;
  };
  xpEarned: number;
  achievements: Achievement[];
}

export function LessonCompletion({
  isOpen,
  onClose,
  lessonTitle,
  score,
  xpEarned,
  achievements,
}: LessonCompletionProps) {
  const accuracy = Math.round((score.correct / score.total) * 100);
  const isPerfect = score.correct === score.total;
  const isExcellent = accuracy >= 90;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="text-center py-6">
        {/* Celebration Header */}
        <div className="mb-6">
          <div
            className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 relative",
              isPerfect
                ? "bg-success/20 border-4 border-success"
                : isExcellent
                ? "bg-accent/20 border-4 border-accent"
                : "bg-primary/20 border-4 border-primary"
            )}
          >
            {isPerfect && (
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-pulse" />
            )}
            <CheckCircle2
              className={cn(
                "h-14 w-14",
                isPerfect
                  ? "text-success"
                  : isExcellent
                  ? "text-accent"
                  : "text-primary"
              )}
            />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            {isPerfect ? "Perfect Score! 🎉" : "Lesson Complete! 🎉"}
          </h2>
          <p className="text-foreground-light text-lg">
            Great job completing &quot;{lessonTitle}&quot;
          </p>
          {isPerfect && (
            <p className="text-sm text-accent font-medium mt-2">
              Flawless! You got every question right! ⭐
            </p>
          )}
        </div>

        {/* Score Summary */}
        <Card className="mb-6 border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-foreground-light mb-1 uppercase tracking-wide">
                  Score
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {score.correct}
                  <span className="text-xl text-foreground-light">/{score.total}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-light mb-1 uppercase tracking-wide flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  XP Earned
                </div>
                <div className="text-3xl font-bold text-success">
                  +{xpEarned}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-light mb-1 uppercase tracking-wide">
                  Accuracy
                </div>
                <div
                  className={cn(
                    "text-3xl font-bold",
                    accuracy >= 90
                      ? "text-success"
                      : accuracy >= 70
                      ? "text-accent"
                      : "text-primary"
                  )}
                >
                  {accuracy}%
                </div>
              </div>
            </div>

            {/* Progress Bar for Visual Feedback */}
            <div className="mt-4">
              <div className="w-full bg-background-dark rounded-full h-3 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    accuracy >= 90
                      ? "bg-success"
                      : accuracy >= 70
                      ? "bg-accent"
                      : "bg-primary"
                  )}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Unlocked */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">
                Achievements Unlocked!
              </h3>
            </div>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="border-accent/50 bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl flex-shrink-0">
                        {achievement.icon || "🏆"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-foreground text-lg">
                          {achievement.name}
                        </div>
                        <div className="text-sm text-foreground-light flex items-center gap-2 mt-1">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="font-medium text-success">
                            +{achievement.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <Button onClick={onClose} size="lg" className="w-full" autoFocus>
          Continue Learning
        </Button>
      </div>
    </Modal>
  );
}







