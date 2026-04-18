const { test } = require('@playwright/test');
const { spawn } = require('child_process');

const SERVER_DIR = '/home/peter/projects/daily-games/games/day-064-crew-circuit/server';
const WS_PORT = 13164;

test('capture Crew Circuit gameplay screenshot', async ({ browser }) => {
  const server = spawn('node', ['server.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(WS_PORT) },
    stdio: 'pipe',
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('ws timeout')), 5000);
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Crew Circuit server running')) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  const hostCtx = await browser.newContext({ viewport: { width: 480, height: 640 } });
  const guestCtx = await browser.newContext({ viewport: { width: 480, height: 640 } });
  await hostCtx.addInitScript((port) => { window.__TEST_WS_URL = `ws://localhost:${port}`; }, WS_PORT);
  await guestCtx.addInitScript((port) => { window.__TEST_WS_URL = `ws://localhost:${port}`; }, WS_PORT);

  const host = await hostCtx.newPage();
  const guest = await guestCtx.newPage();

  await host.goto('/games/day-064-crew-circuit/');
  await host.fill('#player-name', 'Ada');
  await host.click('#btn-create');
  const roomCode = await host.locator('#lobby-code').textContent();

  await guest.goto('/games/day-064-crew-circuit/');
  await guest.fill('#player-name', 'Ben');
  await guest.fill('#room-code-input', roomCode);
  await guest.click('#btn-join');
  await host.click('#btn-start');
  await host.waitForSelector('#screen-game.active');

  const pressAssigned = async (page) => {
    const role = await page.locator('#role-badge').textContent();
    const map = { UP: 'btn-up', RIGHT: 'btn-right', DOWN: 'btn-down', LEFT: 'btn-left', SCAN: 'btn-scan', STUN: 'btn-stun' };
    const id = map[role.trim().toUpperCase()];
    await page.locator(`#${id}`).click();
  };

  await pressAssigned(host);
  await guest.waitForTimeout(200);
  await host.screenshot({ path: 'games/day-064-crew-circuit/screenshot.png' });

  await hostCtx.close();
  await guestCtx.close();
  server.kill();
});
