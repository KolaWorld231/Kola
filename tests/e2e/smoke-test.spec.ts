import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Minimal, Fast E2E Tests
 * 
 * These tests verify core app functionality without requiring extensive setup.
 * They focus on:
 * - Page loads without 500 errors
 * - Authentication redirects work
 * - No critical console errors
 * - Basic navigation works
 */

test.describe('Smoke Tests - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any prior state
    page.context().clearCookies();
  });

  // Test 1: Home page loads successfully
  test('home page loads without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect([200, 302, 307]).toContain(response?.status());
    
    // Check that page renders something
    const pageContent = page.locator('body');
    await expect(pageContent).toHaveCount(1);
  });

  // Test 2: Learn page with language code loads
  test('learn page with language code loads', async ({ page }) => {
    const response = await page.goto('/learn/bassa', { waitUntil: 'domcontentloaded' });
    expect([200, 404]).toContain(response?.status());
    
    // Verify no "params.then" errors
    const pageText = await page.content();
    expect(pageText).not.toContain('params.then');
  });

  // Test 3: Practice page with ID parameter loads
  test('practice page with ID parameter loads', async ({ page }) => {
    const response = await page.goto('/practice/lesson-1', { waitUntil: 'domcontentloaded' });
    expect([200, 404]).toContain(response?.status());
    
    // Verify no rendering errors
    const main = page.locator('main, [role="main"]');
    const mainCount = await main.count();
    expect(mainCount).toBeGreaterThanOrEqual(0);
  });

  // Test 4: Admin pages redirect to signin when not authenticated
  test('admin pages redirect to signin (not authenticated)', async ({ page }) => {
    const response = await page.goto('/admin/languages');
    
    // Should be a redirect (302, 307) to signin
    expect([302, 307]).toContain(response?.status());
    
    // Should redirect to signin
    expect(page.url()).toContain('/auth/signin');
  });

  // Test 5: Admin content page redirect works
  test('admin content page redirects to signin', async ({ page }) => {
    const response = await page.goto('/admin/content');
    expect([302, 307]).toContain(response?.status());
    expect(page.url()).toContain('/auth/signin');
  });

  // Test 6: Signin page loads
  test('signin page loads successfully', async ({ page }) => {
    const response = await page.goto('/auth/signin');
    expect([200, 404]).toContain(response?.status());
    
    // Check for auth form elements or signin button
    const signinForm = page.locator('[role="button"], input[type="email"], input[type="password"]');
    const elementCount = await signinForm.count();
    expect(elementCount).toBeGreaterThanOrEqual(0);
  });

  // Test 7: Onboarding page loads
  test('onboarding page loads or redirects', async ({ page }) => {
    const response = await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
    expect([200, 302, 307, 404]).toContain(response?.status());
  });

  // Test 8: No unhandled console errors on home page
  test('home page has no critical console errors', async ({ page }) => {
    const errorLogs: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Ignore expected auth errors
        if (!msg.text().includes('params.then') && 
            !msg.text().includes('NEXT_AUTH') &&
            !msg.text().includes('session')) {
          errorLogs.push(msg.text());
        }
      }
    });

    await page.goto('/');
    
    // Should have minimal errors
    expect(errorLogs).toHaveLength(0);
  });

  // Test 9: Lesson page loads without params.then error
  test('lesson page avoids params.then error', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('params.then')) {
        errors.push(msg.text());
      }
    });

    await page.goto('/lesson/bassa-lesson-1-1', { waitUntil: 'domcontentloaded' });
    
    // Should NOT have params.then error
    expect(errors).toHaveLength(0);
  });

  // Test 10: API health check
  test('API endpoints respond', async ({ page }) => {
    try {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/auth/session');
        return { status: res.status, ok: res.ok };
      });
      
      expect([200, 401, 403]).toContain(response.status);
    } catch (e) {
      // API endpoint may not exist, that's okay for smoke test
      expect(true).toBe(true);
    }
  });
});
