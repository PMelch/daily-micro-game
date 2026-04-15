const { test } = require('@playwright/test');

test('capture gameplay screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('https://games.lab.gogerl.com/games/day-061-bank-shot/');
  await page.locator('#player-count').selectOption('2');
  await page.locator('#player-0').fill('Ada');
  await page.locator('#player-1').fill('Bob');
  await page.locator('#start-btn').click();
  await page.locator('#ready-btn').click();
  const canvas = page.locator('#game-canvas');
  await canvas.click({ position: { x: 260, y: 180 } });
  await page.locator('#shoot-btn').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'games/day-061-bank-shot/screenshot.png' });
});
