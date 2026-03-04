// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// Discover all games dynamically
const gamesDir = path.join(__dirname, '..', 'games');
const games = fs.readdirSync(gamesDir)
  .filter(d => d.startsWith('day-') && fs.existsSync(path.join(gamesDir, d, 'index.html')))
  .sort();

for (const game of games) {
  test.describe(game, () => {
    test('page loads without errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));

      const response = await page.goto(`/games/${game}/`);
      expect(response.status()).toBe(200);

      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');

      // No JS errors
      expect(errors).toEqual([]);
    });

    test('has visible interactive elements', async ({ page }) => {
      await page.goto(`/games/${game}/`);
      await page.waitForLoadState('domcontentloaded');

      // Every game should have at least one clickable element
      const clickable = await page.locator('button, [role="button"], canvas, .cell, .card, .tile, input, a').first();
      await expect(clickable).toBeAttached({ timeout: 3000 });
    });

    test('no overlapping touch targets on mobile', async ({ page, browserName }, testInfo) => {
      // Only run on mobile project
      if (!testInfo.project.name.includes('mobile')) {
        test.skip();
        return;
      }

      await page.goto(`/games/${game}/`);
      await page.waitForLoadState('domcontentloaded');

      // Dismiss any intro modals/overlays first
      const overlay = page.locator('.overlay, .modal, .intro, .splash, [class*="start-screen"]').first();
      const startBtn = overlay.locator('button, [role="button"]').first();
      if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await startBtn.click();
        await page.waitForTimeout(500);
      }

      // Check that foreground buttons are tappable (not blocked by overlays)
      const buttons = await page.locator('button:visible').all();
      let blocked = [];

      for (const btn of buttons) {
        const box = await btn.boundingBox();
        if (!box || box.width < 10 || box.height < 10) continue;

        const result = await page.evaluate(({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          if (!el) return { blocked: false };
          const btn = el.closest('button');
          if (btn) return { blocked: false };
          // Check if blocker is an intentional overlay (modal, overlay, backdrop)
          const cls = el.className?.toString() || '';
          const isIntentionalOverlay = /modal|overlay|backdrop|splash|intro/i.test(cls);
          if (isIntentionalOverlay) return { blocked: false }; // expected behavior
          return { blocked: true, tag: el.tagName, cls };
        }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

        if (result.blocked) {
          const btnText = await btn.textContent();
          blocked.push(`"${btnText?.trim()}" blocked by ${result.tag}.${result.cls}`);
        }
      }

      expect(blocked, `Blocked buttons: ${blocked.join(', ')}`).toEqual([]);
    });
  });
}
