import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  toastQueue: Toast[];
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  mobileNavOpen: false,
  toastQueue: [],

  setSidebarOpen: (open) =>
    set({
      sidebarOpen: open,
    }),

  setMobileNavOpen: (open) =>
    set({
      mobileNavOpen: open,
    }),

  showToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toastQueue: [...state.toastQueue, { ...toast, id, duration: toast.duration || 3000 }],
    }));

    // Auto-remove toast after duration
    setTimeout(() => {
      set((state) => ({
        toastQueue: state.toastQueue.filter((t) => t.id !== id),
      }));
    }, toast.duration || 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),
}));







