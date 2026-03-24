/**
 * TDD Tests for Chroma Split game logic
 * Run with: bun test
 */
const { describe, it, expect } = require('bun:test');
const {
  COLOR, DIR,
  reflectDir, getSplitDirs, propagateBeams, checkWin, countPlacedMirrors
} = require('./game-logic.js');

describe('reflectDir', () => {
  it('/ mirror: RIGHT -> UP', () => {
    expect(reflectDir(DIR.RIGHT, '/')).toBe(DIR.UP);
  });
  it('/ mirror: UP -> RIGHT', () => {
    expect(reflectDir(DIR.UP, '/')).toBe(DIR.RIGHT);
  });
  it('/ mirror: LEFT -> DOWN', () => {
    expect(reflectDir(DIR.LEFT, '/')).toBe(DIR.DOWN);
  });
  it('/ mirror: DOWN -> LEFT', () => {
    expect(reflectDir(DIR.DOWN, '/')).toBe(DIR.LEFT);
  });

  it('\\ mirror: RIGHT -> DOWN', () => {
    expect(reflectDir(DIR.RIGHT, '\\')).toBe(DIR.DOWN);
  });
  it('\\ mirror: DOWN -> RIGHT', () => {
    expect(reflectDir(DIR.DOWN, '\\')).toBe(DIR.RIGHT);
  });
  it('\\ mirror: LEFT -> UP', () => {
    expect(reflectDir(DIR.LEFT, '\\')).toBe(DIR.UP);
  });
  it('\\ mirror: UP -> LEFT', () => {
    expect(reflectDir(DIR.UP, '\\')).toBe(DIR.LEFT);
  });

  it('- filter: passes RIGHT', () => {
    expect(reflectDir(DIR.RIGHT, '-')).toBe(DIR.RIGHT);
  });
  it('- filter: passes LEFT', () => {
    expect(reflectDir(DIR.LEFT, '-')).toBe(DIR.LEFT);
  });
  it('- filter: absorbs UP', () => {
    expect(reflectDir(DIR.UP, '-')).toBeNull();
  });
  it('- filter: absorbs DOWN', () => {
    expect(reflectDir(DIR.DOWN, '-')).toBeNull();
  });

  it('| filter: passes UP', () => {
    expect(reflectDir(DIR.UP, '|')).toBe(DIR.UP);
  });
  it('| filter: absorbs RIGHT', () => {
    expect(reflectDir(DIR.RIGHT, '|')).toBeNull();
  });

  it('no mirror: passes through', () => {
    expect(reflectDir(DIR.RIGHT, undefined)).toBe(DIR.RIGHT);
    expect(reflectDir(DIR.DOWN, null)).toBe(DIR.DOWN);
  });
});

describe('getSplitDirs', () => {
  it('RIGHT beam splits to UP+DOWN plus RIGHT', () => {
    const dirs = getSplitDirs(DIR.RIGHT);
    expect(dirs).toContain(DIR.RIGHT);
    expect(dirs).toContain(DIR.UP);
    expect(dirs).toContain(DIR.DOWN);
    expect(dirs).toHaveLength(3);
  });
  it('DOWN beam splits to LEFT+RIGHT plus DOWN', () => {
    const dirs = getSplitDirs(DIR.DOWN);
    expect(dirs).toContain(DIR.DOWN);
    expect(dirs).toContain(DIR.LEFT);
    expect(dirs).toContain(DIR.RIGHT);
  });
});

