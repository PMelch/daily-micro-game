// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Bank Shot', () => {
  test('pass-and-play flow works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-061-bank-shot/');

    await expect(page.locator('#setup-screen')).toBeVisible();
    await page.locator('#player-count').selectOption('2');
    await page.locator('#player-0').fill('Ada');
    await page.locator('#player-1').fill('Bob');
    await page.locator('#start-btn').click();

    await expect(page.locator('#handoff-screen')).toBeVisible();
    await expect(page.locator('#handoff-text')).toContainText('Ada');
    await page.locator('#ready-btn').click();

    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#active-player')).toContainText('Ada');

    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 260, y: 180 } });
    await page.locator('#shoot-btn').click();

    await expect(page.locator('#turn-summary')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#summary-score')).not.toHaveText('0');
    await page.locator('#next-turn-btn').click();

    await expect(page.locator('#handoff-screen')).toBeVisible();
    await expect(page.locator('#handoff-text')).toContainText('Bob');
  });
});
