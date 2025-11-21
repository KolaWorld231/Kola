/**
 * E2E Test Helpers - Page Utilities
 * Utilities for common page operations in E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait for element to be visible with timeout
 */
export async function waitForVisible(
  page: Page,
  selector: string,
  options?: { timeout?: number }
): Promise<void> {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: options?.timeout || 5000,
  });
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  await page.waitForURL(urlPattern, {
    timeout: options?.timeout || 10000,
  });
}

/**
 * Check if element exists
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  return (await page.locator(selector).count()) > 0;
}

/**
 * Fill form field with error handling
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.fill(selector, value);
  await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * Click button with error handling
 */
export async function clickButton(
  page: Page,
  textOrSelector: string,
  options?: { timeout?: number }
): Promise<void> {
  // Try as text first
  const button = page.locator(`button:has-text("${textOrSelector}")`);
  
  if (await button.count() === 0) {
    // Try as selector
    await page.click(textOrSelector, { timeout: options?.timeout });
  } else {
    await button.click({ timeout: options?.timeout });
  }
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (urlPattern instanceof RegExp) {
        return urlPattern.test(url);
      }
      return url.includes(urlPattern);
    },
    { timeout: options?.timeout || 10000 }
  );
}

/**
 * Check for console errors
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `tests/e2e/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Wait for common loading indicators to disappear
  await page.waitForFunction(() => {
    const spinners = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
    return spinners.length === 0;
  }, { timeout: 10000 });
}

/**
 * Check if toast notification appears
 */
export async function waitForToast(
  page: Page,
  message?: string
): Promise<void> {
  const toastSelector = '[data-testid="toast"], .toast, [role="alert"]';
  await page.waitForSelector(toastSelector, { timeout: 5000 });
  
  if (message) {
    await expect(page.locator(toastSelector)).toContainText(message);
  }
}

