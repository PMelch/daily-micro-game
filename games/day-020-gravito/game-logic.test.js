import { describe, test, expect } from 'bun:test';
import {
  parseLevel,
  slidePlayer,
  gravityDelta,
  isLevelComplete,
  TILE,
} from './game-logic.js';

// ─── parseLevel ───────────────────────────────────────────────────────────────

describe('parseLevel', () => {
  // Row 1: # P . * E #  → P@(1,1), .@(1,2), *@(1,3), E@(1,4)
  const SIMPLE = `
######
#P.*E#
######`.trim();

  test('finds player start position', () => {
    const { playerStart } = parseLevel(SIMPLE);
    expect(playerStart).toEqual({ r: 1, c: 1 });
  });

  test('replaces P with empty tile in grid', () => {
    const { grid } = parseLevel(SIMPLE);
    expect(grid[1][1]).toBe(TILE.EMPTY);
  });

  test('finds star positions', () => {
    const { stars } = parseLevel(SIMPLE);
    expect(stars).toHaveLength(1);
    expect(stars[0]).toEqual({ r: 1, c: 3 });
  });

  test('finds exit position', () => {
    const { exit } = parseLevel(SIMPLE);
    expect(exit).toEqual({ r: 1, c: 4 });
  });

  test('grid dimensions correct', () => {
    const { grid } = parseLevel(SIMPLE);
    expect(grid).toHaveLength(3);
    expect(grid[0]).toHaveLength(6);
  });

  test('level with no stars has empty stars array', () => {
    const noStars = `
###
#P#
#E#
###`.trim();
    const { stars } = parseLevel(noStars);
    expect(stars).toHaveLength(0);
  });
});

// ─── gravityDelta ──────────────────────────────────────────────────────────────

describe('gravityDelta', () => {
  test('down → dr=1, dc=0', () => expect(gravityDelta('down')).toEqual({ dr: 1, dc: 0 }));
  test('up → dr=-1, dc=0', () => expect(gravityDelta('up')).toEqual({ dr: -1, dc: 0 }));
  test('left → dr=0, dc=-1', () => expect(gravityDelta('left')).toEqual({ dr: 0, dc: -1 }));
  test('right → dr=0, dc=1', () => expect(gravityDelta('right')).toEqual({ dr: 0, dc: 1 }));
  test('unknown direction throws', () => expect(() => gravityDelta('diagonal')).toThrow());
});

// ─── slidePlayer ──────────────────────────────────────────────────────────────

describe('slidePlayer', () => {
  //  01234
  // 0 #####
  // 1 #...#
  // 2 #.*.#
  // 3 #..E#
  // 4 #####
  const LEVEL = `
#####
#...#
#.*.#
#..E#
#####`.trim();

  const { grid } = parseLevel(LEVEL);

  test('slides down until hitting bottom wall', () => {
    const { finalPos, hitSomething } = slidePlayer(grid, { r: 1, c: 1 }, 'down');
    expect(finalPos).toEqual({ r: 3, c: 1 });
    expect(hitSomething).toBe('wall');
  });

  test('slides right and hits star', () => {
    const { finalPos, hitSomething } = slidePlayer(grid, { r: 2, c: 1 }, 'right');
    expect(finalPos).toEqual({ r: 2, c: 2 });
    expect(hitSomething).toBe('star');
  });

  test('slides right and hits exit', () => {
    const { finalPos, hitSomething } = slidePlayer(grid, { r: 3, c: 1 }, 'right');
    expect(finalPos).toEqual({ r: 3, c: 3 });
    expect(hitSomething).toBe('exit');
  });

  test('path includes all intermediate cells', () => {
    const { path } = slidePlayer(grid, { r: 1, c: 1 }, 'down');
    // Goes from (1,1): visits (2,1), (3,1) before hitting wall at row 4
    expect(path).toHaveLength(2);
    expect(path[0]).toEqual({ r: 2, c: 1 });
    expect(path[1]).toEqual({ r: 3, c: 1 });
  });

  test('does not move if immediately blocked by wall', () => {
    // Player at (1,1), move left → wall at (1,0)
    const { finalPos, hitSomething, path } = slidePlayer(grid, { r: 1, c: 1 }, 'left');
    expect(finalPos).toEqual({ r: 1, c: 1 });
    expect(hitSomething).toBe('wall');
    expect(path).toHaveLength(0);
  });

  test('spike causes hitSomething=spike', () => {
    const SPIKE_LVL = `
#####
#P..#
#S..#
#####`.trim();
    const { grid: g } = parseLevel(SPIKE_LVL);
    const { hitSomething, finalPos } = slidePlayer(g, { r: 1, c: 1 }, 'down');
    expect(hitSomething).toBe('spike');
    expect(finalPos).toEqual({ r: 2, c: 1 });
  });

  test('slides up correctly', () => {
    const { finalPos, hitSomething } = slidePlayer(grid, { r: 3, c: 1 }, 'up');
    expect(finalPos).toEqual({ r: 1, c: 1 });
    expect(hitSomething).toBe('wall');
  });
});

// ─── isLevelComplete ──────────────────────────────────────────────────────────

describe('isLevelComplete', () => {
  const allStars = [{ r: 1, c: 2 }, { r: 2, c: 3 }];
  const exitPos = { r: 3, c: 3 };

  test('false when stars not all collected', () => {
    const collected = new Set(['1,2']); // only one star
    expect(isLevelComplete(collected, allStars, { r: 3, c: 3 }, exitPos)).toBe(false);
  });

  test('false when all stars collected but not at exit', () => {
    const collected = new Set(['1,2', '2,3']);
    expect(isLevelComplete(collected, allStars, { r: 1, c: 1 }, exitPos)).toBe(false);
  });

  test('true when all stars collected and at exit', () => {
    const collected = new Set(['1,2', '2,3']);
    expect(isLevelComplete(collected, allStars, { r: 3, c: 3 }, exitPos)).toBe(true);
  });

  test('true with no stars required and at exit', () => {
    expect(isLevelComplete(new Set(), [], { r: 3, c: 3 }, exitPos)).toBe(true);
  });

  test('false with no stars but not at exit', () => {
    expect(isLevelComplete(new Set(), [], { r: 1, c: 1 }, exitPos)).toBe(false);
  });
});
