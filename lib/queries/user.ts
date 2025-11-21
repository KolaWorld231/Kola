import { useQuery } from "@tanstack/react-query";
import type { User, UserProgress, UserXP, Achievement } from "@/lib/types";

const API_BASE = "/api";

// Fetch current user
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["user", "current"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user`);
      if (!res.ok) return null;
      return res.json();
    },
  });
}

// Fetch user progress
export function useUserProgress(languageId?: string) {
  return useQuery<UserProgress[]>({
    queryKey: ["user", "progress", languageId],
    queryFn: async () => {
      const url = languageId
        ? `${API_BASE}/user/progress?languageId=${languageId}`
        : `${API_BASE}/user/progress`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
  });
}

// Fetch user XP history
export function useUserXP() {
  return useQuery<UserXP[]>({
    queryKey: ["user", "xp"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/xp`);
      if (!res.ok) throw new Error("Failed to fetch XP");
      return res.json();
    },
  });
}

// Fetch user achievements
export function useUserAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["user", "achievements"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/achievements`);
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    },
  });
}

