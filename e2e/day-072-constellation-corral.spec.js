// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Constellation Corral', () => {
  test('single-player loop capture works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-072-constellation-corral/');

    await expect(page.locator('#intro-screen')).toBeVisible();
    await page.locator('#start-btn').click();

    await expect(page.locator('#game-screen')).toBeVisible();
    await expect(page.locator('#board .peg-hit')).toHaveCount(6);

    for (const pegId of ['a', 'b', 'd', 'e']) {
      await page.locator(`#board .peg-hit[data-peg-id="${pegId}"]`).click();
    }
    await page.locator('#seal-btn').click();

    await expect(page.locator('#message-box')).toContainText(/Sauber eingefangen|Clean catch|Capture propre|Cattura pulita|Captura limpia/);
    await expect(page.locator('#next-btn')).toBeVisible();

    await page.locator('#next-btn').click();
    await expect(page.locator('#level-pill')).toContainText('2');
    await expect(page.locator('#board .peg-hit')).toHaveCount(7);
  });
});
