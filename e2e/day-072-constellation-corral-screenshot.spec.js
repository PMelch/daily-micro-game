// @ts-check
const { test, expect } = require('@playwright/test');

test('capture Constellation Corral gameplay screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-072-constellation-corral/');
  await page.locator('#start-btn').click();
  await expect(page.locator('#game-screen')).toBeVisible();

  for (const pegId of ['a', 'b', 'd']) {
    await page.locator(`#board .peg-hit[data-peg-id="${pegId}"]`).click();
  }

  await page.screenshot({ path: 'games/day-072-constellation-corral/screenshot.png' });
});
