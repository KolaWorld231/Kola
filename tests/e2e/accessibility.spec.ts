/**
 * Accessibility Tests
 * Tests WCAG compliance and accessibility features
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { signInUser, completeOnboarding } from "./helpers/auth-helpers";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in and complete onboarding for authenticated pages
    await signInUser(page);
    await completeOnboarding(page);
  });

  test("homepage should be accessible", async ({ page }) => {
    await page.goto("/");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("dashboard should be accessible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("learning path should be accessible", async ({ page }) => {
    // Navigate to learning path (assumes a language is selected)
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");
    
    // Click on first language if available
    const firstLanguage = page.locator('[data-testid="language-card"]').first();
    if (await firstLanguage.count() > 0) {
      await firstLanguage.click();
      await page.waitForLoadState("networkidle");
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("lesson page should be accessible", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");
    
    // Try to navigate to a lesson
    const firstLanguage = page.locator('[data-testid="language-card"]').first();
    if (await firstLanguage.count() > 0) {
      await firstLanguage.click();
      await page.waitForLoadState("networkidle");
      
      // Try to click first lesson
      const firstLesson = page.locator('[data-testid="lesson-card"]').first();
      if (await firstLesson.count() > 0) {
        await firstLesson.click();
        await page.waitForLoadState("networkidle");

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    }
  });

  test("sign in page should be accessible", async ({ page, context }) => {
    // Sign out first
    await context.clearCookies();
    await page.goto("/auth/signin");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("onboarding page should be accessible", async ({ page, context }) => {
    // Sign out first
    await context.clearCookies();
    
    // Sign up new user
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");
    
    // Fill signup form
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "Test123!@#");
    await page.fill('input[name="name"]', "Test User");
    await page.click('button[type="submit"]');
    
    // Should redirect to onboarding
    await page.waitForURL("/onboarding", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("all interactive elements should be keyboard accessible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Check if interactive elements have focus indicators
    const focusStyles = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
      };
    });

    // Should have visible focus indicator
    expect(
      focusStyles.outlineWidth !== "0px" ||
      focusStyles.outline !== "none"
    ).toBeTruthy();
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");
      
      // Decorative images should have role="presentation" or aria-hidden
      // Informative images should have alt text
      if (role !== "presentation") {
        expect(alt).not.toBeNull();
      }
    }
  });

  test("form inputs should have labels", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.waitForLoadState("networkidle");

    const inputs = page.locator("input[type='text'], input[type='email'], input[type='password']");
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      
      // Should have either label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test("color contrast should meet WCAG standards", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .options({
        rules: {
          "color-contrast": { enabled: true },
          "color-contrast-enhanced": { enabled: true },
        },
      })
      .analyze();

    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "color-contrast" || violation.id === "color-contrast-enhanced"
    );

    expect(colorContrastViolations).toEqual([]);
  });
});

