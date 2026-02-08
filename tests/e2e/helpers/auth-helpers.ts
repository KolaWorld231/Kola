/**
 * E2E Test Helpers - Authentication
 * Utilities for authentication flows in E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Generate a test password
 */
export function generateTestPassword(): string {
  return 'TestPassword123!';
}

/**
 * Sign up a new user
 */
export async function signUpUser(
  page: Page,
  options?: {
    email?: string;
    password?: string;
    name?: string;
  }
): Promise<{ email: string; password: string }> {
  const email = options?.email || generateTestEmail();
  const password = options?.password || generateTestPassword();

  // Navigate to sign up page
  await page.goto('/auth/signup');
  await expect(page).toHaveURL(/.*signup/);

  // Fill in sign up form
  if (options?.name) {
    await page.fill('input[name="name"]', options.name);
  }
  await page.fill('input[type="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);

  // Submit form
  await page.click('button:has-text("Sign Up"), button[type="submit"]');
  
  // Wait for redirect (either to onboarding or dashboard)
  await page.waitForURL(/.*onboarding|.*dashboard/, { timeout: 10000 });

  return { email, password };
}

/**
 * Sign in an existing user
 */
export async function signInUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // Navigate to sign in page
  await page.goto('/auth/signin');
  await expect(page).toHaveURL(/.*signin/);

  // Fill in sign in form
  await page.fill('input[type="email"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  
  // Wait for redirect (either to onboarding or dashboard)
  await page.waitForURL(/.*onboarding|.*dashboard/, { timeout: 10000 });
}

/**
 * Complete onboarding flow
 */
export async function completeOnboarding(
  page: Page,
  options?: {
    language?: string;
    level?: string;
    tribe?: string;
    learningGoals?: string[];
    dailyGoal?: number;
  }
): Promise<void> {
  // Wait for onboarding page
  await expect(page).toHaveURL(/.*onboarding/);

  // Step 1: Select language
  await page.waitForSelector('text=Select Your Language,text=Choose Your Language', { timeout: 5000 });
  const language = options?.language || 'Kpelle';
  await page.click(`button:has-text("${language}"), [data-testid="language-card"]`);

  // Step 2: Select level
  await page.waitForSelector('text=What is your current level?,text=Select Your Level', { timeout: 5000 });
  const level = options?.level || 'Beginner';
  await page.click(`button:has-text("${level}")`);

  // Step 3: Select tribe (optional)
  try {
    await page.waitForSelector('text=Select Your Tribe', { timeout: 3000 });
    if (options?.tribe) {
      await page.click(`button:has-text("${options.tribe}")`);
    } else {
      await page.click('button:has-text("Skip")');
    }
  } catch {
    // Tribe step might not exist, continue
  }

  // Step 4: Learning goals (optional)
  try {
    await page.waitForSelector('text=What are your learning goals?,text=Learning Goals', { timeout: 3000 });
    if (options?.learningGoals && options.learningGoals.length > 0) {
      for (const goal of options.learningGoals) {
        await page.click(`button:has-text("${goal}")`);
      }
    }
    await page.click('button:has-text("Next"), button:has-text("Continue")');
  } catch {
    // Goals step might not exist, continue
  }

  // Step 5: Daily goal
  await page.waitForSelector('text=Set Your Daily Goal,text=Daily Goal', { timeout: 5000 });
  if (options?.dailyGoal) {
    // If there's an input for daily goal, fill it
    const goalInput = page.locator('input[name="dailyGoal"], input[type="number"]');
    if (await goalInput.count() > 0) {
      await goalInput.fill(options.dailyGoal.toString());
    }
  }
  await page.click('button:has-text("Complete Setup"), button:has-text("Finish")');

  // Wait for redirect to dashboard
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  await expect(page).toHaveURL(/.*dashboard/);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for auth indicators
    const dashboardLink = page.locator('a:has-text("Dashboard"), [href*="dashboard"]');
    const profileLink = page.locator('a:has-text("Profile"), [href*="profile"]');
    
    const hasDashboard = await dashboardLink.count() > 0;
    const hasProfile = await profileLink.count() > 0;
    
    return hasDashboard || hasProfile;
  } catch {
    return false;
  }
}

/**
 * Sign out user
 */
export async function signOut(page: Page): Promise<void> {
  // Look for sign out button/link
  const signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Sign Out")');
  
  if (await signOutButton.count() > 0) {
    await signOutButton.click();
    await page.waitForURL(/.*auth|.*signin|.*/, { timeout: 5000 });
  }
}


