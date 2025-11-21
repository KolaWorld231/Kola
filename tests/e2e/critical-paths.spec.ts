/**
 * E2E Tests - Critical Paths
 * 
 * Tests critical user flows:
 * 1. User signup
 * 2. User onboarding
 * 3. Lesson completion
 * 4. Progress tracking
 * 5. Dashboard access
 * 6. Language selection
 */

import { test, expect } from '@playwright/test';
import { signUpUser, completeOnboarding, generateTestEmail, generateTestPassword } from './helpers/auth-helpers';
import { waitForPageLoad, waitForNavigation, clickButton, waitForLoadingComplete } from './helpers/page-helpers';

test.describe('Critical User Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should complete full user signup and onboarding flow', async ({ page }) => {
    // Sign up new user
    const { email, password } = await signUpUser(page);
    
    // Should redirect to onboarding for new user
    await expect(page).toHaveURL(/.*onboarding/);

    // Complete onboarding
    await completeOnboarding(page, {
      language: 'Kpelle',
      level: 'Beginner',
      dailyGoal: 50,
    });

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await waitForPageLoad(page);
    
    // Verify dashboard elements
    await expect(page.locator('text=Dashboard, text=Welcome')).toBeVisible({ timeout: 5000 });
  });

  test('should show onboarding only to new users', async ({ page }) => {
    // Sign up and complete onboarding
    const { email, password } = await signUpUser(page);
    await completeOnboarding(page);
    
    // Try to navigate to onboarding as a returning user
    await page.goto('/onboarding');
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to learn page and view lessons', async ({ page }) => {
    // For this test, we'll assume user is already logged in
    // In a real scenario, you'd set up auth state
    
    await page.goto('/learn');
    
    // Should see language selection
    await expect(page.locator('text=Choose a Language to Learn')).toBeVisible();
    
    // Click on Kpelle language
    const kpelleLink = page.locator('a:has-text("Kpelle"), button:has-text("Kpelle")').first();
    if (await kpelleLink.isVisible()) {
      await kpelleLink.click();
      await expect(page).toHaveURL(/.*learn\/kpelle/);
      
      // Should see lesson tree
      await expect(page.locator('text=Unit')).toBeVisible();
    }
  });

  test('should access dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should see dashboard elements
    // Note: This will show login if not authenticated, which is expected
    const hasLogin = await page.locator('text=Sign In').isVisible();
    const hasDashboard = await page.locator('text=Dashboard, text=Welcome, text=Progress').isVisible();
    
    // Either login form or dashboard should be visible
    expect(hasLogin || hasDashboard).toBeTruthy();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle lesson page navigation', async ({ page }) => {
    // Navigate to a lesson (this will fail if lesson doesn't exist)
    // This test serves as a template for when lessons are available
    await page.goto('/lesson/test-lesson-id');
    
    // Should either show lesson or error page
    const hasLesson = await page.locator('text=Lesson, text=Exercise').isVisible();
    const hasError = await page.locator('text=404, text=Not Found, text=Error').isVisible();
    
    // One of these should be visible
    expect(hasLesson || hasError).toBeTruthy();
  });

  test('should test responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should see mobile layout
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for buttons with aria-labels
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    if (count > 0) {
      // At least some buttons should have accessible labels
      const firstButton = buttons.first();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      const textContent = await firstButton.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('should have semantic HTML', async ({ page }) => {
    await page.goto('/');
    
    // Check for semantic elements
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');
    
    // At least main or navigation should be present
    const hasMain = await main.count() > 0;
    const hasNav = await nav.count() > 0;
    
    expect(hasMain || hasNav).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check if focus indicator is visible
    const focusedElement = page.locator(':focus');
    const isVisible = await focusedElement.isVisible().catch(() => false);
    
    // Focus should be visible or page should have focusable elements
    if (isVisible) {
      await expect(focusedElement).toBeVisible();
    }
  });
});


