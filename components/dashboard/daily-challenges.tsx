"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Target, CheckCircle2, Trophy, BookOpen, Activity } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface ChallengeProgress {
  challengeId: string;
  type: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  rewardXP: number;
  rewardClaimed: boolean;
}

interface DailyChallengesProps {
  className?: string;
}

export function DailyChallenges({ className }: DailyChallengesProps) {
  const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/challenges/daily");
      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }

      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching challenges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "xp":
        return <Target className="h-5 w-5" />;
      case "lessons":
        return <BookOpen className="h-5 w-5" />;
      case "practice":
        return <Activity className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getChallengeLabel = (type: string) => {
    switch (type) {
      case "xp":
        return "Earn XP";
      case "lessons":
        return "Complete Lessons";
      case "practice":
        return "Practice Exercises";
      default:
        return "Challenge";
    }
  };

  const getChallengeUnit = (type: string) => {
    switch (type) {
      case "xp":
        return "XP";
      case "lessons":
        return "lessons";
      case "practice":
        return "exercises";
      default:
        return "";
    }
  };

  const handleClaimReward = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/claim`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to claim reward");
      }

      // Refresh challenges
      await fetchChallenges();
    } catch (err) {
      console.error("Error claiming reward:", err);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
            const remaining = Math.max(challenge.target - challenge.progress, 0);

            return (
              <div
                key={challenge.challengeId}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  challenge.isCompleted
                    ? "bg-success/10 dark:bg-success/20 border-success dark:border-success/50"
                    : "bg-background-dark dark:bg-background-darkModeSecondary border-border dark:border-border-darkMode"
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      challenge.isCompleted
                        ? "bg-success text-white"
                        : "bg-primary/10 dark:bg-primary/20 text-primary"
                    )}
                  >
                    {getChallengeIcon(challenge.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground dark:text-foreground-darkMode">
                        {getChallengeLabel(challenge.type)}
                      </h3>
                      {challenge.isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-foreground-light dark:text-foreground-darkModeLight">
                      {challenge.isCompleted
                        ? "Completed!"
                        : `${remaining} ${getChallengeUnit(challenge.type)} to go`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-foreground dark:text-foreground-darkMode">
                      +{challenge.rewardXP} XP
                    </div>
                    <div className="text-xs text-foreground-light dark:text-foreground-darkModeLight">Reward</div>
                  </div>
                </div>

                <ProgressBar
                  value={progress}
                  variant={challenge.isCompleted ? "success" : "default"}
                  className="h-2 mb-2"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-light dark:text-foreground-darkModeLight">
                    {challenge.progress} / {challenge.target}{" "}
                    {getChallengeUnit(challenge.type)}
                  </span>
                  {challenge.isCompleted && !challenge.rewardClaimed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClaimReward(challenge.challengeId)}
                      className="h-7 text-xs"
                    >
                      Claim Reward
                    </Button>
                  )}
                  {challenge.rewardClaimed && (
                    <span className="text-success font-medium">
                      ✓ Reward Claimed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

