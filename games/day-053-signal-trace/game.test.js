/**
 * TDD tests for Signal Trace game logic
 */
import { describe, test, expect } from 'bun:test';
import {
  getPorts, areConnected, getNeighbor, findConnectedFromSource,
  isSolved, rotateNode, generateLevel, initGame, BASE_PORTS
} from './game.js';

describe('getPorts', () => {
  test('straight I at rotation 0 has N and S ports', () => {
    const ports = getPorts('I', 0);
    expect(ports).toContain(0); // N
    expect(ports).toContain(2); // S
    expect(ports).not.toContain(1); // E
    expect(ports).not.toContain(3); // W
  });

  test('straight I at rotation 1 has E and W ports', () => {
    const ports = getPorts('I', 1);
    expect(ports).toContain(1); // E
    expect(ports).toContain(3); // W
    expect(ports).not.toContain(0); // N
    expect(ports).not.toContain(2); // S
  });

  test('L at rotation 0 has N and E ports', () => {
    const ports = getPorts('L', 0);
    expect(ports).toContain(0); // N
    expect(ports).toContain(1); // E
    expect(ports.length).toBe(2);
  });

  test('L at rotation 1 has E and S ports', () => {
    const ports = getPorts('L', 1);
    expect(ports).toContain(1); // E
    expect(ports).toContain(2); // S
  });

  test('X at any rotation has all 4 ports', () => {
    for (let r = 0; r < 4; r++) {
      const ports = getPorts('X', r);
      expect(ports.length).toBe(4);
      expect(ports).toContain(0);
      expect(ports).toContain(1);
      expect(ports).toContain(2);
      expect(ports).toContain(3);
    }
  });

  test('T at rotation 0 missing W port', () => {
    const ports = getPorts('T', 0);
    expect(ports.length).toBe(3);
    expect(ports).not.toContain(3); // W missing at rot=0 (base ports 0,1,2, +0 = 0,1,2)
  });
});

describe('areConnected', () => {
  test('two straight N-S pipes connected vertically', () => {
    const top = { type: 'I', rotation: 0 }; // ports N,S
    const bottom = { type: 'I', rotation: 0 }; // ports N,S
    // dir=2 (S): top has S, bottom has N (opposite=0)
    expect(areConnected(top, bottom, 2)).toBe(true);
  });

  test('two straight E-W pipes connected horizontally', () => {
    const left = { type: 'I', rotation: 1 }; // ports E,W
    const right = { type: 'I', rotation: 1 }; // ports E,W
    // dir=1 (E): left has E, right has W (opposite=3)
    expect(areConnected(left, right, 1)).toBe(true);
  });

  test('mismatched pipes not connected', () => {
    const vPipe = { type: 'I', rotation: 0 }; // N-S
    const hPipe = { type: 'I', rotation: 1 }; // E-W
    // dir=1 (E): vPipe has no E port
    expect(areConnected(vPipe, hPipe, 1)).toBe(false);
  });

  test('cross connects in all directions to matching neighbors', () => {
    const cross = { type: 'X', rotation: 0 };
    const vPipe = { type: 'I', rotation: 0 }; // N-S
    // dir=0 (N): cross has N, vPipe has S (opposite=2)
    expect(areConnected(cross, vPipe, 0)).toBe(true);
  });
});

describe('getNeighbor', () => {
  test('North neighbor is row-1', () => {
    expect(getNeighbor(2, 3, 0)).toEqual({ r: 1, c: 3 });
  });

  test('East neighbor is col+1', () => {
    expect(getNeighbor(2, 3, 1)).toEqual({ r: 2, c: 4 });
  });

  test('South neighbor is row+1', () => {
    expect(getNeighbor(2, 3, 2)).toEqual({ r: 3, c: 3 });
  });

  test('West neighbor is col-1', () => {
    expect(getNeighbor(2, 3, 3)).toEqual({ r: 2, c: 2 });
  });
});

describe('findConnectedFromSource', () => {
  test('single cell grid always connected to itself', () => {
    const grid = [[{ type: 'X', rotation: 0 }]];
    const connected = findConnectedFromSource(grid, 1, 1, 0, 0);
    expect(connected.has('0,0')).toBe(true);
  });

  test('2x1 grid with matching E-W pipes both connected', () => {
    const grid = [[
      { type: 'I', rotation: 1 }, // E-W
      { type: 'I', rotation: 1 }, // E-W
    ]];
    const connected = findConnectedFromSource(grid, 1, 2, 0, 0);
    expect(connected.has('0,0')).toBe(true);
    expect(connected.has('0,1')).toBe(true);
  });

  test('2x1 grid with mismatched pipes: only source connected', () => {
    const grid = [[
      { type: 'I', rotation: 0 }, // N-S (no E port)
      { type: 'I', rotation: 1 }, // E-W
    ]];
    const connected = findConnectedFromSource(grid, 1, 2, 0, 0);
    expect(connected.has('0,0')).toBe(true);
    expect(connected.has('0,1')).toBe(false);
  });
});

