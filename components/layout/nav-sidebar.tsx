"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Gift, User, MoreVertical, BookOpen, Lightbulb, Mic, Users, UsersRound, Award } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "LEARN", icon: Home, exact: false },
  { href: "/stories", label: "STORIES", icon: BookOpen },
  { href: "/grammar", label: "GRAMMAR", icon: Lightbulb },
  { href: "/pronunciation", label: "PRONUNCIATION", icon: Mic },
  { href: "/friends", label: "FRIENDS", icon: Users },
  { href: "/study-groups", label: "STUDY GROUPS", icon: UsersRound },
  { href: "/leaderboard", label: "LEADERBOARDS", icon: Trophy },
  { href: "/achievements", label: "ACHIEVEMENTS", icon: Award },
  { href: "/quests", label: "QUESTS", icon: Gift },
  { href: "/shop", label: "SHOP", icon: BookOpen },
  { href: "/profile", label: "PROFILE", icon: User },
  { href: "/settings", label: "MORE", icon: MoreVertical },
];

export function NavSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-background-darkMode border-r border-gray-200 dark:border-border-darkMode z-40 overflow-y-auto">
      {/* Mobile sidebar would go here */}
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-border-darkMode">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size="md" />
            <span className="text-xl font-bold text-liberian-red dark:text-liberian-red">Volo</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-liberian-blue/10 dark:bg-liberian-blue/20 text-liberian-blue border-l-4 border-liberian-blue"
                    : "text-gray-700 dark:text-foreground-darkModeLight hover:bg-gray-100 dark:hover:bg-background-darkModeSecondary hover:text-liberian-red"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-liberian-blue" : "text-gray-500 dark:text-foreground-darkModeLight")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 dark:border-border-darkMode">
          <div className="text-xs text-gray-500 dark:text-foreground-darkModeLight text-center">
            <p>🇱🇷 Volo</p>
            <p className="mt-1">Learn Liberian Languages</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

