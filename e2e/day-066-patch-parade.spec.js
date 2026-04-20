// @ts-check
const { test, expect } = require('@playwright/test');

test('patch parade supports setup and first placement flow', async ({ page }) => {
  await page.goto('/games/day-066-patch-parade/');
  await page.selectOption('#player-count', '2');
  await page.locator('#name-fields input').nth(0).fill('Ada');
  await page.locator('#name-fields input').nth(1).fill('Bob');
  await page.click('#start-btn');

  await expect(page.locator('#transition-screen')).toBeVisible();
  await expect(page.locator('#transition-title')).toContainText('Ada');
  await page.click('#continue-btn');

  await expect(page.locator('#game-screen')).toBeVisible();
  await page.locator('.offer-card').first().click();
  await page.locator('#board .board-cell').first().click();

  await expect(page.locator('#transition-screen')).toBeVisible();
  await expect(page.locator('#transition-title')).toContainText('Bob');
});
