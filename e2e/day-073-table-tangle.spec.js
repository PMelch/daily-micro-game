// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Table Tangle', () => {
  test('pass-and-play seating round works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-073-table-tangle/');

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

    const guests = ['mayor', 'chef', 'critic', 'cat', 'robot', 'dj'];
    for (let i = 0; i < guests.length; i += 1) {
      await page.locator(`[data-guest-id="${guests[i]}"]`).click();
      await page.locator(`[data-seat-index="${i}"]`).click();
    }

    await expect(page.locator('#submit-btn')).toBeEnabled();
    await expect(page.locator('#score-preview')).toContainText('18');
    await page.locator('#submit-btn').click();

    await expect(page.locator('#transition-screen')).toBeVisible();
    await expect(page.locator('#transition-copy')).toContainText('Bob');
  });
});
