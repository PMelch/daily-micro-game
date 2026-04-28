// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Echo Shift', () => {
  test('single-player echo loop works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 640 });
    await page.goto('/games/day-074-echo-shift/');

    await expect(page.locator('#intro-screen')).toBeVisible();
    await page.locator('#start-btn').click();

    await expect(page.locator('#game-screen')).toBeVisible();
    
    // Level 1: Warm Echo
    // S at 1,1. P at 3,2. D at 4,3. E at 6,3.
    // 1. Move to P (3,2): Right(2), Down(1)
    await page.locator('button[data-move="right"]').click();
    await page.locator('button[data-move="right"]').click();
    await page.locator('button[data-move="down"]').click();

    // 2. Save Echo
    await page.locator('#save-echo-btn').click();
    
    // 3. Move to E (6,3): Down(2), Right(5)
    await page.locator('button[data-move="down"]').click();
    await page.locator('button[data-move="down"]').click();
    await page.locator('button[data-move="right"]').click();
    await page.locator('button[data-move="right"]').click();
    await page.locator('button[data-move="right"]').click();
    await page.locator('button[data-move="right"]').click();
    await page.locator('button[data-move="right"]').click();

    await expect(page.locator('#win-overlay')).toBeVisible();
    await page.locator('#next-btn').click();
    
    // Level 2 should load
    await expect(page.locator('#level-pill')).toContainText('2');
  });
});
