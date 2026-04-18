// @ts-check
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

const SERVER_DIR = '/home/peter/projects/daily-games/games/day-064-crew-circuit/server';
const GAME_URL = '/games/day-064-crew-circuit/';
const WS_PORT = 13064;

test.describe('Crew Circuit multiplayer', () => {
  let server;
  let hostCtx;
  let guestCtx;
  let hostPage;
  let guestPage;

  test.beforeAll(async ({ browser }) => {
    server = spawn('node', ['server.js'], {
      cwd: SERVER_DIR,
      env: { ...process.env, PORT: String(WS_PORT) },
      stdio: 'pipe',
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Crew Circuit ws start timeout')), 5000);
      server.stdout.on('data', (data) => {
        if (data.toString().includes('Crew Circuit server running')) {
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

    hostCtx = await inject(await browser.newContext({ viewport: { width: 480, height: 640 } }));
    guestCtx = await inject(await browser.newContext({ viewport: { width: 480, height: 640 } }));
    hostPage = await hostCtx.newPage();
    guestPage = await guestCtx.newPage();
  });

  test.afterAll(async () => {
    await hostCtx?.close();
    await guestCtx?.close();
    server?.kill();
  });

  test('host creates room, guest joins, roles appear, and a move updates the shared board', async () => {
    await hostPage.goto(GAME_URL);
    await hostPage.fill('#player-name', 'Ada');
    await hostPage.click('#btn-create');
    const roomCode = await hostPage.locator('#lobby-code').textContent();
    expect(roomCode).toMatch(/^[A-Z]{4}$/);

    await guestPage.goto(GAME_URL);
    await guestPage.fill('#player-name', 'Ben');
    await guestPage.fill('#room-code-input', roomCode);
    await guestPage.click('#btn-join');

    await expect(hostPage.locator('#lobby-players .player-row')).toHaveCount(2);
    await hostPage.click('#btn-start');

    await expect(hostPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
    await expect(guestPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
    await expect(hostPage.locator('#role-badge')).not.toBeEmpty();
    await expect(guestPage.locator('#role-badge')).not.toBeEmpty();

    const before = await hostPage.locator('#drone-pos').textContent();

    const hostRole = (await hostPage.locator('#role-badge').textContent()).trim().toUpperCase();
    const guestRole = (await guestPage.locator('#role-badge').textContent()).trim().toUpperCase();
    const moverPage = hostRole === 'RIGHT' ? hostPage : guestRole === 'RIGHT' ? guestPage : hostPage;
    await moverPage.locator('#btn-right').click();

    await hostPage.waitForTimeout(300);
    const after = await hostPage.locator('#drone-pos').textContent();
    expect(after).not.toBe(before);
    await expect(guestPage.locator('#drone-pos')).toHaveText(after);
  });

  test('mobile buttons stay inside viewport and assigned action is enabled', async () => {
    await expect(hostPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
    await hostPage.setViewportSize({ width: 480, height: 640 });
    for (const id of ['#btn-up', '#btn-right', '#btn-down', '#btn-left', '#btn-scan', '#btn-stun']) {
      const box = await hostPage.locator(id).boundingBox();
      expect(box).toBeTruthy();
      expect(box.y + box.height).toBeLessThanOrEqual(640);
      expect(box.height).toBeGreaterThanOrEqual(40);
    }

    const enabledCount = await hostPage.locator('.action-btn:not([disabled])').count();
    expect(enabledCount).toBe(1);
  });
});
