const { test } = require('@playwright/test');

test('screenshot gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto('https://games.lab.gogerl.com/games/day-051-slippy/');
  await page.waitForTimeout(1500);
  await page.click('#start-btn');
  await page.waitForTimeout(600);
  await page.click('#handoff-ok');
  await page.waitForTimeout(600);
  await page.click('#btn-right');
  await page.waitForTimeout(500);
  await page.click('#handoff-ok');
  await page.waitForTimeout(500);
  await page.click('#btn-left');
  await page.waitForTimeout(500);
  await page.click('#handoff-ok');
  await page.waitForTimeout(700);
  await page.screenshot({ path: '/tmp/slippy-gameplay.png' });
});
