import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { hasCompletedOnboarding } from "@/lib/onboarding";

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

  if (completed) {
    // User has completed onboarding - redirect to dashboard immediately
    // This prevents returning users from seeing onboarding
    console.log("[ONBOARDING] User has completed onboarding, redirecting to dashboard");
    redirect("/dashboard");
  }

  // User hasn't completed onboarding - allow access to onboarding page
  // This is a first-time user or a user who hasn't finished onboarding yet
  console.log("[ONBOARDING] User has not completed onboarding, allowing access");
  return <>{children}</>;
}


