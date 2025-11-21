"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Gift, User, BookOpen, Mic, Lightbulb, Users, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Learn", icon: Home, exact: false },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/grammar", label: "Grammar", icon: Lightbulb },
  { href: "/pronunciation", label: "Pronounce", icon: Mic },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/study-groups", label: "Groups", icon: UsersRound },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/quests", label: "Quests", icon: Gift },
  { href: "/shop", label: "Shop", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="grid grid-cols-5 gap-1 px-2 py-2 overflow-x-auto">
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
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive
                  ? "text-liberian-blue"
                  : "text-gray-600"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-liberian-blue" : "text-gray-500")} />
              <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

