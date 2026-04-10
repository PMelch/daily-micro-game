const { test } = require('@playwright/test');

test('capture screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('/games/day-056-bounce-budget/');
  
  // Click start button to dismiss start screen
  const overlay = page.locator('#setup-screen');
  const startBtn = overlay.locator('#start-btn');
  if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Click ready button on handoff screen
  const handoff = page.locator('#handoff-screen');
  const readyBtn = handoff.locator('#ready-btn');
  if (await readyBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await readyBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Place a bumper to make it look like gameplay
  const canvas = page.locator('#game-canvas');
  await canvas.click({ position: { x: 200, y: 300 } });
  await page.waitForTimeout(500);
  
  // Launch to show some action
  await page.locator('#launch-btn').click();
  await page.waitForTimeout(100); // just wait a tiny bit to show the trail
  
  await page.screenshot({ path: 'games/day-056-bounce-budget/screenshot.png' });
});
