"use client";

import { SessionProvider } from "next-auth/react";
import { ReactQueryProvider } from "@/lib/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { SoundProvider } from "@/components/sound-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={false} // Prevent flickering from refetching on window focus
      basePath="/api/auth" // Ensure correct base path for NextAuth
    >
      <ThemeProvider>
        <SoundProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </SoundProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
