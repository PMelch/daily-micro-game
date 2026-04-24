// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Beltline Blitz', () => {
  test('pass-and-play conveyor flow works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-070-beltline-blitz/');

    await expect(page.locator('#setup-screen')).toBeVisible();
    await page.locator('#player-count').selectOption('2');
    await page.locator('#player-0').fill('Ada');
    await page.locator('#player-1').fill('Bob');
    await page.locator('#start-btn').click();

    await expect(page.locator('#transition-screen')).toBeVisible();
    await expect(page.locator('#transition-copy')).toContainText('Ada');
    await page.locator('#ready-btn').click();

    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#turn-line')).toContainText('Ada');
    await expect(page.locator('#board .tile')).toHaveCount(25);

    await page.locator('#board .tile').nth(12).click();

    await expect(page.locator('#transition-screen')).toBeVisible();
    await expect(page.locator('#transition-copy')).toContainText('Bob');
    await page.locator('#ready-btn').click();

    await expect(page.locator('#turn-line')).toContainText('Bob');
    await expect(page.locator('#scoreboard .score-row')).toHaveCount(2);
  });
});
