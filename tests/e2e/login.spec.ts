import { test, expect } from '@playwright/test';

test('homepage loads without errors', async ({ page }) => {
  // Navigate to homepage
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

  // Verify page loaded and no error messages
  const title = page.locator('title');
  await expect(title).toHaveTitle(/Kola|Learning|Home/, { timeout: 5000 });
  
  // Verify we're on the home page URL
  expect(page.url()).toContain('localhost:3000/');
});

test('authentication pages are accessible', async ({ page }) => {
  // Test signin page loads
  await page.goto('http://localhost:3000/auth/signin', { waitUntil: 'domcontentloaded' });
  const emailInput = page.locator('#email');
  await expect(emailInput).toBeVisible({ timeout: 5000 });
  
  // Test signup page loads
  await page.goto('http://localhost:3000/auth/signup', { waitUntil: 'domcontentloaded' });
  const signupForm = page.locator('form');
  await expect(signupForm).toBeVisible({ timeout: 5000 });
});

test('API endpoints respond correctly', async ({ page }) => {
  // Test achievements API
  const achievementsResponse = await page.request.get('/api/achievements?userId=cmli30mte0000r0x0625z2rlg');
  expect(achievementsResponse.status()).toBe(200);
  const achievements = await achievementsResponse.json();
  expect(achievements).toHaveProperty('achievements');
  
  // Test streaks API
  const streaksResponse = await page.request.get('/api/streaks?userId=cmli30mte0000r0x0625z2rlg');
  expect(streaksResponse.status()).toBe(200);
  const streaks = await streaksResponse.json();
  expect(streaks).toHaveProperty('streak');
});

test('session creation API works', async ({ page }) => {
  // Test creating a session for a user
  const sessionResponse = await page.request.post('/api/test/session', {
    data: { userId: 'cmli30mte0000r0x0625z2rlg' },
  });
  expect(sessionResponse.status()).toBe(200);
  const sessionData = await sessionResponse.json();
  expect(sessionData).toHaveProperty('ok', true);
  expect(sessionData).toHaveProperty('userId');
});
