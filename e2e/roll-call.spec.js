// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Roll Call — E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/games/day-050-roll-call/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('shows intro screen on load', async ({ page }) => {
    await expect(page.locator('#intro-screen')).toBeVisible();
    await expect(page.locator('#start-btn')).toBeVisible();
  });

  test('dismisses intro and shows game', async ({ page }) => {
    await page.locator('#start-btn').click();
    await expect(page.locator('#intro-screen')).not.toBeVisible();
    await expect(page.locator('#grid-canvas')).toBeVisible();
  });

  test('D-pad buttons are visible and clickable', async ({ page }) => {
    await page.locator('#start-btn').click();
    
    for (const id of ['#btn-up', '#btn-down', '#btn-left', '#btn-right']) {
      const btn = page.locator(id);
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box).toBeTruthy();
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('Level 1: can solve with two right moves', async ({ page }) => {
    await page.locator('#start-btn').click();
    
    await page.locator('#btn-right').click();
    await page.locator('#btn-right').click();
    
    // Should show level clear screen
    await expect(page.locator('#clear-screen')).toBeVisible({ timeout: 2000 });
  });

  test('Level 2: BFS-verified solution works', async ({ page }) => {
    await page.locator('#start-btn').click();
    
    // Solve level 1
    await page.locator('#btn-right').click();
    await page.locator('#btn-right').click();
    await page.locator('#next-btn').click();
    
    // Level 2 solution from BFS: RRDRULDDDRRD
    for (const dir of 'RRDRULDDDRRD'.split('')) {
      const btn = {R:'right',L:'left',U:'up',D:'down'}[dir];
      await page.locator(`#btn-${btn}`).click();
    }
    
    await expect(page.locator('#clear-screen')).toBeVisible({ timeout: 3000 });
  });

  test('keyboard controls work', async ({ page }) => {
    await page.locator('#start-btn').click();
    
    await page.keyboard.press('ArrowRight');
    const movesText = await page.locator('#moves-count').textContent();
    expect(parseInt(movesText)).toBe(1);
  });

  test('walls block movement', async ({ page }) => {
    await page.locator('#start-btn').click();
    
    // Level 1: corridor is single row, can't go up
    await page.keyboard.press('ArrowUp');
    const movesText = await page.locator('#moves-count').textContent();
    expect(parseInt(movesText)).toBe(0);
  });

  test('all levels are solvable (BFS solver)', async ({ page }) => {
    await page.locator('#start-btn').click();
    
    const results = await page.evaluate(() => {
      class D {
        constructor(f) { this.f = f || [1,6,2,5,3,4]; }
        get bot() { return this.f[1]; }
        rr() { const [t,b,f,bk,r,l]=this.f; return new D([l,r,f,bk,t,b]); }
        rl() { const [t,b,f,bk,r,l]=this.f; return new D([r,l,f,bk,b,t]); }
        ru() { const [t,b,f,bk,r,l]=this.f; return new D([f,bk,b,t,r,l]); }
        rd() { const [t,b,f,bk,r,l]=this.f; return new D([bk,f,t,b,r,l]); }
        key() { return this.f.join(','); }
      }
      const results = [];
      for (let li = 0; li < LEVELS.length; li++) {
        const lv = LEVELS[li];
        const grid = lv.grid;
        const gates = lv.gates || [];
        const rows = grid.length, cols = grid[0].length;
        let start, exit;
        for (let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
          if(grid[r][c]===2) start={x:c,y:r};
          if(grid[r][c]===3) exit={x:c,y:r};
        }
        const gateAt = (x,y) => gates.find(g=>g.x===x&&g.y===y);
        const q = [{x:start.x, y:start.y, die: new D(), moves: 0}];
        const visited = new Set();
        visited.add(`${start.x},${start.y},${new D().key()}`);
        let solved = false, best = null, iter = 0;
        while (q.length > 0 && iter < 200000) {
          iter++;
          const s = q.shift();
          if (s.x===exit.x && s.y===exit.y) { solved=true; best=s.moves; break; }
          for (const [dx,dy] of [[1,0],[-1,0],[0,-1],[0,1]]) {
            const nx=s.x+dx, ny=s.y+dy;
            if(nx<0||ny<0||ny>=rows||nx>=cols||grid[ny][nx]===1) continue;
            let nd;
            if(dx===1) nd=s.die.rr(); else if(dx===-1) nd=s.die.rl();
            else if(dy===-1) nd=s.die.ru(); else nd=s.die.rd();
            const gate = gateAt(nx,ny);
            if(gate && nd.bot!==gate.need) continue;
            const key = `${nx},${ny},${nd.key()}`;
            if(visited.has(key)) continue;
            visited.add(key);
            q.push({x:nx, y:ny, die:nd, moves:s.moves+1});
          }
        }
        results.push({ level: li+1, solved, best, par: lv.par });
      }
      return results;
    });
    
    for (const r of results) {
      expect(r.solved, `Level ${r.level} must be solvable`).toBe(true);
      expect(r.best, `Level ${r.level} optimal (${r.best}) must be <= par (${r.par})`).toBeLessThanOrEqual(r.par);
    }
  });

  test('mobile: D-pad fits in viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/games/day-050-roll-call/');
    await page.locator('#start-btn').click();
    
    for (const id of ['#btn-up', '#btn-down', '#btn-left', '#btn-right']) {
      const btn = page.locator(id);
      const box = await btn.boundingBox();
      expect(box, `${id} must have a bounding box`).toBeTruthy();
      expect(box.y + box.height).toBeLessThanOrEqual(667);
    }
  });
});
