/**
 * Visual Regression Tests
 * Takes screenshots and compares them to baseline images
 * 
 * Note: This requires a visual testing service (Percy, Chromatic) or manual comparison
 * For now, this test takes screenshots that can be manually reviewed or integrated with a service
 */

import { test, expect } from "@playwright/test";
import { signInUser, completeOnboarding } from "./helpers/auth-helpers";

test.describe("Visual Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in and complete onboarding for authenticated pages
    await signInUser(page);
    await completeOnboarding(page);
  });

  test("homepage visual regression", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("homepage.png", {
      fullPage: true,
      maxDiffPixels: 100, // Allow small differences
    });
  });

  test("dashboard visual regression", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("dashboard.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("learning path visual regression", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");
    
    // Click on first language if available
    const firstLanguage = page.locator('[data-testid="language-card"]').first();
    if (await firstLanguage.count() > 0) {
      await firstLanguage.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    }

    await expect(page).toHaveScreenshot("learning-path.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("lesson page visual regression", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");
    
    // Navigate to a lesson
    const firstLanguage = page.locator('[data-testid="language-card"]').first();
    if (await firstLanguage.count() > 0) {
      await firstLanguage.click();
      await page.waitForLoadState("networkidle");
      
      const firstLesson = page.locator('[data-testid="lesson-card"]').first();
      if (await firstLesson.count() > 0) {
        await firstLesson.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        await expect(page).toHaveScreenshot("lesson-page.png", {
          fullPage: true,
          maxDiffPixels: 100,
        });
      }
    }
  });

  test("sign in page visual regression", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/auth/signin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("signin-page.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("mobile viewport visual regression", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("dashboard-mobile.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("tablet viewport visual regression", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("dashboard-tablet.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("component states visual regression", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Test button hover state
    const button = page.locator("button").first();
    if (await button.count() > 0) {
      await button.hover();
      await page.waitForTimeout(300);
      await expect(button).toHaveScreenshot("button-hover.png", {
        maxDiffPixels: 50,
      });
    }
  });
});


