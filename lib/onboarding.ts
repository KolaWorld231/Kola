import { prisma } from "@/lib/prisma";

/**
 * Check if a user has completed the onboarding assessment
 * Returns true if onboarding is completed, false otherwise
 * 
 * @param userId - The user ID to check
 * @returns Promise<boolean> - true if onboarding completed, false otherwise
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { assessmentCompleted: true },
    });

    // UserSettings doesn't exist = new user = hasn't completed onboarding
    if (!userSettings) {
      return false;
    }

    // Explicitly check assessmentCompleted flag
    // Only return true if explicitly set to true
    return userSettings.assessmentCompleted === true;
  } catch (error) {
    console.error("[ONBOARDING] Error checking onboarding status:", error);
    // On error, default to false (show onboarding) for safety
    return false;
  }
}

/**
 * Get the appropriate redirect URL based on onboarding status
 * For new users (not completed): returns "/onboarding"
 * For returning users (completed): returns "/dashboard"
 * 
 * @param userId - The user ID to check
 * @returns Promise<string> - The redirect URL
 */
export async function getOnboardingRedirect(userId: string): Promise<string> {
  const completed = await hasCompletedOnboarding(userId);
  return completed ? "/dashboard" : "/onboarding";
}

