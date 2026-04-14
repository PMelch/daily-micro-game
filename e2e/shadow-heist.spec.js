// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Shadow Heist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/day-060-shadow-heist/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('loads intro and can clear level 1', async ({ page }) => {
    await expect(page.locator('#start-screen')).toBeVisible();
    await page.locator('#start-btn').click();
    await expect(page.locator('#game-screen')).toBeVisible();

    await page.locator('[data-move="right"]').click();
    await page.locator('[data-move="down"]').click();

    await expect(page.locator('#status-text')).toContainText(/clean job|sauberer job|travail propre|colpo pulito|golpe limpio/i);
  });

  test('mobile layout keeps canvas and core controls visible', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-060-shadow-heist/');
    await page.locator('#start-btn').click();

    for (const locator of ['#game-canvas', '#reset-btn', '[data-move="left"]', '[data-move="right"]']) {
      const box = await page.locator(locator).boundingBox();
      expect(box).toBeTruthy();
      expect(box.y + box.height).toBeLessThanOrEqual(640);
    }
  });
});
