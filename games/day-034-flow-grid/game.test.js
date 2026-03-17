// TDD tests for Flow Grid game logic
import { describe, it, expect, beforeEach } from 'bun:test';

// We'll test the core game logic functions
// These will be imported from game-logic.js

import {
  createGrid,
  isValidCell,
  canExtendPath,
  getPaths,
  checkWin,
  initPuzzle,
  PUZZLES
} from './game-logic.js';

describe('createGrid', () => {
  it('creates a grid of correct size', () => {
    const grid = createGrid(5);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(5);
  });

  it('fills grid with null initially', () => {
    const grid = createGrid(3);
    expect(grid[0][0]).toBeNull();
    expect(grid[2][2]).toBeNull();
  });
});

describe('isValidCell', () => {
  it('returns true for cells inside the grid', () => {
    expect(isValidCell(0, 0, 5)).toBe(true);
    expect(isValidCell(4, 4, 5)).toBe(true);
    expect(isValidCell(2, 3, 5)).toBe(true);
  });

  it('returns false for cells outside the grid', () => {
    expect(isValidCell(-1, 0, 5)).toBe(false);
    expect(isValidCell(0, -1, 5)).toBe(false);
    expect(isValidCell(5, 0, 5)).toBe(false);
    expect(isValidCell(0, 5, 5)).toBe(false);
  });
});

describe('canExtendPath', () => {
  it('allows extending to an empty cell', () => {
    const grid = createGrid(5);
    const paths = {};
    // Place a dot at (0,0)
    grid[0][0] = { color: 'red', isDot: true };
    paths['red'] = [[0, 0]];
    
    // Can extend to adjacent empty cell (0,1)
    expect(canExtendPath(grid, paths, 'red', 0, 1, 5)).toBe(true);
  });

  it('prevents extending to a cell occupied by another color', () => {
    const grid = createGrid(5);
    const paths = {};
    grid[0][0] = { color: 'red', isDot: true };
    grid[0][1] = { color: 'blue', isDot: false };
    paths['red'] = [[0, 0]];
    paths['blue'] = [[0, 1]];
    
    expect(canExtendPath(grid, paths, 'red', 0, 1, 5)).toBe(false);
  });

  it('prevents extending to a non-adjacent cell', () => {
    const grid = createGrid(5);
    const paths = {};
    grid[0][0] = { color: 'red', isDot: true };
    paths['red'] = [[0, 0]];
    
    // (0,2) is not adjacent to (0,0)
    expect(canExtendPath(grid, paths, 'red', 0, 2, 5)).toBe(false);
  });

  it('allows extending to own dot endpoint to complete flow', () => {
    const grid = createGrid(5);
    const paths = {};
    grid[0][0] = { color: 'red', isDot: true };
    grid[0][2] = { color: 'red', isDot: true };
    // Path goes 0,0 -> 0,1, try to reach 0,2
    paths['red'] = [[0, 0], [0, 1]];
    
    expect(canExtendPath(grid, paths, 'red', 0, 2, 5)).toBe(true);
  });

  it('prevents extending outside grid bounds', () => {
    const grid = createGrid(5);
    const paths = {};
    grid[0][0] = { color: 'red', isDot: true };
    paths['red'] = [[0, 0]];
    
    expect(canExtendPath(grid, paths, 'red', -1, 0, 5)).toBe(false);
    expect(canExtendPath(grid, paths, 'red', 0, -1, 5)).toBe(false);
  });
});

