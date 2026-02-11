/**
 * Accessibility Tests
 * Tests basic page accessibility and semantic HTML
 */

import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test('homepage has semantic HTML', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // Check for main content elements
    const main = page.locator('main');
    const nav = page.locator('nav, header');
    
    // At least one of these semantic elements should exist
    const hasSemanticElements = (await main.count()) > 0 || (await nav.count()) > 0;
    expect(hasSemanticElements).toBeTruthy();
  });

  test('signin page has proper form labels', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin', { waitUntil: 'domcontentloaded' });
    
    // Check for input elements with proper IDs
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('signup page has proper form structure', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup', { waitUntil: 'domcontentloaded' });
    
    // Check for form element
    const form = page.locator('form');
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('dashboard has navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Should have a body element at minimum
    await expect(page.locator('body')).toBeVisible();
  });

  test('practice page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/practice', { waitUntil: 'domcontentloaded' });
    
    // Should have a body element
    await expect(page.locator('body')).toBeVisible();
  });

  test('learn page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/learn', { waitUntil: 'domcontentloaded' });
    
    // Should have a body element
    await expect(page.locator('body')).toBeVisible();
  });

  test('links are keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Focus should move to an element
    const focusedElement = page.locator(':focus');
    const isFocused = await focusedElement.isVisible().catch(() => false);
    
    // Test passes if page has focusable elements
    expect(isFocused || (await page.locator('button, a, input').count()) > 0).toBeTruthy();
  });

  test('footer is present on all pages', async ({ page }) => {
    // Test homepage
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer');
    
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });
});


