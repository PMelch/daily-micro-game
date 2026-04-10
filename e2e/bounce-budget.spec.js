// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Bounce Budget', () => {
  test('pass-and-play flow works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-056-bounce-budget/');

    await expect(page.locator('#setup-screen')).toBeVisible();
    await page.locator('#player-count').selectOption('2');
    await page.locator('#player-0').fill('Ada');
    await page.locator('#player-1').fill('Bob');
    await page.locator('#start-btn').click();

    await expect(page.locator('#handoff-screen')).toBeVisible();
    await page.locator('#ready-btn').click();

    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#active-player')).toContainText('Ada');
    await expect(page.locator('#launch-btn')).toBeVisible();

    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 220, y: 300 } });
    await page.locator('#launch-btn').click();

    await expect(page.locator('#turn-summary')).toBeVisible({ timeout: 4000 });
    await page.locator('#next-turn-btn').click();
    await expect(page.locator('#handoff-screen')).toBeVisible();
    await expect(page.locator('#handoff-text')).toContainText('Bob');
  });
});
