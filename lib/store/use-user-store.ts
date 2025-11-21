import { create } from "zustand";
import type { User, UserState } from "@/lib/types";

// Simple persist middleware (zustand persist requires additional setup)
// For production, use zustand/middleware/persist with storage adapter

interface UserStore extends UserState {
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setIsLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}));

