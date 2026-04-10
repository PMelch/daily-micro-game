// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Clockwork Courier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/day-055-clockwork-courier/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('loads intro screen', async ({ page }) => {
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#start-btn')).toBeVisible();
  });

  test('can solve level 1 with authored program', async ({ page }) => {
    await page.locator('#start-btn').click();
    await expect(page.locator('#game-screen')).toBeVisible();

    const sequence = ['forward', 'right', 'forward', 'left'];
    for (let i = 0; i < sequence.length; i++) {
      await page.locator(`#slot-${i}`).click();
      await page.locator(`[data-cmd='${sequence[i]}']`).click();
    }

    await page.locator('#run-btn').click();
    await expect(page.locator('#status-banner')).toContainText(/level clear|level geschafft|niveau reussi|livello superato|nivel superado/i, { timeout: 5000 });
  });

  test('mobile layout keeps controls visible', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-055-clockwork-courier/');
    await page.locator('#start-btn').click();
    for (const id of ['#run-btn', '#reset-btn', '#slot-0', '#slot-1']) {
      const box = await page.locator(id).boundingBox();
      expect(box).toBeTruthy();
      expect(box.y + box.height).toBeLessThanOrEqual(640);
    }
  });
});