describe('propagateBeams', () => {
  it('single red beam goes right, fills row', () => {
    const state = {
      rows: 1, cols: 5,
      emitters: [{ row: 0, col: 0, dir: DIR.RIGHT, color: COLOR.RED }],
      mirrors: {},
      targets: [],
    };
    const grid = propagateBeams(state);
    expect(grid[0]).toEqual([COLOR.RED, COLOR.RED, COLOR.RED, COLOR.RED, COLOR.RED]);
  });

  it('beam stops at wall', () => {
    const state = {
      rows: 1, cols: 5,
      emitters: [{ row: 0, col: 0, dir: DIR.RIGHT, color: COLOR.RED }],
      mirrors: {},
      walls: [[0, 2]],
      targets: [],
    };
    const grid = propagateBeams(state);
    expect(grid[0][0]).toBe(COLOR.RED);
    expect(grid[0][1]).toBe(COLOR.RED);
    expect(grid[0][2]).toBe(0); // wall blocks
    expect(grid[0][3]).toBe(0);
  });

  it('beam reflects off / mirror', () => {
    // Beam goes right, hits / at (0,2), turns UP (but at row 0, goes out of bounds)
    // So only (0,0),(0,1),(0,2) get RED
    const state = {
      rows: 3, cols: 5,
      emitters: [{ row: 2, col: 0, dir: DIR.RIGHT, color: COLOR.GREEN }],
      mirrors: { '2,2': '/' },
      targets: [],
    };
    const grid = propagateBeams(state);
    // beam goes right: (2,0),(2,1),(2,2) get GREEN
    expect(grid[2][0]).toBe(COLOR.GREEN);
    expect(grid[2][1]).toBe(COLOR.GREEN);
    expect(grid[2][2]).toBe(COLOR.GREEN); // mirror cell
    // then reflects UP: (1,2),(0,2) get GREEN
    expect(grid[1][2]).toBe(COLOR.GREEN);
    expect(grid[0][2]).toBe(COLOR.GREEN);
    // to the right of mirror: no beam
    expect(grid[2][3]).toBe(0);
  });

  it('two beams mixing colors', () => {
    // Red going right and Blue going down, cross at (1,2)
    const state = {
      rows: 3, cols: 5,
      emitters: [
        { row: 1, col: 0, dir: DIR.RIGHT, color: COLOR.RED },
        { row: 0, col: 2, dir: DIR.DOWN, color: COLOR.BLUE },
      ],
      mirrors: {},
      targets: [],
    };
    const grid = propagateBeams(state);
    // (1,2) should be RED | BLUE = MAGENTA
    expect(grid[1][2]).toBe(COLOR.MAGENTA);
    // (1,0),(1,1) are RED only
    expect(grid[1][0]).toBe(COLOR.RED);
    expect(grid[1][1]).toBe(COLOR.RED);
    // (0,2) is BLUE only
    expect(grid[0][2]).toBe(COLOR.BLUE);
  });

  it('splitter splits beam into 3 directions', () => {
    // Blue beam going RIGHT, hits splitter at (1,2)
    // Should continue RIGHT + go UP + go DOWN
    const state = {
      rows: 5, cols: 5,
      emitters: [{ row: 2, col: 0, dir: DIR.RIGHT, color: COLOR.BLUE }],
      mirrors: { '2,2': 'S' },
      targets: [],
    };
    const grid = propagateBeams(state);
    // Beam to the right of splitter
    expect(grid[2][3]).toBe(COLOR.BLUE);
    expect(grid[2][4]).toBe(COLOR.BLUE);
    // Beam going UP from splitter
    expect(grid[1][2]).toBe(COLOR.BLUE);
    expect(grid[0][2]).toBe(COLOR.BLUE);
    // Beam going DOWN from splitter
    expect(grid[3][2]).toBe(COLOR.BLUE);
    expect(grid[4][2]).toBe(COLOR.BLUE);
  });

  it('red + green = yellow mix', () => {
    const state = {
      rows: 3, cols: 3,
      emitters: [
        { row: 1, col: 0, dir: DIR.RIGHT, color: COLOR.RED },
        { row: 0, col: 1, dir: DIR.DOWN, color: COLOR.GREEN },
      ],
      mirrors: {},
      targets: [],
    };
    const grid = propagateBeams(state);
    expect(grid[1][1]).toBe(COLOR.YELLOW); // RED | GREEN
  });
});

describe('checkWin', () => {
  it('wins when all targets match', () => {
    const state = {
      rows: 1, cols: 3,
      emitters: [{ row: 0, col: 0, dir: DIR.RIGHT, color: COLOR.RED }],
      mirrors: {},
      targets: [{ row: 0, col: 2, color: COLOR.RED }],
    };
    const grid = propagateBeams(state);
    expect(checkWin(state, grid)).toBe(true);
  });

  it('fails when target has wrong color', () => {
    const state = {
      rows: 1, cols: 3,
      emitters: [{ row: 0, col: 0, dir: DIR.RIGHT, color: COLOR.RED }],
      mirrors: {},
      targets: [{ row: 0, col: 2, color: COLOR.BLUE }],
    };
    const grid = propagateBeams(state);
    expect(checkWin(state, grid)).toBe(false);
  });

  it('fails when target cell has no beam', () => {
    const state = {
      rows: 3, cols: 3,
      emitters: [{ row: 0, col: 0, dir: DIR.RIGHT, color: COLOR.GREEN }],
      mirrors: {},
      targets: [{ row: 2, col: 2, color: COLOR.GREEN }],
    };
    const grid = propagateBeams(state);
    expect(checkWin(state, grid)).toBe(false);
  });

  it('wins with mixed color target', () => {
    // Red + Green = Yellow target
    const state = {
      rows: 3, cols: 3,
      emitters: [
        { row: 1, col: 0, dir: DIR.RIGHT, color: COLOR.RED },
        { row: 0, col: 1, dir: DIR.DOWN, color: COLOR.GREEN },
      ],
      mirrors: {},
      targets: [{ row: 1, col: 1, color: COLOR.YELLOW }],
    };
    const grid = propagateBeams(state);
    expect(checkWin(state, grid)).toBe(true);
  });
});

describe('countPlacedMirrors', () => {
  it('counts only non-fixed mirrors', () => {
    const mirrors = { '0,0': '/', '1,1': '\\', '2,2': 'S' };
    const fixed = [[0, 0]]; // first one is fixed
    expect(countPlacedMirrors(mirrors, fixed)).toBe(2);
  });

  it('returns 0 when all mirrors are fixed', () => {
    const mirrors = { '0,0': '/' };
    expect(countPlacedMirrors(mirrors, [[0, 0]])).toBe(0);
  });

  it('returns count when no fixed', () => {
    const mirrors = { '0,0': '/', '1,1': '\\' };
    expect(countPlacedMirrors(mirrors, [])).toBe(2);
  });
});
