"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Target, CheckCircle2, Trophy, BookOpen, Activity, Sparkles, Gift } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  const [completingChallengeId, setCompletingChallengeId] = useState<string | null>(null);
  const previousChallenges = useRef<ChallengeProgress[]>([]);

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

  // Check for newly completed challenges and celebrate
  useEffect(() => {
    challenges.forEach((challenge) => {
      const previous = previousChallenges.current.find((c) => c.challengeId === challenge.challengeId);
      if (challenge.isCompleted && previous && !previous.isCompleted && !challenge.rewardClaimed) {
        // Newly completed! Show celebration
        setTimeout(() => {
          setCompletingChallengeId(challenge.challengeId);
          toast.success("Challenge Complete! 🎉", {
            description: `${getChallengeLabel(challenge.type)} - Claim your ${challenge.rewardXP} XP reward!`,
            duration: 4000,
          });
          setTimeout(() => setCompletingChallengeId(null), 2000);
        }, 500);
      }
    });
    previousChallenges.current = challenges;
  }, [challenges]);

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

      const data = await response.json();
      
      // Show success toast
      toast.success("Reward Claimed! ✨", {
        description: `+${data.rewardXP || 0} XP earned!`,
        icon: "🎁",
        duration: 3000,
      });

      // Refresh challenges
      await fetchChallenges();
    } catch (err) {
      console.error("Error claiming reward:", err);
      toast.error("Failed to claim reward", {
        description: "Please try again later.",
      });
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
          {challenges.map((challenge, index) => {
            const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
            const remaining = Math.max(challenge.target - challenge.progress, 0);
            const isCompleting = completingChallengeId === challenge.challengeId;
            const progressPercent = Math.round(progress);

            return (
              <motion.div
                key={challenge.challengeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden",
                  challenge.isCompleted
                    ? "bg-gradient-to-br from-success/20 to-success/10 dark:from-success/30 dark:to-success/20 border-success dark:border-success/50 shadow-lg"
                    : "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/30 dark:border-primary/40 hover:border-primary/50 hover:shadow-md"
                )}
              >
                {/* Celebration overlay */}
                <AnimatePresence>
                  {isCompleting && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-10 bg-success/20 rounded-xl"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: 2,
                        }}
                      >
                        <Sparkles className="h-16 w-16 text-success" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-0">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <motion.div
                      animate={isCompleting ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        challenge.isCompleted
                          ? "bg-success text-white shadow-lg"
                          : "bg-primary/20 dark:bg-primary/30 text-primary"
                      )}
                    >
                      {getChallengeIcon(challenge.type)}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-base text-foreground dark:text-foreground-darkMode">
                          {getChallengeLabel(challenge.type)}
                        </h3>
                        {challenge.isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                          </motion.div>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm font-medium",
                        challenge.isCompleted
                          ? "text-success dark:text-success"
                          : "text-foreground-light dark:text-foreground-darkModeLight"
                      )}>
                        {challenge.isCompleted
                          ? "🎉 Completed! Claim your reward below"
                          : `${remaining} ${getChallengeUnit(challenge.type)} remaining`}
                      </p>
                    </div>

                    {/* Reward */}
                    <div className="text-right shrink-0">
                      <div className={cn(
                        "flex items-center gap-1 text-lg font-bold",
                        challenge.isCompleted
                          ? "text-success dark:text-success"
                          : "text-foreground dark:text-foreground-darkMode"
                      )}>
                        <Gift className="h-4 w-4" />
                        <span>+{challenge.rewardXP} XP</span>
                      </div>
                      <div className="text-xs text-foreground-light dark:text-foreground-darkModeLight mt-1">
                        Reward
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground-light dark:text-foreground-darkModeLight">
                        Progress
                      </span>
                      <span className={cn(
                        "text-xs font-bold",
                        challenge.isCompleted
                          ? "text-success"
                          : "text-primary"
                      )}>
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="relative">
                      <ProgressBar
                        value={progress}
                        variant={challenge.isCompleted ? "success" : "default"}
                        className="h-3 rounded-full"
                      />
                      {challenge.progress > 0 && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-foreground-light dark:text-foreground-darkModeLight">
                        {challenge.progress} / {challenge.target} {getChallengeUnit(challenge.type)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {challenge.isCompleted && !challenge.rewardClaimed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Button
                        size="sm"
                        onClick={() => handleClaimReward(challenge.challengeId)}
                        className={cn(
                          "w-full font-bold text-sm h-10",
                          "bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70",
                          "text-white shadow-lg hover:shadow-xl",
                          "transition-all duration-300"
                        )}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Claim {challenge.rewardXP} XP Reward
                      </Button>
                    </motion.div>
                  )}

                  {challenge.rewardClaimed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 dark:bg-success/30 text-success font-medium text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Reward Claimed! ✓
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

