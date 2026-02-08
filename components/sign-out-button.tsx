"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
}

export function SignOutButton({ variant = "outline", className }: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Step 1: Call NextAuth's signOut to clear server-side session
      // This clears the HTTP-only session cookie
      await signOut({
        redirect: false,
        callbackUrl: "/auth/signin",
      });

      // Step 2: Clear all cookies related to NextAuth and sessions
      if (typeof window !== "undefined") {
        // Clear all NextAuth cookies
        const cookiesToClear = [
          "next-auth.session-token",
          "next-auth.csrf-token",
          "__Secure-next-auth.session-token",
          "__Host-next-auth.csrf-token",
          "next-auth.callback-url",
          "__Secure-next-auth.callback-url",
        ];

        cookiesToClear.forEach((cookieName) => {
          // Clear for current path
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          // Clear for root path
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          // Clear without domain (for localhost)
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        // Clear all cookies that might contain session data
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.trim().split("=")[0];
          if (
            cookieName.includes("next-auth") ||
            cookieName.includes("session") ||
            cookieName.includes("auth")
          ) {
            // Clear with various path and domain combinations
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        });

        // Step 3: Clear all client-side storage
        localStorage.clear();
        sessionStorage.clear();

        // Step 4: Clear any cached data in memory
        // Force garbage collection hint (browsers may ignore this)
        if (window.gc) {
          window.gc();
        }
      }

      // Step 5: Force a hard redirect to sign in page
      // Using window.location.replace ensures the current page is removed from history
      // This prevents back button from showing the authenticated state
      window.location.replace("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, force redirect to sign in page
      if (typeof window !== "undefined") {
        window.location.replace("/auth/signin");
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {isSigningOut ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
