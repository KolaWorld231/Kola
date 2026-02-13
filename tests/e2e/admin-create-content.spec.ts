import { test, expect } from '@playwright/test';
import { signInUser } from './helpers/auth-helpers';

test.describe('Admin — create content (smoke)', () => {
  test('sign in as admin and create a unit', async ({ page }) => {
    // Sign in using seeded admin account
    await signInUser(page, 'admin@volo.test', 'password123');

    // Go to admin content manager
    await page.goto('/admin/content', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/content/);

    // Open Create Unit modal
    await page.click('[data-testid="open-create-unit"]');
    await page.waitForSelector('[data-testid="create-unit-modal"]', { timeout: 5000 });
    await page.waitForSelector('#language');

    // Select first language in list
    const languageSelect = page.locator('#language');
    const options = await languageSelect.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(1);
    // choose the first real language option (index 1)
    await languageSelect.selectOption({ index: 1 });

    // Fill title + description
    await page.fill('#title', 'Smoke Test — Intro Unit');
    await page.fill('#description', 'Created by smoke E2E test');
    await page.selectOption('#difficulty', 'beginner');

    // Submit
    await page.click('button:has-text("Create Unit")');

    // Verify unit appears in content tree
    await page.waitForSelector('text=Smoke Test — Intro Unit', { timeout: 5000 });
    const created = await page.locator('text=Smoke Test — Intro Unit').count();
    expect(created).toBeGreaterThan(0);
  });
});