// @ts-check
const { test, expect } = require('@playwright/test');

test('capture Pivot Path gameplay screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-069-pivot-path/');
  await page.locator('#start-btn').click();
  await expect(page.locator('#game-screen')).toBeVisible();

  await page.locator('#skip-btn').click();
  await page.locator('#skip-btn').click();
  await page.locator('#board .cell').nth(5).click();
  await page.waitForTimeout(100);

  await page.screenshot({ path: 'games/day-069-pivot-path/screenshot.png' });
});
