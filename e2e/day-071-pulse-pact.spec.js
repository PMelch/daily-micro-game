// @ts-check
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

const SERVER_DIR = '/home/peter/projects/daily-games/games/day-071-pulse-pact/server';
const GAME_URL = '/games/day-071-pulse-pact/';
const WS_PORT = 13071;

async function startWsServer() {
  const server = spawn('node', ['server.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(WS_PORT) },
    stdio: 'pipe',
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Pulse Pact ws start timeout')), 5000);
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Pulse Pact server running')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on('data', (data) => console.error(data.toString()));
  });

  return server;
}

function assignedButtons(page) {
  return page.locator('.lane-btn:not([disabled])');
}

async function bootstrapMatch(hostPage, guestPage) {
  await hostPage.goto(GAME_URL);
  await hostPage.fill('#player-name', 'Ada');
  await hostPage.click('#btn-create');
  await expect(hostPage.locator('#lobby-code')).not.toHaveText('----');
  const roomCode = await hostPage.locator('#lobby-code').textContent();
  expect(roomCode).toMatch(/^[A-Z]{4}$/);

  await guestPage.goto(GAME_URL);
  await guestPage.fill('#player-name', 'Ben');
  await guestPage.fill('#room-code-input', roomCode);
  await guestPage.click('#btn-join');

  await expect(hostPage.locator('#lobby-players .player-pill')).toHaveCount(2);
  await hostPage.click('#btn-start');
  await expect(hostPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
  await expect(guestPage.locator('#screen-game')).toHaveClass(/active/, { timeout: 5000 });
}

test.describe('Pulse Pact multiplayer', () => {
  /** @type {import('child_process').ChildProcessWithoutNullStreams | undefined} */
  let server;
  let hostCtx;
  let guestCtx;
  let hostPage;
  let guestPage;

  test.beforeAll(async ({ browser }) => {
    server = await startWsServer();

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

  test('host creates room, guest joins, game starts, and hits raise team score', async () => {
    await bootstrapMatch(hostPage, guestPage);
    await expect(assignedButtons(hostPage)).toHaveCount(3);
    await expect(assignedButtons(guestPage)).toHaveCount(3);

    const before = Number(await hostPage.locator('#score-value').textContent());
    await hostPage.waitForTimeout(2600);
    for (let i = 0; i < 8; i += 1) {
      await assignedButtons(hostPage).first().click();
      await assignedButtons(guestPage).first().click();
      await hostPage.waitForTimeout(180);
    }

    expect(await hostPage.locator('.note').count()).toBeGreaterThan(0);
    const after = Number(await hostPage.locator('#score-value').textContent());
    expect(after).toBeGreaterThan(before);
    await expect(guestPage.locator('#score-value')).toHaveText(String(after));
  });

  test('mobile touch targets stay large enough and inside viewport', async () => {
    await bootstrapMatch(hostPage, guestPage);
    const buttons = hostPage.locator('.lane-btn');
    const count = await buttons.count();
    expect(count).toBe(6);

    for (let i = 0; i < count; i += 1) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).toBeTruthy();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(640);
    }
  });
});