describe('checkWin', () => {
  it('returns false when no paths exist', () => {
    const grid = createGrid(3);
    const paths = {};
    const dotPairs = [['red', [0,0], [2,2]]];
    expect(checkWin(grid, paths, dotPairs, 3)).toBe(false);
  });

  it('returns false when grid not fully filled', () => {
    // 2x2 grid, only one path
    const grid = createGrid(2);
    const dotPairs = [['red', [0,0], [0,1]], ['blue', [1,0], [1,1]]];
    const paths = {
      'red': [[0,0], [0,1]],  // connected
      // blue not connected
    };
    grid[0][0] = { color: 'red', isDot: true };
    grid[0][1] = { color: 'red', isDot: true };
    
    expect(checkWin(grid, paths, dotPairs, 2)).toBe(false);
  });

  it('returns true when all flows connected AND grid fully filled', () => {
    // 2x2 grid: red connects (0,0)→(1,0), blue connects (0,1)→(1,1)
    const grid = createGrid(2);
    const dotPairs = [
      ['red', [0,0], [1,0]],
      ['blue', [0,1], [1,1]]
    ];
    const paths = {
      'red': [[0,0], [1,0]],
      'blue': [[0,1], [1,1]]
    };
    // Fill grid
    grid[0][0] = { color: 'red', isDot: true };
    grid[1][0] = { color: 'red', isDot: true };
    grid[0][1] = { color: 'blue', isDot: true };
    grid[1][1] = { color: 'blue', isDot: true };
    
    expect(checkWin(grid, paths, dotPairs, 2)).toBe(true);
  });

  it('returns false when flows connected but grid not fully filled', () => {
    // 3x3 grid: two pairs but leave center empty
    const grid = createGrid(3);
    const dotPairs = [
      ['red', [0,0], [0,2]],
      ['blue', [2,0], [2,2]]
    ];
    const paths = {
      'red': [[0,0], [0,1], [0,2]],  // connected
      'blue': [[2,0], [2,1], [2,2]]  // connected
    };
    // Fill only path cells, center (1,x) rows empty
    grid[0][0] = { color: 'red', isDot: true };
    grid[0][1] = { color: 'red' };
    grid[0][2] = { color: 'red', isDot: true };
    grid[2][0] = { color: 'blue', isDot: true };
    grid[2][1] = { color: 'blue' };
    grid[2][2] = { color: 'blue', isDot: true };
    // row 1 is empty!
    
    expect(checkWin(grid, paths, dotPairs, 3)).toBe(false);
  });
});

describe('initPuzzle', () => {
  it('returns a puzzle with required fields', () => {
    const puzzle = initPuzzle(0);
    expect(puzzle).toBeDefined();
    expect(puzzle.size).toBeGreaterThanOrEqual(4);
    expect(puzzle.dotPairs).toBeDefined();
    expect(Array.isArray(puzzle.dotPairs)).toBe(true);
    expect(puzzle.dotPairs.length).toBeGreaterThan(0);
  });

  it('puzzle dot pairs have correct structure', () => {
    const puzzle = initPuzzle(0);
    for (const pair of puzzle.dotPairs) {
      expect(pair.length).toBe(3); // [color, start, end]
      expect(typeof pair[0]).toBe('string'); // color
      expect(Array.isArray(pair[1])).toBe(true); // start coords
      expect(Array.isArray(pair[2])).toBe(true); // end coords
      expect(pair[1].length).toBe(2);
      expect(pair[2].length).toBe(2);
    }
  });

  it('all puzzles are defined', () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < PUZZLES.length; i++) {
      const p = initPuzzle(i);
      expect(p).toBeDefined();
    }
  });

  it('dots in puzzles are within grid bounds', () => {
    for (let i = 0; i < PUZZLES.length; i++) {
      const p = initPuzzle(i);
      for (const [, start, end] of p.dotPairs) {
        expect(start[0]).toBeGreaterThanOrEqual(0);
        expect(start[0]).toBeLessThan(p.size);
        expect(start[1]).toBeGreaterThanOrEqual(0);
        expect(start[1]).toBeLessThan(p.size);
        expect(end[0]).toBeGreaterThanOrEqual(0);
        expect(end[0]).toBeLessThan(p.size);
        expect(end[1]).toBeGreaterThanOrEqual(0);
        expect(end[1]).toBeLessThan(p.size);
      }
    }
  });
});

describe('getPaths', () => {
  it('returns empty object initially', () => {
    const paths = getPaths();
    expect(typeof paths).toBe('object');
  });
});