describe('isSolved', () => {
  test('simple 2x1 solved state returns true', () => {
    const state = {
      rows: 1, cols: 2,
      grid: [[
        { type: 'I', rotation: 1 },
        { type: 'I', rotation: 1 },
      ]],
      source: { r: 0, c: 0 },
      sink: { r: 0, c: 1 },
    };
    expect(isSolved(state)).toBe(true);
  });

  test('disconnected state returns false', () => {
    const state = {
      rows: 1, cols: 2,
      grid: [[
        { type: 'I', rotation: 0 }, // N-S, no E
        { type: 'I', rotation: 1 }, // E-W
      ]],
      source: { r: 0, c: 0 },
      sink: { r: 0, c: 1 },
    };
    expect(isSolved(state)).toBe(false);
  });
});

describe('rotateNode', () => {
  test('increases rotation by 1', () => {
    const state = initGame(0, 42);
    const r = state.source.r;
    const c = state.source.c;
    const origRot = state.grid[r][c].rotation;
    const newState = rotateNode(state, r, c);
    expect(newState.grid[r][c].rotation).toBe((origRot + 1) % 4);
  });

  test('rotation wraps from 3 to 0', () => {
    const state = initGame(0, 42);
    // Force rotation to 3
    const r = state.source.r;
    const c = state.source.c;
    const s1 = rotateNode(state, r, c);
    const s2 = rotateNode(s1, r, c);
    const s3 = rotateNode(s2, r, c);
    const s4 = rotateNode(s3, r, c);
    expect(s4.grid[r][c].rotation).toBe(state.grid[r][c].rotation);
  });

  test('increments move counter', () => {
    const state = initGame(0, 42);
    const s2 = rotateNode(state, 0, 0);
    expect(s2.moves).toBe(1);
  });

  test('does not mutate original state', () => {
    const state = initGame(0, 42);
    const origRot = state.grid[0][0].rotation;
    rotateNode(state, 0, 0);
    expect(state.grid[0][0].rotation).toBe(origRot);
  });

  test('original move count unchanged after rotateNode', () => {
    const state = initGame(0, 42);
    rotateNode(state, 0, 0);
    expect(state.moves).toBe(0);
  });
});

describe('generateLevel', () => {
  test('creates grid with correct dimensions', () => {
    const state = generateLevel(0, 12345);
    expect(state.grid.length).toBe(state.rows);
    expect(state.grid[0].length).toBe(state.cols);
  });

  test('level 0 is 3x3', () => {
    const state = generateLevel(0, 12345);
    expect(state.rows).toBe(3);
    expect(state.cols).toBe(3);
  });

  test('level 5 is 6x6', () => {
    const state = generateLevel(5, 12345);
    expect(state.rows).toBe(6);
    expect(state.cols).toBe(6);
  });

  test('source is within grid bounds', () => {
    for (let i = 0; i < 5; i++) {
      const s = generateLevel(i, i * 999 + 1);
      expect(s.source.r).toBeGreaterThanOrEqual(0);
      expect(s.source.r).toBeLessThan(s.rows);
      expect(s.source.c).toBeGreaterThanOrEqual(0);
      expect(s.source.c).toBeLessThan(s.cols);
    }
  });

  test('sink is within grid bounds', () => {
    for (let i = 0; i < 5; i++) {
      const s = generateLevel(i, i * 777 + 1);
      expect(s.sink.r).toBeGreaterThanOrEqual(0);
      expect(s.sink.r).toBeLessThan(s.rows);
      expect(s.sink.c).toBeGreaterThanOrEqual(0);
      expect(s.sink.c).toBeLessThan(s.cols);
    }
  });

  test('all grid nodes have valid type', () => {
    const state = generateLevel(2, 54321);
    const validTypes = ['I', 'L', 'T', 'X'];
    for (const row of state.grid) {
      for (const node of row) {
        expect(validTypes).toContain(node.type);
        expect(node.rotation).toBeGreaterThanOrEqual(0);
        expect(node.rotation).toBeLessThanOrEqual(3);
      }
    }
  });

  test('different seeds produce different grids', () => {
    const s1 = generateLevel(2, 111);
    const s2 = generateLevel(2, 222);
    // At least some nodes should differ
    let different = false;
    for (let r = 0; r < s1.rows; r++) {
      for (let c = 0; c < s1.cols; c++) {
        if (s1.grid[r][c].rotation !== s2.grid[r][c].rotation) {
          different = true;
        }
      }
    }
    expect(different).toBe(true);
  });
});

describe('initGame', () => {
  test('starts with 0 moves', () => {
    const state = initGame(0, 42);
    expect(state.moves).toBe(0);
  });

  test('starts unsolved', () => {
    const state = initGame(0, 42);
    expect(state.solved).toBe(false);
  });

  test('has startTime', () => {
    const before = Date.now();
    const state = initGame(0, 42);
    expect(state.startTime).toBeGreaterThanOrEqual(before);
  });

  test('levelIndex is stored', () => {
    const state = initGame(3, 42);
    expect(state.levelIndex).toBe(3);
  });
});
