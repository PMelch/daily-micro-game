import { describe, it, expect } from 'bun:test';
import {
  createGameState,
  moveSubmarine,
  emitPing,
  collectCell,
  CELL,
  getCellsInRadius,
  isWalkable
} from './game-logic.js';

describe('createGameState', () => {
  it('places submarine at start position', () => {
    const state = createGameState(15, 15, 10, 4, 8);
    expect(state.sub.x).toBe(1);
    expect(state.sub.y).toBe(1);
  });

  it('places exit in bottom-right area', () => {
    const state = createGameState(15, 15, 10, 4, 8);
    expect(state.grid[13][13]).toBe(CELL.EXIT);
  });

  it('has correct number of pings', () => {
    const state = createGameState(15, 15, 10, 4, 8);
    expect(state.pings).toBe(8);
  });

  it('start cell and exit cell are never mines', () => {
    for (let i = 0; i < 20; i++) {
      const state = createGameState(15, 15, 20, 4, 8);
      expect(state.grid[1][1]).not.toBe(CELL.MINE);
      expect(state.grid[13][13]).toBe(CELL.EXIT);
    }
  });

  it('score starts at 0', () => {
    const state = createGameState(15, 15, 10, 4, 8);
    expect(state.score).toBe(0);
  });

  it('starts with empty revealed set (except start zone)', () => {
    const state = createGameState(15, 15, 10, 4, 8);
    // Start zone (1,1) and neighbors should be revealed
    expect(state.revealed.has('1,1')).toBe(true);
  });
});

describe('moveSubmarine', () => {
  it('moves submarine in valid direction', () => {
    const state = createGameState(15, 15, 5, 2, 8);
    // Clear cell to the right of start
    state.grid[1][2] = CELL.EMPTY;
    const next = moveSubmarine(state, 1, 0);
    expect(next.sub.x).toBe(2);
    expect(next.sub.y).toBe(1);
  });

  it('does not move into walls (grid edges)', () => {
    const state = createGameState(15, 15, 5, 2, 8);
    // Move left from (1,1) hits wall at x=0
    const next = moveSubmarine(state, -1, 0);
    expect(next.sub.x).toBe(1); // unchanged (wall)
  });

  it('returns mine_hit true when moving into mine', () => {
    const state = createGameState(15, 15, 0, 0, 8);
    state.grid[1][2] = CELL.MINE;
    const next = moveSubmarine(state, 1, 0);
    expect(next.mine_hit).toBe(true);
  });

  it('returns reached_exit true when moving to exit', () => {
    const state = createGameState(15, 15, 0, 0, 8);
    state.sub = { x: 12, y: 13 };
    const next = moveSubmarine(state, 1, 0);
    expect(next.reached_exit).toBe(true);
  });

  it('collects treasure when moving onto it', () => {
    const state = createGameState(15, 15, 0, 0, 8);
    state.grid[1][2] = CELL.TREASURE;
    const next = moveSubmarine(state, 1, 0);
    expect(next.score).toBeGreaterThan(0);
    expect(next.grid[1][2]).toBe(CELL.EMPTY); // treasure consumed
  });
});

describe('emitPing', () => {
  it('decrements ping count', () => {
    const state = createGameState(15, 15, 5, 2, 8);
    const next = emitPing(state, 7, 7);
    expect(next.pings).toBe(7);
  });

  it('does not emit if no pings left', () => {
    const state = createGameState(15, 15, 5, 2, 0);
    const next = emitPing(state, 7, 7);
    expect(next.pings).toBe(0); // unchanged
  });

  it('adds cells to revealed set', () => {
    const state = createGameState(15, 15, 0, 0, 8);
    const next = emitPing(state, 7, 7);
    expect(next.revealed.size).toBeGreaterThan(state.revealed.size);
    expect(next.revealed.has('7,7')).toBe(true);
  });
});

describe('getCellsInRadius', () => {
  it('returns cells within given radius', () => {
    const cells = getCellsInRadius(5, 5, 2, 15, 15);
    expect(cells).toContain('5,5');
    expect(cells).toContain('5,6');
    expect(cells).toContain('6,5');
    // Should not include cells too far
    expect(cells).not.toContain('5,9');
  });

  it('respects grid boundaries', () => {
    const cells = getCellsInRadius(0, 0, 3, 15, 15);
    // No negative coordinates
    for (const c of cells) {
      const [x, y] = c.split(',').map(Number);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('isWalkable', () => {
  it('empty cell is walkable', () => {
    expect(isWalkable(CELL.EMPTY)).toBe(true);
  });

  it('exit cell is walkable', () => {
    expect(isWalkable(CELL.EXIT)).toBe(true);
  });

  it('mine cell is walkable (triggers death)', () => {
    expect(isWalkable(CELL.MINE)).toBe(true);
  });

  it('treasure cell is walkable', () => {
    expect(isWalkable(CELL.TREASURE)).toBe(true);
  });

  it('wall cell is not walkable', () => {
    expect(isWalkable(CELL.WALL)).toBe(false);
  });
});
