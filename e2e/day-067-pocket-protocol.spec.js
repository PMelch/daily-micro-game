// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('day-067-pocket-protocol', () => {
  test('can start the game and run a command loop', async ({ page }) => {
    await page.goto('/games/day-067-pocket-protocol/');
    await page.click('#start-btn');

    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#board .tile')).toHaveCount(49);

    await page.click('#run-btn');
    await expect(page.locator('#status-line')).not.toContainText('Noch still');
    await page.waitForTimeout(1800);

    await expect(page.locator('#tick-pill')).toContainText('Tick');
    await expect(page.locator('#queue .slot')).toHaveCount(5);
    await expect(page.locator('#command-palette .command-btn')).toHaveCount(5);
  });

  test('language switch updates visible copy', async ({ page }) => {
    await page.goto('/games/day-067-pocket-protocol/');
    await page.click('.lang-btn[data-lang="en"]');
    await expect(page.locator('#start-btn')).toHaveText('Start mission');
  });
});
