import { describe, expect, test } from 'bun:test';
import {
  getRopeLength,
  isSelfIntersecting,
  evaluateLoop,
  LEVELS,
} from './logic.js';

describe('Constellation Corral geometry', () => {
  test('getRopeLength sums all loop segments including the closing edge', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 4 },
    ];

    expect(getRopeLength(points)).toBe(12);
  });

  test('isSelfIntersecting detects crossed polygons', () => {
    const bow = [
      { x: 0, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
      { x: 4, y: 0 },
    ];

    expect(isSelfIntersecting(bow)).toBe(true);
  });
});

describe('Constellation Corral level evaluation', () => {
  test('successful loop captures all stars without hazards and stays on budget', () => {
    const level = LEVELS[0];
    const result = evaluateLoop(level, ['a', 'b', 'd', 'e']);

    expect(result.success).toBe(true);
    expect(result.capturedStars).toBe(level.stars.length);
    expect(result.capturedHazards).toBe(0);
    expect(result.failureReason).toBe('');
  });

  test('hazards inside the loop fail the attempt', () => {
    const level = LEVELS[1];
    const result = evaluateLoop(level, ['a', 'b', 'c', 'd', 'e']);

    expect(result.success).toBe(false);
    expect(result.capturedHazards).toBeGreaterThan(0);
    expect(result.failureReason).toBe('hazard');
  });

  test('budget overflow fails even when stars are captured', () => {
    const level = LEVELS[2];
    const result = evaluateLoop(level, ['a', 'b', 'c', 'd', 'e', 'f']);

    expect(result.success).toBe(false);
    expect(result.ropeUsed).toBeGreaterThan(level.budget);
    expect(result.failureReason).toBe('budget');
  });
});
