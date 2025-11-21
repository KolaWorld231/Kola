"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Trophy, Target, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { CreateChallengeModal } from "./create-challenge-modal";

interface Challenge {
  id: string;
  senderId: string;
  receiverId: string;
  type: string;
  target: string | null;
  description: string | null;
  status: string;
  expiresAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    totalXP: number;
    currentStreak: number;
  };
  receiver: {
    id: string;
    name: string | null;
    image: string | null;
    totalXP: number;
    currentStreak: number;
  };
}

interface ChallengesListProps {
  userId?: string;
  type?: "sent" | "received" | "all";
  friends?: Array<{
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    totalXP: number;
    currentStreak: number;
  }>;
}

export function ChallengesList({ userId, type = "all", friends = [] }: ChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"sent" | "received" | "all">(type);

  useEffect(() => {
    fetchChallenges();
  }, [selectedType]);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/challenges?type=${selectedType}`);
      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching challenges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (challengeId: string, action: "accept" | "decline" | "complete") => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} challenge`);
      }

      toast.success(`Challenge ${action}ed successfully!`);
      fetchChallenges();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "declined":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Declined</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <Target className="h-5 w-5 text-liberian-blue" />;
      case "xp":
        return <Trophy className="h-5 w-5 text-liberian-gold" />;
      case "streak":
        return <Zap className="h-5 w-5 text-orange-500" />;
      case "accuracy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "lesson":
        return "Complete Lesson";
      case "xp":
        return "Earn XP";
      case "streak":
        return "Maintain Streak";
      case "accuracy":
        return "Achieve Accuracy";
      default:
        return type;
    }
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage title="Error loading challenges" message={error} onRetry={fetchChallenges} />
    );
  }

  const filteredChallenges = challenges.filter((challenge) => {
    if (selectedType === "sent") return challenge.senderId === userId;
    if (selectedType === "received") return challenge.receiverId === userId;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Challenges
              </CardTitle>
              <CardDescription>Challenge your friends to learn together!</CardDescription>
            </div>
            {friends.length > 0 && (
              <CreateChallengeModal
                friends={friends}
                onChallengeCreated={fetchChallenges}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {(["all", "sent", "received"] as const).map((tabType) => (
              <Button
                key={tabType}
                variant={selectedType === tabType ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(tabType)}
              >
                {tabType === "all" ? "All" : tabType === "sent" ? "Sent" : "Received"}
              </Button>
            ))}
          </div>

          {filteredChallenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {selectedType === "sent"
                  ? "You haven't sent any challenges yet."
                  : selectedType === "received"
                  ? "No challenges received."
                  : "No challenges yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChallenges.map((challenge) => {
                const expired = isExpired(challenge.expiresAt);
                const isReceiver = challenge.receiverId === userId;
                const opponent = isReceiver ? challenge.sender : challenge.receiver;

                return (
                  <Card
                    key={challenge.id}
                    className={
                      challenge.status === "completed"
                        ? "border-green-200 bg-green-50/50"
                        : expired && challenge.status !== "completed"
                        ? "border-red-200 bg-red-50/50"
                        : ""
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(challenge.type)}
                          <div>
                            <h3 className="font-semibold text-lg">{getTypeLabel(challenge.type)}</h3>
                            {challenge.target && (
                              <p className="text-sm text-gray-600">Target: {challenge.target}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(expired && challenge.status !== "completed" ? "expired" : challenge.status)}
                      </div>

                      {challenge.description && (
                        <p className="text-sm text-gray-700 mb-4">{challenge.description}</p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {isReceiver ? "From:" : "To:"}
                          </span>
                          <div className="flex items-center gap-2">
                            {opponent.image ? (
                              <Image
                                src={opponent.image}
                                alt={opponent.name || "User"}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-liberian-blue text-white flex items-center justify-center text-sm font-semibold">
                                {opponent.name?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <span className="font-medium">{opponent.name || "User"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Expires: {new Date(challenge.expiresAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {challenge.status === "completed" && challenge.completedAt && (
                        <div className="mb-4 p-3 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✅ Completed on {new Date(challenge.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {isReceiver && challenge.status === "pending" && !expired && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(challenge.id, "accept")}
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(challenge.id, "decline")}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {isReceiver && challenge.status === "accepted" && !expired && (
                        <div className="flex gap-2">
                          <Link href="/dashboard">
                            <Button size="sm" className="gap-2">
                              <Target className="h-4 w-4" />
                              Start Learning
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(challenge.id, "complete")}
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

