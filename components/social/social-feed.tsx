"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Trophy, BookOpen, Flame, Target, Award, Users } from "lucide-react";
import Image from "next/image";

interface SocialActivity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    totalXP: number;
    currentStreak: number;
  };
}

export function SocialFeed() {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  // Auto-refresh feed every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFeed();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/social/feed");
      if (!response.ok) {
        throw new Error("Failed to fetch social feed");
      }
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching social feed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-5 w-5 text-liberian-gold" />;
      case "lesson_completed":
        return <BookOpen className="h-5 w-5 text-liberian-blue" />;
      case "streak_milestone":
        return <Flame className="h-5 w-5 text-orange-500" />;
      case "challenge_won":
        return <Target className="h-5 w-5 text-green-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "bg-liberian-gold/10 border-liberian-gold/20";
      case "lesson_completed":
        return "bg-liberian-blue/10 border-liberian-blue/20";
      case "streak_milestone":
        return "bg-orange-50 border-orange-200";
      case "challenge_won":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage title="Error loading feed" message={error} onRetry={fetchFeed} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Feed
        </CardTitle>
        <CardDescription>See what your friends are learning!</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No activities yet. Add friends to see their progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 border rounded-lg ${getActivityColor(activity.type)} transition-colors hover:shadow-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {activity.user.image ? (
                      <Image
                        src={activity.user.image}
                        alt={activity.user.name || "User"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-liberian-blue text-white flex items-center justify-center font-semibold text-lg">
                        {activity.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getActivityIcon(activity.type)}
                      <h3 className="font-semibold text-lg">{activity.user.name || "User"}</h3>
                      <span className="text-sm text-gray-500">·</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{activity.title}</p>
                    <p className="text-sm text-gray-700 mb-2">{activity.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-liberian-gold" />
                        <span>{activity.user.totalXP.toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span>{activity.user.currentStreak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

