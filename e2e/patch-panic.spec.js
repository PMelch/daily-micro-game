// @ts-check
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const SERVER_DIR = '/home/peter/projects/daily-games/games/day-057-patch-panic/server';

test.describe('Patch Panic multiplayer', () => {
  let server;
  let hostPage;
  let guestPage;
  let hostCtx;
  let guestCtx;
  const WS_PORT = 13057;
  const GAME_URL = '/games/day-057-patch-panic/';

  test.beforeAll(async ({ browser }) => {
    server = spawn('node', ['server.js'], {
      cwd: SERVER_DIR,
      env: { ...process.env, PORT: String(WS_PORT) },
      stdio: 'pipe',
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Patch Panic ws start timeout')), 5000);
      server.stdout.on('data', (data) => {
        if (data.toString().includes('Patch Panic server running')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      server.stderr.on('data', (data) => console.error(data.toString()));
    });

    const inject = async (ctx) => {
      await ctx.addInitScript((port) => { window.__TEST_WS_URL = `ws://localhost:${port}`; }, WS_PORT);
      return ctx;
    };

    hostCtx = await inject(await browser.newContext());
    guestCtx = await inject(await browser.newContext());
    hostPage = await hostCtx.newPage();
    guestPage = await guestCtx.newPage();
  });

  test.afterAll(async () => {
    await hostCtx?.close();
    await guestCtx?.close();
    server?.kill();
  });

  test('host creates room, guest joins, and game starts', async () => {
    await hostPage.goto(GAME_URL);
    await hostPage.fill('#player-name', 'Ada');
    await hostPage.click('#btn-create');
    await expect(hostPage.locator('#screen-lobby')).toHaveClass(/active/);

    const roomCode = await hostPage.locator('#lobby-code').textContent();
    expect(roomCode).toMatch(/^[A-Z]{4}$/);

    await guestPage.goto(GAME_URL);
    await guestPage.fill('#player-name', 'Bob');
    await guestPage.fill('#room-code-input', roomCode);
    await guestPage.click('#btn-join');
    await expect(guestPage.locator('#screen-lobby')).toHaveClass(/active/);

    await expect(hostPage.locator('#lobby-players .player-row')).toHaveCount(2);
    await hostPage.click('#btn-start');

    await expect(hostPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
    await expect(guestPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
    await expect(hostPage.locator('#role-banner')).not.toBeEmpty();
    await expect(guestPage.locator('#role-banner')).not.toBeEmpty();
  });

  test('players can act on incidents and hull/time HUD is visible', async () => {
    await expect(hostPage.locator('#hud-hull')).toBeVisible();
    await expect(hostPage.locator('#hud-time')).toBeVisible();
    await expect(hostPage.locator('.incident button')).toHaveCount(2);

    const before = Number(await hostPage.locator('#hud-time').textContent());
    await hostPage.locator('.incident button').first().click();
    await hostPage.waitForTimeout(500);
    const after = Number(await hostPage.locator('#hud-time').textContent());
    expect(after).toBeLessThanOrEqual(before);
  });

  test('mobile layout keeps tool buttons in viewport', async () => {
    await hostPage.setViewportSize({ width: 480, height: 640 });
    const buttons = await hostPage.locator('.incident button').all();
    for (const button of buttons) {
      const box = await button.boundingBox();
      expect(box).toBeTruthy();
      expect(box.y + box.height).toBeLessThanOrEqual(640);
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
});
