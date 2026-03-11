// TDD Tests for Booby Trap game logic
// Run with: bun test

import { describe, test, expect } from 'bun:test';
import {
  createGrid,
  placeItem,
  canPlace,
  probeCell,
  countItems,
  checkGameOver,
  getRevealedCount,
} from './game-logic.js';

describe('createGrid', () => {
  test('creates a grid with correct dimensions', () => {
    const grid = createGrid(7, 5);
    expect(grid.cols).toBe(7);
    expect(grid.rows).toBe(5);
    expect(grid.cells.length).toBe(35);
  });

  test('all cells start as hidden and empty', () => {
    const grid = createGrid(7, 5);
    grid.cells.forEach(cell => {
      expect(cell.type).toBe('empty');
      expect(cell.revealed).toBe(false);
    });
  });
});

describe('canPlace', () => {
  test('can place on empty cell within bounds', () => {
    const grid = createGrid(7, 5);
    expect(canPlace(grid, 0, 0)).toBe(true);
    expect(canPlace(grid, 6, 4)).toBe(true);
    expect(canPlace(grid, 3, 2)).toBe(true);
  });

  test('cannot place out of bounds', () => {
    const grid = createGrid(7, 5);
    expect(canPlace(grid, -1, 0)).toBe(false);
    expect(canPlace(grid, 7, 0)).toBe(false);
    expect(canPlace(grid, 0, 5)).toBe(false);
    expect(canPlace(grid, 0, -1)).toBe(false);
  });

  test('cannot place on occupied cell', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 2, 2, 'trap');
    expect(canPlace(grid, 2, 2)).toBe(false);
  });
});

describe('placeItem', () => {
  test('places a trap on the grid', () => {
    const grid = createGrid(7, 5);
    const result = placeItem(grid, 1, 1, 'trap');
    expect(result).toBe(true);
    const idx = 1 * 7 + 1;
    expect(grid.cells[idx].type).toBe('trap');
  });

  test('places a treasure on the grid', () => {
    const grid = createGrid(7, 5);
    const result = placeItem(grid, 3, 2, 'treasure');
    expect(result).toBe(true);
    const idx = 2 * 7 + 3;
    expect(grid.cells[idx].type).toBe('treasure');
  });

  test('returns false when placing out of bounds', () => {
    const grid = createGrid(7, 5);
    const result = placeItem(grid, 10, 10, 'trap');
    expect(result).toBe(false);
  });

  test('returns false when placing on occupied cell', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 2, 2, 'trap');
    const result = placeItem(grid, 2, 2, 'treasure');
    expect(result).toBe(false);
  });
});

describe('probeCell', () => {
  test('probing an empty cell returns empty and marks revealed', () => {
    const grid = createGrid(7, 5);
    const result = probeCell(grid, 0, 0);
    expect(result).toBe('empty');
    expect(grid.cells[0].revealed).toBe(true);
  });

  test('probing a trap returns trap and marks revealed', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 3, 2, 'trap');
    const result = probeCell(grid, 3, 2);
    expect(result).toBe('trap');
    const idx = 2 * 7 + 3;
    expect(grid.cells[idx].revealed).toBe(true);
  });

  test('probing a treasure returns treasure and marks revealed', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 5, 4, 'treasure');
    const result = probeCell(grid, 5, 4);
    expect(result).toBe('treasure');
    const idx = 4 * 7 + 5;
    expect(grid.cells[idx].revealed).toBe(true);
  });

  test('probing already revealed cell returns null (invalid probe)', () => {
    const grid = createGrid(7, 5);
    probeCell(grid, 1, 1);
    const result = probeCell(grid, 1, 1);
    expect(result).toBe(null);
  });

  test('probing out of bounds returns null', () => {
    const grid = createGrid(7, 5);
    const result = probeCell(grid, 99, 99);
    expect(result).toBe(null);
  });
});

describe('countItems', () => {
  test('counts traps correctly', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 0, 0, 'trap');
    placeItem(grid, 1, 0, 'trap');
    placeItem(grid, 2, 0, 'trap');
    expect(countItems(grid, 'trap')).toBe(3);
  });

  test('counts treasures correctly', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 0, 0, 'treasure');
    placeItem(grid, 1, 0, 'treasure');
    expect(countItems(grid, 'treasure')).toBe(2);
  });

  test('counts found treasures (revealed treasures)', () => {
    const grid = createGrid(7, 5);
    placeItem(grid, 0, 0, 'treasure');
    placeItem(grid, 1, 0, 'treasure');
    probeCell(grid, 0, 0);
    expect(countItems(grid, 'treasure', true)).toBe(1);
  });
});

describe('checkGameOver', () => {
  test('returns null when game not over', () => {
    const state = {
      players: [
        { name: 'Alice', lives: 3, score: 0 },
        { name: 'Bob', lives: 3, score: 0 },
      ],
      grids: [createGrid(7, 5), createGrid(7, 5)],
    };
    placeItem(state.grids[0], 0, 0, 'treasure');
    placeItem(state.grids[1], 0, 0, 'treasure');
    expect(checkGameOver(state)).toBe(null);
  });

  test('returns loser index when a player loses all lives', () => {
    const state = {
      players: [
        { name: 'Alice', lives: 0, score: 1 },
        { name: 'Bob', lives: 3, score: 0 },
      ],
      grids: [createGrid(7, 5), createGrid(7, 5)],
    };
    const result = checkGameOver(state);
    expect(result).not.toBe(null);
    expect(result.loser).toBe(0);
    expect(result.winner).toBe(1);
  });

  test('returns winner when all treasures found on a grid', () => {
    const state = {
      players: [
        { name: 'Alice', lives: 3, score: 6 },
        { name: 'Bob', lives: 3, score: 0 },
      ],
      grids: [createGrid(7, 5), createGrid(7, 5)],
    };
    // All treasures on grid[0] (Alice's grid) are found by Bob
    placeItem(state.grids[0], 0, 0, 'treasure');
    placeItem(state.grids[0], 1, 0, 'treasure');
    placeItem(state.grids[0], 2, 0, 'treasure');
    probeCell(state.grids[0], 0, 0);
    probeCell(state.grids[0], 1, 0);
    probeCell(state.grids[0], 2, 0);
    const result = checkGameOver(state);
    expect(result).not.toBe(null);
  });
});

describe('getRevealedCount', () => {
  test('returns 0 initially', () => {
    const grid = createGrid(7, 5);
    expect(getRevealedCount(grid)).toBe(0);
  });

  test('returns correct count after probing', () => {
    const grid = createGrid(7, 5);
    probeCell(grid, 0, 0);
    probeCell(grid, 1, 0);
    probeCell(grid, 2, 0);
    expect(getRevealedCount(grid)).toBe(3);
  });
});
