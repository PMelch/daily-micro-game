const { test } = require('@playwright/test');

test('capture polar pull gameplay screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-058-polar-pull/');
  await page.locator('#start-btn').click();
  await page.locator('button[data-action="move"][data-dir="right"]').click();
  await page.locator('button[data-action="move"][data-dir="down"]').click();
  await page.locator('button[data-action="pulse"][data-mode="repel"][data-dir="left"]').click();
  await page.screenshot({ path: 'games/day-058-polar-pull/screenshot.png' });
});
