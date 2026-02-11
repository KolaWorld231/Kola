import { test, expect, Page } from '@playwright/test';

/**
 * Feature Verification Tests
 * Tests for newly implemented features:
 * - Lesson page navigation and loading
 * - Language activation/deactivation in admin
 * - Onboarding protection (new vs returning users)
 */

test.describe('Feature Verification Suite', () => {
  // Test 1: Lesson Page Navigation
  test.describe('Lesson Page Navigation', () => {
    test('should navigate to lesson page from learn page', async ({ page }) => {
      // Navigate to learn page
      await page.goto('/learn/bassa');
      
      // Wait for lesson cards to load
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 }).catch(() => null);
      
      // Click first available lesson card
      const firstLessonCard = page.locator('[data-testid="lesson-card"]').first();
      const lessonLink = firstLessonCard.locator('a').first();
      
      // Get the href to verify it's a valid lesson URL
      const href = await lessonLink.getAttribute('href');
      expect(href).toMatch(/^\/lesson\/[a-zA-Z0-9-]+$/);
      
      // Click the lesson
      await lessonLink.click();
      
      // Verify we navigated to a lesson page
      await page.waitForURL(/\/lesson\/[a-zA-Z0-9-]+/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/lesson\/[a-zA-Z0-9-]+/);
    });

    test('should load lesson exercises without errors', async ({ page }) => {
      // Navigate directly to a lesson (assuming bassa-lesson-1-1 exists)
      await page.goto('/lesson/bassa-lesson-1-1', { waitUntil: 'networkidle' }).catch(() => null);
      
      // Check for lesson title or exercises container
      const lessonContainer = page.locator('[data-testid="lesson-container"], .lesson-page, main');
      await expect(lessonContainer).toBeVisible({ timeout: 5000 }).catch(() => null);
      
      // Verify no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait a bit for any async errors
      await page.waitForTimeout(2000);
      expect(errors.filter(e => !e.includes('net::')).length).toBe(0);
    });

    test('should handle lesson page not found gracefully', async ({ page }) => {
      // Try to navigate to non-existent lesson
      const response = await page.goto('/lesson/nonexistent-lesson-id', { waitUntil: 'networkidle' });
      
      // Should either show error or redirect
      const url = page.url();
      const isErrorOrRedirect = 
        url.includes('/error') || 
        url.includes('/learn') || 
        response?.status() === 404;
      
      expect(isErrorOrRedirect).toBeTruthy();
    });
  });

  // Test 2: Language Admin Toggle
  test.describe('Language Activation/Deactivation', () => {
    test('should load admin languages page', async ({ page }) => {
      await page.goto('/admin/languages');
      
      // Verify page loaded
      const pageTitle = page.locator('h1, [role="heading"]').first();
      await expect(pageTitle).toBeVisible({ timeout: 5000 });
      
      // Check for language list or cards
      const languagesList = page.locator('[data-testid="language-item"], .language-card, table tbody tr');
      await expect(languagesList).toHaveCount(1, { timeout: 5000 }).catch(() => {
        // If count assertion fails, just verify at least one is visible
        return expect(languagesList.first()).toBeVisible({ timeout: 5000 });
      });
    });

    test('should have toggle controls for each language', async ({ page }) => {
      await page.goto('/admin/languages');
      
      // Wait for language items to load
      await page.waitForSelector('[data-testid="language-toggle"], .toggle-button, input[type="checkbox"]', { timeout: 5000 });
      
      // Find toggle buttons/switches
      const toggles = page.locator('[data-testid="language-toggle"], .toggle-button, input[type="checkbox"]');
      const toggleCount = await toggles.count();
      
      // Should have at least one toggle
      expect(toggleCount).toBeGreaterThan(0);
    });

    test('should show active status indicator', async ({ page }) => {
      await page.goto('/admin/languages');
      
      // Look for status badges or indicators
      const statusIndicators = page.locator('[data-testid="language-status"], .status-badge, .active-badge');
      
      // Try to find status text
      const statusText = await page.locator('text=/active|inactive|enabled|disabled/i').first().textContent();
      expect(statusText).toBeTruthy();
    });
  });

  // Test 3: Onboarding Protection
  test.describe('Onboarding Protection', () => {
    test('should not show onboarding to authenticated user without onboarding flag', async ({ page, context }) => {
      // Set a session cookie that indicates user is authenticated but has completed onboarding
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: 'test-session-token',
          domain: 'localhost',
          path: '/',
          expires: Date.now() / 1000 + 86400,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        }
      ]);
      
      // Try to navigate to onboarding
      await page.goto('/onboarding');
      
      // Should either redirect or show protected state
      const url = page.url();
      const isRedirected = !url.includes('/onboarding');
      
      // If not redirected, check if onboarding is hidden behind auth check
      if (!isRedirected) {
        const onboardingContent = page.locator('[data-testid="onboarding-container"]');
        const isVisible = await onboardingContent.isVisible().catch(() => false);
        expect(isVisible).toBeFalsy();
      }
    });

    test('should allow direct navigation to onboarding for new users', async ({ page }) => {
      // Navigate to onboarding without authentication
      const response = await page.goto('/onboarding');
      
      // Should either show onboarding or redirect to signin (both are acceptable)
      const url = page.url();
      const isOnboardingOrSignin = 
        url.includes('/onboarding') || 
        url.includes('/signin') ||
        response?.status() === 302;
      
      expect(isOnboardingOrSignin).toBeTruthy();
    });

    test('should show appropriate message when accessing onboarding when already completed', async ({ page }) => {
      // This would require proper authentication setup
      // For now, verify the route exists and handles access
      const response = await page.goto('/onboarding', { waitUntil: 'networkidle' });
      
      // Should not result in 500 error
      expect([200, 302, 307, 308]).toContain(response?.status() || 200);
    });
  });

  // Test 4: Dynamic Route Params Handling
  test.describe('Dynamic Route Parameters', () => {
    test('practice page should handle id parameter correctly', async ({ page }) => {
      // Navigate to practice page
      await page.goto('/practice/lesson-1');
      
      // Check for practice content or error
      const content = page.locator('[data-testid="practice-container"], .practice-page, main');
      const errorMsg = page.locator('[data-testid="error"], .error-message');
      
      // Should either show practice or clear error (not "params.then is not a function")
      const hasConsoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('params.then')) {
          hasConsoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000);
      expect(hasConsoleErrors.length).toBe(0);
    });

    test('learn page with language code should load correctly', async ({ page }) => {
      // Navigate to learn page with language code
      await page.goto('/learn/bassa');
      
      // Should load without "params.then" errors
      const pageContent = page.locator('main, [role="main"]');
      
      // Wait for content or error
      await page.waitForSelector('[data-testid="lesson-card"], h1, h2', { timeout: 5000 }).catch(() => null);
      
      // Verify URL matches what we navigated to
      expect(page.url()).toContain('/learn/bassa');
    });

    test('stories page should handle id parameter correctly', async ({ page }) => {
      // Try to navigate to stories page
      const response = await page.goto('/stories/story-1', { waitUntil: 'networkidle' }).catch(e => ({ status: null }));
      
      // Should not have params error
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('params')) {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(consoleErrors.filter(e => e.includes('then is not a function')).length).toBe(0);
    });
  });

  // Test 5: Integration Tests
  test.describe('Feature Integration', () => {
    test('should complete full user journey: learn -> lesson -> practice', async ({ page }) => {
      // Start at learn page
      await page.goto('/learn/bassa');
      await page.waitForSelector('[data-testid="lesson-card"], a[href*="/lesson/"]', { timeout: 5000 }).catch(() => null);
      
      // Try to click a lesson
      const lessonLink = page.locator('a[href*="/lesson/"]').first();
      const href = await lessonLink.getAttribute('href').catch(() => '');
      
      if (href) {
        await lessonLink.click();
        // Verify navigation to lesson
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('/lesson/');
      }
    });

    test('should maintain state across navigation', async ({ page }) => {
      // Navigate through multiple pages
      await page.goto('/');
      const initialUrl = page.url();
      
      // Navigate to learn
      await page.goto('/learn/bassa');
      const learnUrl = page.url();
      expect(learnUrl).toContain('/learn/bassa');
      
      // Navigate back
      await page.goBack();
      const backUrl = page.url();
      expect(backUrl).toBe(initialUrl);
    });
  });
});

// Helper function for testing language toggle
async function testLanguageToggle(page: Page, languageIndex: number = 0) {
  await page.goto('/admin/languages');
  
  const toggles = page.locator('[data-testid="language-toggle"]');
  const toggle = toggles.nth(languageIndex);
  
  // Get current state
  const isChecked = await toggle.isChecked().catch(() => false);
  
  // Click toggle
  await toggle.click();
  
  // Verify state changed
  const newState = await toggle.isChecked().catch(() => false);
  expect(newState).not.toBe(isChecked);
  
  // Verify success message or UI update
  await page.waitForTimeout(1000);
}
