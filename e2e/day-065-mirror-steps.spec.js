// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('day-065-mirror-steps', () => {
  test('first level is playable and can be solved', async ({ page }) => {
    await page.goto('/games/day-065-mirror-steps/');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('[data-dir="up"]').click();

    await expect(page.locator('#result-card')).toHaveClass(/active/);
    await expect(page.locator('#result-message')).not.toBeEmpty();

    await page.locator('#result-next-btn').click({ force: true });
    await expect(page.locator('#level-pill')).toContainText(/2/);
  });
});
