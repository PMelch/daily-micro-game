// @ts-check
const { test, expect } = require('@playwright/test');

test('capture Floe Showdown gameplay screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-068-floe-showdown/');

  await page.locator('#player-count').selectOption('2');
  await page.locator('#player-0').fill('Ada');
  await page.locator('#player-1').fill('Bob');
  await page.locator('#start-btn').click();
  await page.locator('#ready-btn').click();
  await expect(page.locator('#game-screen')).toBeVisible();

  await page.locator('#move-list .move-btn').first().click();
  await expect(page.locator('#transition-screen')).toBeVisible();
  await page.locator('#ready-btn').click();
  await expect(page.locator('#game-screen')).toBeVisible();

  await page.screenshot({ path: 'games/day-068-floe-showdown/screenshot.png' });
});
