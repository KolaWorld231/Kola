"use client";
import React, { useEffect, useState } from "react";

export default function AchievementsGallery({ userId }: { userId?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const url = userId ? `/api/achievements?userId=${userId}` : `/api/achievements`;
    fetch(url).then((r) => r.json()).then((d) => setItems(d.achievements || [])).catch(() => setItems([]));
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" />
        </svg>
        Achievements
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {!mounted ? (
          <div className="text-sm text-gray-400">Loading achievements...</div>
        ) : (
          <>
            {items.map((a) => (
              <div key={a.code} className={`p-3 rounded border flex flex-col gap-2 items-start ${a.unlocked ? 'border-yellow-300 bg-yellow-50 ring-1 ring-yellow-200' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-9 h-9 flex items-center justify-center rounded-full ${a.unlocked ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15 8l6 .5-4.5 3.9L19 20l-7-4-7 4 2.5-7.6L4 8.5 10 8 12 2z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex-1 text-sm font-medium">{a.name}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1 w-full">{a.description}</div>
              </div>
            ))}
            {items.length === 0 && <div className="text-sm text-gray-400">No achievements yet</div>}
          </>
        )}
      </div>
    </div>
  );
}
