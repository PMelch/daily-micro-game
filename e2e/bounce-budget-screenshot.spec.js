const { test } = require('@playwright/test');

test('capture screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-056-bounce-budget/');
  
  // Click start button to dismiss start screen
  const startBtn = page.locator('#start-btn');
  if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Click ready button on handoff screen
  const readyBtn = page.locator('#ready-btn');
  if (await readyBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await readyBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Place three bumpers to enable launch
  const canvas = page.locator('#game-canvas');
  await canvas.click({ position: { x: 100, y: 400 } });
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: 300, y: 300 } });
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: 200, y: 200 } });
  await page.waitForTimeout(100);
  
  // Launch to show some action
  await page.locator('#launch-btn').click();
  await page.waitForTimeout(150); // wait a bit to show ball flying
  
  await page.screenshot({ path: 'games/day-056-bounce-budget/screenshot.png' });
});
