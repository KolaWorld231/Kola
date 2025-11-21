"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Trophy, Clock, CheckCircle2, Target, Zap, BookOpen } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

interface Challenge {
  id: string;
  type: string;
  target: number;
  progress: number;
  rewardXP: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/challenges/daily")
        .then((res) => res.json())
        .then((data) => {
          setChallenges(data.challenges || []);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching challenges:", err);
          setIsLoading(false);
        });
    }
  }, [status, router, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get time until reset (next midnight)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const hoursUntilReset = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));

  const challengeIcons = {
    xp: Zap,
    lessons: BookOpen,
    practice: Target,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-liberian-red mb-2 flex items-center gap-3">
            <Gift className="h-10 w-10" />
            Quests
          </h1>
          <p className="text-lg text-gray-600">
            Complete quests to earn rewards and boost your learning
          </p>
        </div>

        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-liberian-red to-liberian-blue mb-8 border-0 shadow-lg">
          <CardContent className="p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                <p className="text-lg opacity-90">Complete quests to earn rewards!</p>
              </div>
              <div className="hidden md:block text-6xl">🎁</div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Daily Quests</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{hoursUntilReset} HOURS</span>
            </div>
          </div>

          <div className="space-y-4">
            {challenges.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">No challenges available yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              challenges.map((challenge) => {
                const Icon = challengeIcons[challenge.type as keyof typeof challengeIcons] || Target;
                const progressPercentage = (challenge.progress / challenge.target) * 100;
                const isCompleted = challenge.isCompleted;

                return (
                  <Card
                    key={challenge.id}
                    className={`border-2 transition-all ${
                      isCompleted
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-liberian-red/30"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-liberian-blue text-white"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {challenge.type === "xp" && "Earn XP"}
                                {challenge.type === "lessons" && "Complete Lessons"}
                                {challenge.type === "practice" && "Practice Exercises"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {challenge.progress} / {challenge.target} completed
                              </p>
                            </div>
                            {isCompleted && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-semibold">Completed!</span>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCompleted
                                    ? "bg-green-500"
                                    : "bg-liberian-red"
                                }`}
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Reward */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-liberian-blue">
                              <Trophy className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                Reward: {challenge.rewardXP} XP
                              </span>
                            </div>
                            {isCompleted && !challenge.rewardClaimed && (
                              <Button
                                size="sm"
                                className="bg-liberian-red hover:bg-liberian-red/90"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/challenges/${challenge.id}/claim`, {
                                      method: "POST",
                                    });
                                    const data = await response.json();
                                    if (response.ok) {
                                      toast.success("Reward claimed!", {
                                        description: data.xpEarned ? `+${data.xpEarned} XP earned` : undefined,
                                      });
                                      // Refresh challenges
                                      fetch("/api/challenges/daily")
                                        .then((res) => res.json())
                                        .then((challengeData) => {
                                          setChallenges(challengeData.challenges || []);
                                        })
                                        .catch(console.error);
                                    } else {
                                      toast.error(data.error || "Failed to claim reward");
                                    }
                                  } catch (error) {
                                    toast.error("An error occurred. Please try again.");
                                  }
                                }}
                              >
                                Claim Reward
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Monthly Challenges Placeholder */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Monthly Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monthly challenges unlock soon!
              </h3>
              <p className="text-gray-600 mb-6">
                Complete each month&apos;s challenge to earn exclusive badges
              </p>
              <Link href="/dashboard">
                <Button className="bg-liberian-blue hover:bg-liberian-blue/90">
                  START A LESSON
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
