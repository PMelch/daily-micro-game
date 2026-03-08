import { describe, it, expect } from 'bun:test';
import {
  mulberry32,
  generateGrid,
  getTerritory,
  applyMove,
  isWon,
  getStarRating,
  PAR_MOVES,
  GRID_SIZE,
  NUM_COLORS,
} from './game-logic.js';

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

describe('mulberry32', () => {
  it('produces values in [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b());
    }
  });

  it('differs for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    // At least one value should differ
    const vals_a = Array.from({ length: 5 }, () => a());
    const vals_b = Array.from({ length: 5 }, () => b());
    expect(vals_a).not.toEqual(vals_b);
  });
});

// ─── Grid Generation ──────────────────────────────────────────────────────────

describe('generateGrid', () => {
  it('produces a GRID_SIZE × GRID_SIZE array', () => {
    const grid = generateGrid(20260309);
    expect(grid.length).toBe(GRID_SIZE);
    grid.forEach(row => expect(row.length).toBe(GRID_SIZE));
  });

  it('only contains valid color indices', () => {
    const grid = generateGrid(20260309);
    grid.forEach(row =>
      row.forEach(cell => {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(NUM_COLORS);
      })
    );
  });

  it('is deterministic for the same seed', () => {
    const g1 = generateGrid(99999);
    const g2 = generateGrid(99999);
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        expect(g1[r][c]).toBe(g2[r][c]);
  });

  it('differs for different seeds', () => {
    const g1 = generateGrid(1);
    const g2 = generateGrid(2);
    let different = false;
    for (let r = 0; r < GRID_SIZE && !different; r++)
      for (let c = 0; c < GRID_SIZE && !different; c++)
        if (g1[r][c] !== g2[r][c]) different = true;
    expect(different).toBe(true);
  });
});

// ─── Territory Detection ──────────────────────────────────────────────────────

describe('getTerritory', () => {
  it('starts at (0,0) and expands to connected same-color cells', () => {
    // 3×3 grid: top-left blob is color 0
    const grid = [
      [0, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ];
    const territory = getTerritory(grid);
    // (0,0), (0,1), (1,0) are color 0 and connected
    expect(territory.has('0,0')).toBe(true);
    expect(territory.has('0,1')).toBe(true);
    expect(territory.has('1,0')).toBe(true);
    // (0,2), (1,1), etc. are not
    expect(territory.has('0,2')).toBe(false);
    expect(territory.has('1,1')).toBe(false);
  });

  it('returns only (0,0) when surrounded by different colors', () => {
    const grid = [
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ];
    const territory = getTerritory(grid);
    expect(territory.size).toBe(1);
    expect(territory.has('0,0')).toBe(true);
  });

  it('returns all cells when grid is uniform', () => {
    const size = 4;
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    const territory = getTerritory(grid);
    expect(territory.size).toBe(size * size);
  });
});

// ─── Apply Move ───────────────────────────────────────────────────────────────

describe('applyMove', () => {
  it('returns a new grid (immutable)', () => {
    const grid = [
      [0, 1],
      [1, 1],
    ];
    const next = applyMove(grid, 1);
    expect(next).not.toBe(grid);
  });

  it('floods territory color and absorbs neighbors of new color', () => {
    const grid = [
      [0, 1, 2],
      [1, 2, 2],
      [2, 2, 2],
    ];
    // Territory is just (0,0) = color 0. Pick color 1.
    // Territory changes to 1, absorbs adjacent 1s: (0,1) and (1,0)
    const next = applyMove(grid, 1);
    expect(next[0][0]).toBe(1);
    expect(next[0][1]).toBe(1);
    expect(next[1][0]).toBe(1);
    // Others unchanged
    expect(next[0][2]).toBe(2);
    expect(next[1][1]).toBe(2);
  });

  it('no-ops when picking the current territory color', () => {
    const grid = [
      [0, 1],
      [1, 1],
    ];
    const next = applyMove(grid, 0); // 0 is already the territory color
    expect(next[0][0]).toBe(0);
    expect(next[0][1]).toBe(1);
    expect(next[1][0]).toBe(1);
  });

  it('expands in multiple flood steps (chain expansion)', () => {
    // L-shaped territory at (0,0), adjacent to 1, which is adjacent to 2 chain
    const grid = [
      [0, 1, 2],
      [3, 3, 3],
      [3, 3, 3],
    ];
    // Pick 1: territory absorbs (0,1), new territory is {(0,0),(0,1)}
    const mid = applyMove(grid, 1);
    expect(mid[0][0]).toBe(1);
    expect(mid[0][1]).toBe(1);
    expect(mid[0][2]).toBe(2); // not yet absorbed
    // Now pick 2 from mid: territory {(0,0),(0,1)} color=1 -> 2, absorbs (0,2)
    const final = applyMove(mid, 2);
    expect(final[0][0]).toBe(2);
    expect(final[0][1]).toBe(2);
    expect(final[0][2]).toBe(2);
  });
});

// ─── Win Condition ────────────────────────────────────────────────────────────

describe('isWon', () => {
  it('returns false when not all cells are same color', () => {
    const grid = [
      [0, 1],
      [1, 1],
    ];
    expect(isWon(grid)).toBe(false);
  });

  it('returns true when all cells are the same color', () => {
    const grid = [
      [2, 2],
      [2, 2],
    ];
    expect(isWon(grid)).toBe(true);
  });

  it('returns true for a single-cell grid', () => {
    expect(isWon([[3]])).toBe(true);
  });

  it('handles full GRID_SIZE uniform grid', () => {
    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    expect(isWon(grid)).toBe(true);
  });
});

// ─── Star Rating ─────────────────────────────────────────────────────────────

describe('getStarRating', () => {
  it('returns 3 stars for moves ≤ PAR_MOVES', () => {
    expect(getStarRating(PAR_MOVES)).toBe(3);
    expect(getStarRating(1)).toBe(3);
  });

  it('returns 2 stars for moves ≤ PAR_MOVES * 1.3', () => {
    const twos = Math.floor(PAR_MOVES * 1.2);
    expect(getStarRating(twos)).toBe(2);
  });

  it('returns 1 star for moves > PAR_MOVES * 1.3', () => {
    const ones = Math.ceil(PAR_MOVES * 1.5);
    expect(getStarRating(ones)).toBe(1);
  });

  it('always returns at least 1 star', () => {
    expect(getStarRating(9999)).toBe(1);
  });
});
