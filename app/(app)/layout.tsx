import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { NavSidebar } from "@/components/layout/nav-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/**
 * App layout for authenticated users
 * 
 * Protection logic:
 * 1. Must be authenticated - redirect to signin if not
 * 2. If user hasn't completed onboarding - redirect to onboarding (first-time users)
 * 3. If user has completed onboarding - allow access to app routes
 * 
 * This ensures all app routes require completed onboarding
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user has completed onboarding assessment
  // New users (first-time login) will not have completed this yet
  const completed = await hasCompletedOnboarding(session.user.id);

  if (!completed) {
    // User hasn't completed onboarding - redirect to onboarding
    // This ensures first-time users complete onboarding before accessing app
    console.log("[APP] User has not completed onboarding, redirecting to onboarding");
    redirect("/onboarding");
  }

  // User has completed onboarding - allow access to app routes
  // This is a returning user who has already completed onboarding

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-white">
        {/* Desktop Sidebar */}
        <NavSidebar />
        {/* Main Content */}
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0 pb-16 lg:pb-0">
          {/* Top Header Bar */}
          <TopBar />
          {/* Page Content */}
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </ErrorBoundary>
  );
}

