"use client";

import { SessionProvider } from "next-auth/react";
import { ReactQueryProvider } from "@/lib/react-query";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      <ThemeProvider>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
