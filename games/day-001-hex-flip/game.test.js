import { describe, test, expect } from 'bun:test';
import { createGrid, getNeighbors, toggle, isWin, generatePuzzle } from './game.js';

describe('createGrid', () => {
  test('radius 0 creates single cell', () => {
    const grid = createGrid(0);
    expect(Object.keys(grid)).toEqual(['0,0']);
    expect(grid['0,0']).toBe(0);
  });

  test('radius 1 creates 7 cells', () => {
    const grid = createGrid(1);
    expect(Object.keys(grid).length).toBe(7);
  });

  test('radius 2 creates 19 cells', () => {
    const grid = createGrid(2);
    expect(Object.keys(grid).length).toBe(19);
  });

  test('all cells start at 0', () => {
    const grid = createGrid(2);
    expect(Object.values(grid).every(v => v === 0)).toBe(true);
  });
});

describe('getNeighbors', () => {
  test('returns 6 neighbors for any cell', () => {
    expect(getNeighbors(0, 0).length).toBe(6);
  });

  test('returns correct neighbors for origin', () => {
    const n = getNeighbors(0, 0);
    expect(n).toContainEqual([1, 0]);
    expect(n).toContainEqual([-1, 0]);
    expect(n).toContainEqual([0, 1]);
    expect(n).toContainEqual([0, -1]);
    expect(n).toContainEqual([1, -1]);
    expect(n).toContainEqual([-1, 1]);
  });
});

describe('toggle', () => {
  test('toggles clicked cell and its neighbors', () => {
    const grid = createGrid(1);
    const result = toggle(grid, 0, 0);
    expect(result['0,0']).toBe(1);
    expect(result['1,0']).toBe(1);
    expect(result['-1,0']).toBe(1);
    expect(result['0,1']).toBe(1);
    expect(result['0,-1']).toBe(1);
    expect(result['1,-1']).toBe(1);
    expect(result['-1,1']).toBe(1);
  });

  test('does not modify original grid', () => {
    const grid = createGrid(1);
    toggle(grid, 0, 0);
    expect(grid['0,0']).toBe(0);
  });

  test('toggling twice returns to original', () => {
    const grid = createGrid(1);
    const once = toggle(grid, 0, 0);
    const twice = toggle(once, 0, 0);
    expect(twice).toEqual(grid);
  });

  test('ignores out-of-grid neighbors', () => {
    const grid = createGrid(1);
    // Toggle corner cell - some neighbors are outside grid
    const result = toggle(grid, 1, -1);
    expect(result['1,-1']).toBe(1);
    expect(result['0,0']).toBe(1); // neighbor in grid
    // 2,-1 is outside radius 1
    expect(result['2,-1']).toBeUndefined();
  });

  test('ignores toggle on non-existent cell', () => {
    const grid = createGrid(1);
    const result = toggle(grid, 5, 5);
    expect(result).toEqual(grid);
  });
});

describe('isWin', () => {
  test('all zeros is a win', () => {
    expect(isWin({ '0,0': 0, '1,0': 0 })).toBe(true);
  });

  test('all ones is a win', () => {
    expect(isWin({ '0,0': 1, '1,0': 1 })).toBe(true);
  });

  test('mixed is not a win', () => {
    expect(isWin({ '0,0': 0, '1,0': 1 })).toBe(false);
  });
});

describe('generatePuzzle', () => {
  test('returns a non-winning grid', () => {
    const grid = generatePuzzle(2, 5);
    expect(isWin(grid)).toBe(false);
  });

  test('has correct number of cells', () => {
    const grid = generatePuzzle(2, 5);
    expect(Object.keys(grid).length).toBe(19);
  });
});
