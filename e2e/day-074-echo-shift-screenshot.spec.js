// @ts-check
const { test, expect } = require('@playwright/test');

test('capture Echo Shift gameplay screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-074-echo-shift/');
  await page.locator('#start-btn').click();
  await expect(page.locator('#game-screen')).toBeVisible();

  // Make some moves to show gameplay
  await page.locator('button[data-move="right"]').click();
  await page.locator('button[data-move="right"]').click();
  await page.locator('button[data-move="down"]').click();

  await page.screenshot({ path: 'games/day-074-echo-shift/screenshot.png' });
});
