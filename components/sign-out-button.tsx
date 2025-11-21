"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  className?: string;
}

export function SignOutButton({ variant = "outline", className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/signin",
      redirect: true,
    });
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  );
}
