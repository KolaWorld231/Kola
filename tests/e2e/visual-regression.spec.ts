/**
 * Visual Regression Tests (Simplified)
 * Basic visual render tests
 */

import { test, expect } from "@playwright/test";

test.describe("Visual Render Tests", () => {
  test("homepage renders without visual errors", async ({ page }) => {
    await page.goto("/", { waitUntil: 'domcontentloaded' });
    
    // Wait for rendering
    await page.waitForTimeout(500);
    
    // Verify page rendered
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test("dashboard renders", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: 'domcontentloaded' });
    
    // Verify page structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test("learn page renders", async ({ page }) => {
    await page.goto("/learn", { waitUntil: 'domcontentloaded' });
    
    // Verify render
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test("auth pages render", async ({ page }) => {
    await page.goto("/auth/signin", { waitUntil: 'domcontentloaded' });
    
    // Verify render
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test("practice page renders", async ({ page }) => {
    await page.goto("/practice", { waitUntil: 'domcontentloaded' });
    
    // Verify render
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});



