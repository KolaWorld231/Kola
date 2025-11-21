"use client";

import { useSession } from "next-auth/react";
import { Flame, Heart, Gem } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationCenter } from "@/components/notifications/notification-center";

export function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    streak: 0,
    hearts: 5,
    gems: 0,
  });

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user stats
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          setUserStats({
            streak: data.currentStreak || 0,
            hearts: data.hearts || 5,
            gems: data.totalXP || 0, // Using XP as gems for now
          });
        })
        .catch(console.error);
    }
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: User Info */}
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/profile")}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-liberian-blue text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/profile")}
            >
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="text-sm">
            <div className="font-semibold text-gray-900">
              {session.user.name || "Learner"}
            </div>
          </div>
        </div>

          {/* Right: Stats & Notifications */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-700">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">{userStats.streak}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Gem className="h-5 w-5 text-liberian-blue" />
              <span className="font-semibold">{userStats.gems.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              <span className="font-semibold">{userStats.hearts}</span>
            </div>
            <NotificationCenter />
          </div>
      </div>
    </div>
  );
}

