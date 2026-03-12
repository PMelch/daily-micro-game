// TDD Tests for Neon Stack game logic
// Run with: bun test

import { describe, test, expect } from 'bun:test';
import {
  calculateOverlap,
  isPerfectDrop,
  getNextSpeed,
  computeScore,
  getPlatformScreenY,
  clampMoving,
} from './game-logic.js';

describe('calculateOverlap', () => {
  test('returns full overlap when perfectly aligned', () => {
    const result = calculateOverlap({ x: 100, width: 80 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(80);
    expect(result.overlapX).toBe(100);
  });

  test('calculates partial overlap from right side', () => {
    // current: 120-200, previous: 100-180 → overlap: 120-180 = 60
    const result = calculateOverlap({ x: 120, width: 80 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(60);
    expect(result.overlapX).toBe(120);
  });

  test('calculates partial overlap from left side', () => {
    // current: 80-160, previous: 100-180 → overlap: 100-160 = 60
    const result = calculateOverlap({ x: 80, width: 80 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(60);
    expect(result.overlapX).toBe(100);
  });

  test('returns zero overlap when completely missed to the right', () => {
    const result = calculateOverlap({ x: 200, width: 80 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(0);
  });

  test('returns zero overlap when completely missed to the left', () => {
    const result = calculateOverlap({ x: 0, width: 80 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(0);
  });

  test('handles current fully contained within previous', () => {
    const result = calculateOverlap({ x: 110, width: 60 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(60);
    expect(result.overlapX).toBe(110);
  });

  test('handles current fully containing previous', () => {
    const result = calculateOverlap({ x: 90, width: 100 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(80);
    expect(result.overlapX).toBe(100);
  });

  test('overlapWidth is never negative', () => {
    const result = calculateOverlap({ x: 300, width: 80 }, { x: 0, width: 80 });
    expect(result.overlapWidth).toBeGreaterThanOrEqual(0);
  });

  test('handles touch at exact boundary (no actual overlap)', () => {
    // current right edge touches previous left edge exactly
    const result = calculateOverlap({ x: 20, width: 80 }, { x: 100, width: 80 });
    expect(result.overlapWidth).toBe(0);
  });
});

describe('isPerfectDrop', () => {
  test('returns true when perfectly aligned (same x and width)', () => {
    const current = { x: 100, width: 80 };
    const previous = { x: 100, width: 80 };
    expect(isPerfectDrop(current, previous, 2)).toBe(true);
  });

  test('returns true when within threshold on left', () => {
    const current = { x: 101.5, width: 80 };
    const previous = { x: 100, width: 80 };
    expect(isPerfectDrop(current, previous, 2)).toBe(true);
  });

  test('returns true when within threshold on right', () => {
    const current = { x: 98.5, width: 80 };
    const previous = { x: 100, width: 80 };
    expect(isPerfectDrop(current, previous, 2)).toBe(true);
  });

  test('returns false when misaligned beyond threshold', () => {
    const current = { x: 110, width: 80 };
    const previous = { x: 100, width: 80 };
    expect(isPerfectDrop(current, previous, 2)).toBe(false);
  });

  test('threshold edge: just within', () => {
    // diff of 1.9 on left, right aligns exactly
    const current = { x: 101.9, width: 80 };
    const previous = { x: 100, width: 80 };
    expect(isPerfectDrop(current, previous, 2)).toBe(true);
  });

  test('threshold edge: just outside', () => {
    const current = { x: 102.1, width: 80 };
    const previous = { x: 100, width: 80 };
    expect(isPerfectDrop(current, previous, 2)).toBe(false);
  });
});

describe('getNextSpeed', () => {
  test('returns base speed at level 0', () => {
    expect(getNextSpeed(0)).toBeCloseTo(2.5);
  });

  test('increases speed with level 1', () => {
    expect(getNextSpeed(1)).toBeGreaterThan(getNextSpeed(0));
  });

  test('increases speed with level 5', () => {
    expect(getNextSpeed(5)).toBeGreaterThan(getNextSpeed(1));
  });

  test('caps at maxSpeed at high levels', () => {
    expect(getNextSpeed(100)).toBe(7);
    expect(getNextSpeed(50)).toBe(7);
  });

  test('speed at level 10 is between base and max', () => {
    const speed = getNextSpeed(10);
    expect(speed).toBeGreaterThan(2.5);
    expect(speed).toBeLessThanOrEqual(7);
  });
});

describe('computeScore', () => {
  test('returns 10 for a normal drop', () => {
    expect(computeScore(false, 0)).toBe(10);
  });

  test('returns 15 for a perfect drop', () => {
    expect(computeScore(true, 0)).toBe(15);
  });

  test('returns 20 for a perfect drop with streak bonus', () => {
    // streak >= 3 gives +5 bonus on top of perfect 15
    expect(computeScore(true, 3)).toBe(20);
  });

  test('no streak bonus for normal drops regardless of streak', () => {
    expect(computeScore(false, 5)).toBe(10);
  });

  test('streak bonus only kicks in at streak >= 3', () => {
    expect(computeScore(true, 2)).toBe(15); // no bonus yet
    expect(computeScore(true, 3)).toBe(20); // bonus kicks in
  });
});

describe('getPlatformScreenY', () => {
  const PH = 20;
  const ACTIVE_Y = 100;

  test('moving platform (currentLevel) renders at ACTIVE_Y', () => {
    expect(getPlatformScreenY(5, 5, ACTIVE_Y, PH)).toBe(100);
  });

  test('platform one level below is PH pixels lower', () => {
    expect(getPlatformScreenY(4, 5, ACTIVE_Y, PH)).toBe(120);
  });

  test('platform two levels below is 2*PH pixels lower', () => {
    expect(getPlatformScreenY(3, 5, ACTIVE_Y, PH)).toBe(140);
  });

  test('base platform (level 0) with currentLevel 10 is far below', () => {
    const y = getPlatformScreenY(0, 10, ACTIVE_Y, PH);
    expect(y).toBe(300); // 100 + 10*20
  });

  test('formula: activeY + (currentLevel - platformLevel) * PH', () => {
    for (let cl = 1; cl <= 15; cl++) {
      for (let pl = 0; pl <= cl; pl++) {
        const expected = ACTIVE_Y + (cl - pl) * PH;
        expect(getPlatformScreenY(pl, cl, ACTIVE_Y, PH)).toBe(expected);
      }
    }
  });
});

describe('clampMoving', () => {
  test('reverses direction at right boundary', () => {
    const m = { x: 290, width: 80, direction: 1, speed: 3 };
    const result = clampMoving(m, 360);
    expect(result.direction).toBe(-1);
  });

  test('reverses direction at left boundary', () => {
    const m = { x: -50, width: 80, direction: -1, speed: 3 };
    const result = clampMoving(m, 360);
    expect(result.direction).toBe(1);
  });

  test('keeps direction when in bounds', () => {
    const m = { x: 100, width: 80, direction: 1, speed: 3 };
    const result = clampMoving(m, 360);
    expect(result.direction).toBe(1);
  });

  test('does not mutate original object', () => {
    const m = { x: 290, width: 80, direction: 1, speed: 3 };
    clampMoving(m, 360);
    expect(m.direction).toBe(1); // unchanged
  });
});
