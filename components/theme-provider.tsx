"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/**
 * Inner component that syncs theme with user settings
 */
function ThemeSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (session?.user?.id && !hasInitialized) {
      // Fetch user's dark mode preference and sync
      fetch("/api/user/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.settings?.darkMode) {
            const userTheme = data.settings.darkMode as "system" | "light" | "dark";
            if (theme !== userTheme) {
              setTheme(userTheme);
            }
            setHasInitialized(true);
          }
        })
        .catch(console.error);
    }
  }, [session, theme, setTheme, hasInitialized]);

  return <>{children}</>;
}

/**
 * Theme provider that syncs with user settings
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="volo-theme"
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}


