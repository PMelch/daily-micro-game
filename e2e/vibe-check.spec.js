// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Vibe Check (day-054)', () => {
  const URL = '/games/day-054-vibe-check/';

  test('page loads without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto(URL);
    expect(response.status()).toBe(200);
    await page.waitForLoadState('domcontentloaded');
    expect(errors).toEqual([]);
  });

  test('setup screen is visible on load', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#screen-setup')).toBeVisible();
    await expect(page.locator('#screen-setup h1')).toContainText('Vibe Check');
  });

  test('has player count buttons', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    const btns = page.locator('.cnt-btn');
    await expect(btns).toHaveCount(3);
  });

  test('player rows update when count changes', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    // Default is 2 players
    await expect(page.locator('.player-row')).toHaveCount(2);
    // Switch to 3
    await page.locator('.cnt-btn[data-n="3"]').click();
    await expect(page.locator('.player-row')).toHaveCount(3);
    // Switch to 4
    await page.locator('.cnt-btn[data-n="4"]').click();
    await expect(page.locator('.player-row')).toHaveCount(4);
  });

  test('start button is present and clickable', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#btn-start')).toBeVisible();
    await page.locator('#btn-start').click();
    // Should advance to handoff screen
    await expect(page.locator('#screen-handoff-clue')).toBeVisible({ timeout: 2000 });
  });

  test('full 2-player game flow: setup → clue → guess → reveal', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');

    // Setup with default 2 players
    await page.locator('#btn-start').click();

    // Clue giver handoff
    await expect(page.locator('#screen-handoff-clue')).toBeVisible();
    await page.locator('#btn-ready-clue').click();

    // Clue screen
    await expect(page.locator('#screen-clue')).toBeVisible();
    // Spectrum labels should be set
    await expect(page.locator('#cl-left')).not.toBeEmpty();
    await expect(page.locator('#cl-right')).not.toBeEmpty();
    // Target zone canvas present
    await expect(page.locator('#target-zone-canvas')).toBeVisible();
    // Enter a clue
    await page.locator('#clue-input').fill('Volcano');
    await page.locator('#btn-submit-clue').click();

    // Guess handoff
    await expect(page.locator('#screen-handoff-guess')).toBeVisible();
    // Clue word should be visible in handoff
    await expect(page.locator('#hg-clue-display')).toContainText('Volcano');
    await page.locator('#btn-ready-guess').click();

    // Guess screen
    await expect(page.locator('#screen-guess')).toBeVisible();
    await expect(page.locator('#gs-clue')).toContainText('Volcano');
    // Spectrum labels set
    await expect(page.locator('#gs-left')).not.toBeEmpty();
    await page.locator('#btn-submit-guess').click();

    // Reveal screen
    await expect(page.locator('#screen-reveal')).toBeVisible();
    // Score displayed
    await expect(page.locator('#rv-score-big')).toBeVisible();
    // Both needles visible (target + guess SVG drawn)
    await expect(page.locator('#reveal-svg-wrap svg')).toBeVisible();
  });

  test('back bar link is present', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.back-bar a')).toBeVisible();
    await expect(page.locator('.back-bar a')).toHaveAttribute('href', '/');
  });

  test('language selector is injected by i18n module', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.lang-selector')).toBeVisible();
    await expect(page.locator('.lang-btn')).toHaveCount(5);
  });

  test('switching language updates UI text', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');
    // Click English
    await page.locator('.lang-btn[data-lang="en"]').click();
    await expect(page.locator('#btn-start')).toContainText('Start game');
  });

  test('game reaches final screen after all rounds', async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('domcontentloaded');

    // 2 players = 4 rounds
    await page.locator('#btn-start').click();

    for (let round = 0; round < 4; round++) {
      // Handoff clue
      await expect(page.locator('#screen-handoff-clue')).toBeVisible({ timeout: 3000 });
      await page.locator('#btn-ready-clue').click();

      // Clue screen
      await expect(page.locator('#screen-clue')).toBeVisible({ timeout: 3000 });
      await page.locator('#clue-input').fill(`Clue${round}`);
      await page.locator('#btn-submit-clue').click();

      // Handoff guess
      await expect(page.locator('#screen-handoff-guess')).toBeVisible({ timeout: 3000 });
      await page.locator('#btn-ready-guess').click();

      // Guess screen
      await expect(page.locator('#screen-guess')).toBeVisible({ timeout: 3000 });
      await page.locator('#btn-submit-guess').click();

      // Reveal
      await expect(page.locator('#screen-reveal')).toBeVisible({ timeout: 3000 });
      await page.locator('#btn-next-round').click();
    }

    // Final screen
    await expect(page.locator('#screen-final')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#final-podium')).toBeVisible();
    await expect(page.locator('#btn-play-again')).toBeVisible();
  });
});
