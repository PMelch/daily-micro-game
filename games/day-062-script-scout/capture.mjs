import { chromium, devices } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['Pixel 5'], viewport: { width: 480, height: 640 } });
const page = await context.newPage();
await page.goto('http://localhost:3099/games/day-062-script-scout/');
await page.locator('[data-command="forward"]').click();
await page.locator('[data-command="right"]').click();
await page.locator('[data-command="forward"]').click();
await page.locator('[data-command="left"]').click();
await page.locator('[data-command="forward"]').click();
await page.locator('#run-btn').click();
await page.screenshot({ path: 'games/day-062-script-scout/screenshot.png' });
await browser.close();
