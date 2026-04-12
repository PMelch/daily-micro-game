const { test, expect } = require('@playwright/test');

test('polar pull starts and responds to controls', async ({ page }) => {
  await page.goto('/games/day-058-polar-pull/');
  await page.setViewportSize({ width: 480, height: 640 });
  await page.locator('#start-btn').click();

  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('#level-label')).toContainText('1/6');

  const movesBefore = await page.locator('#moves-label').textContent();
  await page.locator('button[data-action="move"][data-dir="right"]').click();
  await page.locator('button[data-action="pulse"][data-mode="attract"][data-dir="up"]').click();
  const movesAfter = await page.locator('#moves-label').textContent();

  expect(movesAfter).not.toBe(movesBefore);
  await expect(page.locator('#status-text')).not.toBeEmpty();
});
