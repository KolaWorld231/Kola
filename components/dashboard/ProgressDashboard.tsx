"use client";
import React, { useEffect, useState } from "react";
import StreakWidget from "@/components/dashboard/StreakWidget";
import Link from "next/link";

type Streak = {
  id: string;
  currentStreak: number;
  longestStreak: number;
};

type Achievement = {
  id: string;
  code: string;
  name: string;
  unlocked?: boolean;
};

export default function ProgressDashboard({ userId }: { userId?: string }) {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!userId) return;
    fetch(`/api/streaks?userId=${userId}`).then((r) => r.json()).then((d) => setStreak(d.streak || null)).catch(() => {});
    fetch(`/api/achievements?userId=${userId}`).then((r) => r.json()).then((d) => setAchievements(d.achievements || [])).catch(() => {});
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Progress
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <StreakWidget current={streak?.currentStreak || 0} longest={streak?.longestStreak || 0} />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Achievements</div>
              <div className="text-lg font-semibold">{achievements.length} total</div>
            </div>
            <div>
              <Link href="/achievements" className="text-sm text-blue-600">View all</Link>
            </div>
          </div>
          {!mounted ? (
            <div className="mt-3 text-sm text-gray-400">Loading achievements...</div>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-3">
              {achievements.slice(0, 6).map((a) => (
                <li key={a.id} className={`flex flex-col items-start gap-1 p-3 rounded shadow-sm transform transition-all hover:-translate-y-0.5 ${a.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-white border border-gray-100'}`}>
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${a.unlocked ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15 8l6 .5-4.5 3.9L19 20l-7-4-7 4 2.5-7.6L4 8.5 10 8 12 2z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="flex-1 text-sm font-medium">{a.name}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 w-full">{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                </li>
              ))}
              {achievements.length === 0 && <li className="text-sm text-gray-400">No achievements yet</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
