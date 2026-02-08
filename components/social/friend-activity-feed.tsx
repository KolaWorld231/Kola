"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Trophy, BookOpen, Flame, Target, Award, Activity, TrendingUp } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FriendActivity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    totalXP: number;
    currentStreak: number;
  };
}

interface FriendActivityFeedProps {
  friendId: string;
  className?: string;
}

export function FriendActivityFeed({ friendId, className }: FriendActivityFeedProps) {
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [friendId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/social/feed?friendId=${friendId}&limit=10`);
      if (!response.ok) {
        throw new Error("Failed to fetch friend activities");
      }
      const data = await response.json();
      // Filter activities for this specific friend
      const friendActivities = (data.activities || []).filter(
        (activity: FriendActivity) => activity.userId === friendId
      );
      setActivities(friendActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching friend activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-4 w-4 text-liberian-gold" />;
      case "lesson_completed":
        return <BookOpen className="h-4 w-4 text-liberian-blue" />;
      case "streak_milestone":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "challenge_won":
        return <Target className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error loading activities"
        message={error}
        onRetry={fetchActivities}
        className={className}
      />
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>What this friend has been up to</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-border-darkMode hover:bg-gray-50 dark:hover:bg-background-darkModeSecondary transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground dark:text-foreground-darkMode">
                  {activity.title}
                </p>
                <p className="text-xs text-foreground-light dark:text-foreground-darkModeLight mt-0.5">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


