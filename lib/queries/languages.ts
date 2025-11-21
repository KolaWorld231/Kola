import { useQuery } from "@tanstack/react-query";
import type { Language } from "@/lib/types";

const API_BASE = "/api";

// Fetch all languages
export function useLanguages() {
  return useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/languages`);
      if (!res.ok) throw new Error("Failed to fetch languages");
      return res.json();
    },
  });
}

// Fetch single language by code
export function useLanguage(code: string) {
  return useQuery<Language>({
    queryKey: ["languages", code],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/languages/${code}`);
      if (!res.ok) throw new Error("Failed to fetch language");
      return res.json();
    },
    enabled: !!code,
  });
}

// Fetch language with units and lessons
export function useLanguageTree(code: string) {
  return useQuery({
    queryKey: ["languages", code, "tree"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/languages/${code}/tree`);
      if (!res.ok) throw new Error("Failed to fetch language tree");
      return res.json();
    },
    enabled: !!code,
  });
}

