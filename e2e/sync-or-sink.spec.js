// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Sync or Sink – multiplayer', () => {
  /** @type {import('@playwright/test').BrowserContext} */
  let hostCtx;
  /** @type {import('@playwright/test').BrowserContext} */
  let guestCtx;
  /** @type {import('@playwright/test').Page} */
  let hostPage;
  /** @type {import('@playwright/test').Page} */
  let guestPage;
  /** @type {import('child_process').ChildProcess} */
  let wsServer;

  const WS_PORT = 13017;
  const GAME_URL = '/games/day-017-sync-or-sink/';

  test.beforeAll(async ({ browser }, testInfo) => {
    if (testInfo.project.name.includes('mobile')) return;

    // Start WS server
    const { spawn } = require('child_process');
    wsServer = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..', 'games', 'day-017-sync-or-sink'),
      env: { ...process.env, PORT: String(WS_PORT) },
      stdio: 'pipe',
    });
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WS server start timeout')), 5000);
      wsServer.stdout.on('data', (d) => {
        if (d.toString().includes('running on port')) { clearTimeout(timeout); resolve(); }
      });
      wsServer.stderr.on('data', (d) => console.error('WS stderr:', d.toString()));
    });

    // Create two isolated browser contexts (= two players)
    const injectWsUrl = async (ctx) => {
      await ctx.addInitScript((port) => {
        window.__TEST_WS_URL = `ws://localhost:${port}`;
      }, WS_PORT);
      return ctx;
    };

    hostCtx = await injectWsUrl(await browser.newContext());
    guestCtx = await injectWsUrl(await browser.newContext());
    hostPage = await hostCtx.newPage();
    guestPage = await guestCtx.newPage();
  });

  test.afterAll(async () => {
    await hostCtx?.close();
    await guestCtx?.close();
    wsServer?.kill();
  });

  test('create room → join → play round → see results', async ({}, testInfo) => {
    if (testInfo.project.name.includes('mobile')) { test.skip(); return; }

    // Host creates room
    await hostPage.goto(GAME_URL);
    await hostPage.fill('#player-name', 'Host');
    await hostPage.click('#btn-create');
    await expect(hostPage.locator('#screen-lobby')).toHaveClass(/active/, { timeout: 5000 });

    const roomCode = await hostPage.locator('#lobby-code').textContent();
    expect(roomCode).toMatch(/^[A-Z]{4}$/);

    // Guest joins
    await guestPage.goto(GAME_URL);
    await guestPage.fill('#player-name', 'Guest');
    await guestPage.fill('#room-code-input', roomCode);
    await guestPage.click('#btn-join');
    await expect(guestPage.locator('#screen-lobby')).toHaveClass(/active/, { timeout: 5000 });

    // Both see 2 players
    await expect(hostPage.locator('.player-item')).toHaveCount(2);
    await expect(guestPage.locator('.player-item')).toHaveCount(2);

    // Host starts game
    await expect(hostPage.locator('#btn-start')).toBeVisible();
    await hostPage.click('#btn-start');

    // Both see round screen
    await expect(hostPage.locator('#screen-round')).toHaveClass(/active/, { timeout: 8000 });
    await expect(guestPage.locator('#screen-round')).toHaveClass(/active/, { timeout: 8000 });

    // Both press sync
    await hostPage.locator('#sync-btn').click();
    await guestPage.locator('#sync-btn').click();

    // Both see round result
    await expect(hostPage.locator('#screen-result')).toHaveClass(/active/, { timeout: 6000 });
    await expect(guestPage.locator('#screen-result')).toHaveClass(/active/, { timeout: 6000 });

    // Valid grade
    const grade = await hostPage.locator('#result-grade').textContent();
    expect(['S', 'A', 'B', 'C', 'D', 'F']).toContain(grade);

    // Score table has both players
    await expect(hostPage.locator('#score-rows tr')).toHaveCount(2);
  });

  test('sync button is not blocked by wave-ring overlays', async ({}, testInfo) => {
    if (testInfo.project.name.includes('mobile')) { test.skip(); return; }

    await hostPage.goto(GAME_URL);

    // Force round screen visible
    await hostPage.evaluate(() => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-round').classList.add('active');
    });

    const btn = hostPage.locator('#sync-btn');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();

    // Element at button center must be the button or its child, not a wave-ring
    const hit = await hostPage.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      const isInsideButton = !!el?.closest('button#sync-btn');
      return { tag: el?.tagName, cls: el?.className || '', isInsideButton };
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

    expect(hit.isInsideButton, `Button center hit ${hit.tag}.${hit.cls} — not inside sync-btn`).toBe(true);
    expect(hit.cls, 'Should not hit wave-ring').not.toContain('wave-ring');
  });
});
