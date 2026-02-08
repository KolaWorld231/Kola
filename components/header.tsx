"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { SignOutButton } from "./sign-out-button";
import { Menu, X, User, Trophy, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering session-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only check authentication after component has mounted to prevent hydration errors
  // During SSR, always show unauthenticated state to match initial client render
  // The useSession hook automatically updates when sign-out occurs
  const isAuthenticated = mounted && status === "authenticated" && !!session?.user;

  // Default to unauthenticated links during SSR/initial render to prevent hydration mismatch
  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: BookOpen },
        { href: "/stories", label: "Stories", icon: BookOpen },
        { href: "/friends", label: "Friends", icon: User },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [
        { href: "/learn", label: "Languages", icon: BookOpen },
        { href: "/auth/signin", label: "Sign In", icon: User },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border dark:border-border-darkMode bg-background/95 dark:bg-background-darkMode/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-background-darkMode/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-foreground-light"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {isAuthenticated && session?.user && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <Avatar
                src={session.user.image || undefined}
                name={session.user.name || session.user.email || undefined}
                size="sm"
              />
              <SignOutButton variant="ghost" />
            </div>
          )}

          {!isAuthenticated && (
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-background-dark dark:hover:bg-background-darkModeSecondary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground dark:text-foreground-darkMode" />
          ) : (
            <Menu className="h-6 w-6 text-foreground dark:text-foreground-darkMode" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-border-darkMode bg-background dark:bg-background-darkMode">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20 text-primary"
                      : "text-foreground dark:text-foreground-darkMode hover:bg-background-dark dark:hover:bg-background-darkModeSecondary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && session?.user && (
              <>
                <div className="px-4 py-2 border-t border-border dark:border-border-darkMode mt-2 pt-4">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar
                      src={session.user.image || undefined}
                      name={session.user.name || session.user.email || undefined}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground dark:text-foreground-darkMode truncate">
                        {session.user.name || session.user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pt-2">
                  <SignOutButton variant="outline" className="w-full" />
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="px-4 pt-2 border-t border-border dark:border-border-darkMode mt-2">
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

