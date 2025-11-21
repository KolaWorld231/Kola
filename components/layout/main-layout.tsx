"use client";

import { useSession } from "next-auth/react";
import { NavSidebar } from "./nav-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const { data: session } = useSession();
  const shouldShowSidebar = showSidebar && !!session;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background-darkMode">
      {shouldShowSidebar ? (
        <div className="flex flex-1">
          {/* Sidebar */}
          <NavSidebar />
          {/* Main Content */}
          <div className="flex-1 ml-64 flex flex-col min-w-0">
            {/* Top Header Bar */}
            <div className="sticky top-0 z-30 bg-white dark:bg-background-darkMode border-b border-gray-200 dark:border-border-darkMode px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-liberian-blue text-white flex items-center justify-center text-sm font-bold">
                      {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900 dark:text-foreground-darkMode">
                      {session?.user?.name || "Learner"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* User stats could go here */}
                </div>
              </div>
            </div>
            {/* Page Content */}
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      ) : (
        <>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </>
      )}
    </div>
  );
}

