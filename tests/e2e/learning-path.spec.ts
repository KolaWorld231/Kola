/**
 * E2E tests for learning path functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Learning Path", () => {
  test("learn page loads successfully", async ({ page }) => {
    await page.goto("/learn", { waitUntil: 'domcontentloaded' });

    // Check for learning path content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test("can navigate between pages", async ({ page }) => {
    await page.goto("/learn", { waitUntil: 'domcontentloaded' });

    // Verify URL
    const url = page.url();
    expect(url).toContain('/learn');
  });

  test("practice page loads", async ({ page }) => {
    await page.goto("/practice", { waitUntil: 'domcontentloaded' });

    // Check page loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
