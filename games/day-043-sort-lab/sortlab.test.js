// Sort Lab TDD Tests — bun test
import { describe, it, expect } from 'bun:test';
const { topColor, topCount, canMove, applyMove, isSolved, isStuck, getLevel, totalBalls, TUBE_CAPACITY } = require('./sortlab.js');

describe('topColor', () => {
  it('returns null for empty tube', () => {
    expect(topColor([])).toBeNull();
    expect(topColor(null)).toBeNull();
  });
  it('returns the top (last) element', () => {
    expect(topColor(['r', 'g', 'b'])).toBe('b');
    expect(topColor(['r'])).toBe('r');
  });
});

describe('topCount', () => {
  it('returns 0 for empty tube', () => {
    expect(topCount([])).toBe(0);
  });
  it('counts contiguous top color', () => {
    expect(topCount(['r', 'g', 'g'])).toBe(2);
    expect(topCount(['r', 'g', 'g', 'g'])).toBe(3);
    expect(topCount(['r', 'g', 'b'])).toBe(1);
  });
  it('counts whole tube if all same', () => {
    expect(topCount(['r', 'r', 'r', 'r'])).toBe(4);
  });
});

describe('canMove', () => {
  it('returns false if source is empty', () => {
    const tubes = [[], ['r', 'g']];
    expect(canMove(tubes, 0, 1)).toBe(false);
  });
  it('returns false if from === to', () => {
    const tubes = [['r', 'g'], ['b']];
    expect(canMove(tubes, 0, 0)).toBe(false);
  });
  it('returns false if destination is full', () => {
    const tubes = [['r', 'g', 'b', 'y'], ['r', 'r', 'r', 'r']];
    expect(canMove(tubes, 0, 1)).toBe(false);
    expect(canMove(tubes, 1, 0)).toBe(false);
  });
  it('allows move to empty tube', () => {
    const tubes = [['r', 'g'], []];
    expect(canMove(tubes, 0, 1)).toBe(true);
  });
  it('allows move when top colors match', () => {
    const tubes = [['r', 'g'], ['b', 'g']];
    expect(canMove(tubes, 0, 1)).toBe(true);
  });
  it('disallows move when top colors differ', () => {
    const tubes = [['r', 'g'], ['b', 'r']];
    expect(canMove(tubes, 0, 1)).toBe(false);
  });
});

describe('applyMove', () => {
  it('throws on invalid move', () => {
    const tubes = [[], ['r']];
    expect(() => applyMove(tubes, 0, 1)).toThrow();
  });
  it('pours matching top block', () => {
    // top of tube0 is 'g', top of tube1 is 'g' → should pour
    const tubes = [['r', 'g', 'g'], ['b', 'g'], []];
    const next = applyMove(tubes, 0, 1);
    expect(next[0]).toEqual(['r']);
    expect(next[1]).toEqual(['b', 'g', 'g', 'g']);
  });
  it('pours only up to TUBE_CAPACITY', () => {
    // from has 3 g's, to has ['r','g'] (2 items, 2 free slots)
    // Should pour 2 g's (fills dest), 1 g remains in source
    const tubes = [['g', 'g', 'g'], ['r', 'g']];
    const next = applyMove(tubes, 0, 1);
    expect(next[1].length).toBe(TUBE_CAPACITY);
    expect(next[1]).toEqual(['r', 'g', 'g', 'g']); // 2 g's poured in
    expect(next[0]).toEqual(['g']); // 1 g remains
  });
  it('does not mutate original tubes (immutability)', () => {
    const tubes = [['r', 'g'], ['b', 'g']];
    const original = tubes.map(t => [...t]);
    applyMove(tubes, 0, 1);
    expect(tubes[0]).toEqual(original[0]);
    expect(tubes[1]).toEqual(original[1]);
  });
  it('pours to empty tube', () => {
    const tubes = [['r', 'r'], []];
    const next = applyMove(tubes, 0, 1);
    expect(next[1]).toEqual(['r', 'r']);
    expect(next[0]).toEqual([]);
  });
});

describe('isSolved', () => {
  it('returns true for empty tubes', () => {
    expect(isSolved([[], []])).toBe(true);
  });
  it('returns false when tube partially filled', () => {
    expect(isSolved([['r', 'r'], []])).toBe(false);
  });
  it('returns false when tube has mixed colors', () => {
    expect(isSolved([['r', 'g', 'r', 'g'], []])).toBe(false);
  });
  it('returns true for fully sorted tubes', () => {
    expect(isSolved([['r', 'r', 'r', 'r'], ['g', 'g', 'g', 'g'], []])).toBe(true);
  });
  it('returns false if one tube unsolved', () => {
    expect(isSolved([['r', 'r', 'r', 'r'], ['g', 'g', 'g', 'b'], []])).toBe(false);
  });
});

describe('isStuck', () => {
  it('returns false when valid moves exist', () => {
    const tubes = [['r', 'g'], ['b', 'g'], []];
    expect(isStuck(tubes)).toBe(false);
  });
  it('returns true when no moves are possible', () => {
    // All tubes full and no matching tops and no empty tubes
    const tubes = [
      ['r', 'g', 'b', 'y'],
      ['y', 'b', 'g', 'r'],
      ['g', 'r', 'y', 'b'],
      ['b', 'y', 'r', 'g'],
    ];
    // no empties and no matching tops → truly stuck
    expect(isStuck(tubes)).toBe(true);
  });
});

describe('getLevel', () => {
  it('returns 8 valid level structures', () => {
    for (let i = 1; i <= 8; i++) {
      const tubes = getLevel(i);
      expect(Array.isArray(tubes)).toBe(true);
      tubes.forEach(tube => {
        expect(tube.length).toBeLessThanOrEqual(TUBE_CAPACITY);
      });
    }
  });
  it('level balls count is divisible by TUBE_CAPACITY (all colors complete)', () => {
    for (let i = 1; i <= 8; i++) {
      const tubes = getLevel(i);
      const count = totalBalls(tubes);
      expect(count % TUBE_CAPACITY).toBe(0);
    }
  });
  it('returns independent copies (mutation safe)', () => {
    const a = getLevel(1);
    const b = getLevel(1);
    a[0].push('x');
    expect(b[0]).not.toContain('x');
  });
  it('clamps out-of-range level numbers', () => {
    expect(getLevel(0)).toEqual(getLevel(1));
    expect(getLevel(99)).toEqual(getLevel(8));
  });
});

describe('totalBalls', () => {
  it('counts all balls', () => {
    expect(totalBalls([['r', 'g'], ['b'], []])).toBe(3);
    expect(totalBalls([[], []])).toBe(0);
  });
});
