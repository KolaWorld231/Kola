"use client";
import React from "react";

export default function StreakWidget({ current = 0, longest = 0 }: { current?: number; longest?: number }) {
  return (
    <div className="p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 8 7 8 10C8 13.3137 10.6863 16 14 16C15.1046 16 16 16.8954 16 18C16 19.1046 15.1046 20 14 20C10.6863 20 8 16.3137 8 13C8 9 12 6 12 2Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-600">Current Streak</div>
            <div className="text-2xl font-extrabold flex items-baseline gap-2">
              <span className={`${current > 0 ? 'text-red-600 animate-pulse font-extrabold' : ''}`}>{current}</span>
              <span className="text-base font-medium text-gray-700">days</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Longest</div>
          <div className="text-lg font-semibold">{longest}d</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">Keep your streak by practicing every day — short sessions count!</div>
    </div>
  );
}
