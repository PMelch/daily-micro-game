// @ts-check
const { test, expect } = require('@playwright/test');

test('day-063-overlay pass-and-play flow works', async ({ page }) => {
  await page.goto('/games/day-063-overlay/');
  await page.getByLabel(/Spieleranzahl|Player count/).selectOption('2');

  const inputs = page.locator('#player-inputs input');
  await inputs.nth(0).fill('Anna');
  await inputs.nth(1).fill('Ben');
  await page.getByRole('button', { name: /Spiel starten|Start game/ }).click();

  await expect(page.locator('#handoff-screen.active')).toBeVisible();
  await page.getByRole('button', { name: /Ich bin bereit|I am ready/ }).click();
  await expect(page.locator('#game-screen.active')).toBeVisible();

  const board = page.locator('#work-board .cell');
  await board.nth(0).click();
  await page.locator('#stamp-select').selectOption('0');
  await board.nth(6).click();
  await page.locator('#stamp-select').selectOption('0');
  await board.nth(12).click();
  await page.getByRole('button', { name: /Zug werten|Score turn/ }).click();

  await expect(page.locator('#turn-summary.active')).toBeVisible();
  await expect(page.locator('#summary-line')).toContainText('Anna');
  await page.getByRole('button', { name: /Weiter|Continue/ }).click();
  await expect(page.locator('#handoff-screen.active')).toBeVisible();
  await expect(page.locator('#handoff-text')).toContainText('Ben');
});
