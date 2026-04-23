// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('day-069-pivot-path', () => {
  test('loads, switches language, and clears level 1 on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-069-pivot-path/');

    await expect(page.locator('#start-screen')).toBeVisible();
    await page.locator('.lang-btn[data-lang="en"]').click();
    await expect(page.locator('#start-btn')).toHaveText('Start route');

    await page.locator('#start-btn').click();
    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#level-pill')).toContainText('Level 1');

    for (let i = 0; i < 6; i += 1) {
      await page.locator('#skip-btn').click();
    }

    await expect(page.locator('#result-card')).toBeVisible();
    await expect(page.locator('#result-title')).toContainText(/Delivery complete|All clear/);
    await expect(page.locator('#star-row .star.on')).toHaveCount(1);
  });

  test('board buttons stay accessible in viewport', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-069-pivot-path/');
    await page.locator('#start-btn').click();

    const controls = ['#skip-btn', '#reset-btn'];
    for (const selector of controls) {
      const locator = page.locator(selector);
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      expect(box).toBeTruthy();
      expect(box.height).toBeGreaterThanOrEqual(40);
    }

    const cell = page.locator('#board .cell').first();
    await cell.scrollIntoViewIfNeeded();
    const box = await cell.boundingBox();
    expect(box).toBeTruthy();
    expect(box.height).toBeGreaterThan(40);
  });
});
