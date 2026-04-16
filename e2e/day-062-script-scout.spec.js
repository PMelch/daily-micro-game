// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('day-062-script-scout', () => {
  test('first level is playable and advances after a solved run', async ({ page }) => {
    await page.goto('/games/day-062-script-scout/');
    await page.waitForLoadState('domcontentloaded');

    const tap = async (command, times = 1) => {
      for (let i = 0; i < times; i++) {
        await page.locator(`[data-command="${command}"]`).click();
      }
    };

    await tap('forward');
    await tap('right');
    await tap('forward');
    await tap('left');
    await tap('forward');
    await page.getByRole('button', { name: /run|programm ausführen|lancer|esegui|ejecutar/i }).click();

    await expect(page.locator('#result-card')).toHaveClass(/active/);
    await expect(page.locator('#result-stars')).toContainText(/3/);

    await page.getByRole('button', { name: /next|nächstes level|niveau suivant|livello successivo|siguiente nivel/i }).click();
    await expect(page.locator('#level-pill')).toContainText(/2/);
  });
});
