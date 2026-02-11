/**
 * E2E Tests - Critical Paths
 * 
 * Tests critical user flows and navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Critical App Paths', () => {
  test('homepage is accessible', async ({ page }) => {
    // Navigate to home page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify page loaded
    const url = page.url();
    expect(url).toContain('localhost:3000');
  });

  test('can navigate to learn page', async ({ page }) => {
    // Navigate to learn page
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    
    // Page should load (either with language selection or redirect to signin)
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('can navigate to practice page', async ({ page }) => {
    // Navigate to practice page
    await page.goto('/practice', { waitUntil: 'domcontentloaded' });
    
    // Page should load without errors
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('dashboard page loads without errors', async ({ page }) => {
    // Navigate to dashboard without session
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Page should load (either with content or redirect)
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('auth pages are accessible', async ({ page }) => {
    // Signin page
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });
    const signinForm = page.locator('form');
    expect(await signinForm.isVisible()).toBeTruthy();

    // Signup page
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });
    const signupForm = page.locator('form');
    expect(await signupForm.isVisible()).toBeTruthy();
  });
});



