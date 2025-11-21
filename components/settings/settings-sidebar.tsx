"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SettingsLink {
  href: string;
  label: string;
  section?: string;
}

const accountLinks: SettingsLink[] = [
  { href: "/settings/preferences", label: "Preferences", section: "account" },
  { href: "/settings/profile", label: "Profile", section: "account" },
  { href: "/settings/notifications", label: "Notifications", section: "account" },
  { href: "/settings/courses", label: "Courses", section: "account" },
  { href: "/settings/privacy", label: "Privacy settings", section: "account" },
];

const subscriptionLinks: SettingsLink[] = [
  { href: "/shop", label: "Choose a plan", section: "subscription" },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Account</h3>
        <nav className="space-y-1">
          {accountLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-gray-100 text-liberian-blue font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-liberian-red"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Subscription</h3>
        <nav className="space-y-1">
          {subscriptionLinks.map((link) => {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-liberian-red transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Support Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Support</h3>
        <nav className="space-y-1">
          <a
            href="/help"
            className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-liberian-red transition-colors"
          >
            Help Center
          </a>
        </nav>
      </div>
    </div>
  );
}

