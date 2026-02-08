import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { isAdmin } from "@/lib/admin";

/**
 * Server-side layout that protects the onboarding route
 * 
 * Protection logic:
 * 1. Must be authenticated - redirect to signin if not
 * 2. If user has completed onboarding - redirect to dashboard (never show onboarding again)
 * 3. If user hasn't completed onboarding - allow access
 * 
 * This ensures onboarding is ONLY shown to first-time users who haven't completed the assessment
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Must be authenticated to access onboarding
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user has already completed onboarding
  // This is the critical check - if completed, user should NEVER see onboarding again
  const completed = await hasCompletedOnboarding(session.user.id);
  const isUserAdmin = await isAdmin(session.user.id);

  if (completed || isUserAdmin) {
    // User has completed onboarding OR is admin - redirect to dashboard
    // Admins should NOT go through onboarding process
    console.log("[ONBOARDING] User has completed onboarding OR is admin, redirecting to dashboard", { isAdmin: isUserAdmin });
    redirect("/dashboard");
  }

  // Only allow access for regular users who haven't completed onboarding
  console.log("[ONBOARDING] User has not completed onboarding, allowing access");
  return <>{children}</>;
}


