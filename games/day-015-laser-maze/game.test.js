import { describe, test, expect } from 'bun:test';
import { reflect, step, traceLaser, checkWin, LEVELS } from './game-logic.js';

// ─── Phase 0: Testability Analysis ───────────────────────────────────────────
// All game logic is pure functions in game-logic.js.
// Tests cover: reflection, stepping, laser tracing, win detection, level solutions.

describe('reflect()', () => {
  test('/ mirror: right → up', () => expect(reflect('right', '/')).toBe('up'));
  test('/ mirror: left → down', () => expect(reflect('left', '/')).toBe('down'));
  test('/ mirror: up → right', () => expect(reflect('up', '/')).toBe('right'));
  test('/ mirror: down → left', () => expect(reflect('down', '/')).toBe('left'));

  test('\\ mirror: right → down', () => expect(reflect('right', '\\')).toBe('down'));
  test('\\ mirror: left → up', () => expect(reflect('left', '\\')).toBe('up'));
  test('\\ mirror: up → left', () => expect(reflect('up', '\\')).toBe('left'));
  test('\\ mirror: down → right', () => expect(reflect('down', '\\')).toBe('right'));
});

describe('step()', () => {
  test('right increases col', () => expect(step(3, 2, 'right')).toEqual({ row: 3, col: 3 }));
  test('left decreases col', () => expect(step(3, 2, 'left')).toEqual({ row: 3, col: 1 }));
  test('up decreases row', () => expect(step(3, 2, 'up')).toEqual({ row: 2, col: 2 }));
  test('down increases row', () => expect(step(3, 2, 'down')).toEqual({ row: 4, col: 2 }));
});

describe('traceLaser()', () => {
  test('straight beam hits all cells in row', () => {
    const mirrors = new Map();
    const targets = new Set(['0,2', '0,4']);
    const { path, hitTargets } = traceLaser(5, { row: 0, col: 0, dir: 'right' }, mirrors, targets);
    expect(path.map(p => `${p.row},${p.col}`)).toContain('0,2');
    expect(path.map(p => `${p.row},${p.col}`)).toContain('0,4');
    expect(hitTargets.has('0,2')).toBe(true);
    expect(hitTargets.has('0,4')).toBe(true);
  });

  test('straight beam stops at grid boundary', () => {
    const { path } = traceLaser(5, { row: 2, col: 0, dir: 'right' }, new Map(), new Set());
    // Should visit cols 0..4 only
    expect(path.length).toBe(5);
    expect(path[4]).toEqual({ row: 2, col: 4 });
  });

  test('single / mirror deflects beam', () => {
    // Beam going right, hits '/' mirror at (2,2), deflects up
    const mirrors = new Map([['2,2', '/']]);
    const targets = new Set(['0,2']);
    const { hitTargets } = traceLaser(5, { row: 2, col: 0, dir: 'right' }, mirrors, targets);
    expect(hitTargets.has('0,2')).toBe(true);
  });

  test('single \\ mirror deflects beam', () => {
    // Beam going right, hits '\\' mirror at (0,3), deflects down
    const mirrors = new Map([['0,3', '\\']]);
    const targets = new Set(['4,3']);
    const { hitTargets } = traceLaser(5, { row: 0, col: 0, dir: 'right' }, mirrors, targets);
    expect(hitTargets.has('4,3')).toBe(true);
  });

  test('two-mirror path hits two targets', () => {
    // Source top col 0 going down
    // '\\' at (2,0): down→right
    // '\\' at (2,5): right→down
    // Targets: (2,3) and (5,5)
    const mirrors = new Map([['2,0', '\\'], ['2,5', '\\']]);
    const targets = new Set(['2,3', '5,5']);
    const { hitTargets } = traceLaser(6, { row: 0, col: 0, dir: 'down' }, mirrors, targets);
    expect(hitTargets.has('2,3')).toBe(true);
    expect(hitTargets.has('5,5')).toBe(true);
  });

  test('laser does not loop infinitely (loop detection)', () => {
    // Two facing mirrors create a loop: '/' at (2,2) and '/' at (2,4)
    // Beam right → hits (2,2) → up → exits. No loop in this case but test that it terminates.
    const mirrors = new Map([['2,2', '/'], ['4,2', '/']]);
    const { path } = traceLaser(6, { row: 2, col: 0, dir: 'right' }, mirrors, new Set());
    expect(path.length).toBeLessThan(200);
  });
});

describe('checkWin()', () => {
  test('returns true when all targets hit', () => {
    expect(checkWin(new Set(['1,2', '3,4']), new Set(['1,2', '3,4']))).toBe(true);
  });
  test('returns false when some targets not hit', () => {
    expect(checkWin(new Set(['1,2']), new Set(['1,2', '3,4']))).toBe(false);
  });
  test('returns false for empty target set', () => {
    expect(checkWin(new Set(), new Set())).toBe(false);
  });
});

describe('Level solutions', () => {
  test('Level 1: / at (2,4) hits target (0,4)', () => {
    const level = LEVELS[0];
    const mirrors = new Map([['2,4', '/']]);
    const targets = new Set(level.targets.map(([r, c]) => `${r},${c}`));
    const { hitTargets } = traceLaser(level.gridSize, level.source, mirrors, targets);
    expect(hitTargets.size).toBe(1);
    expect(hitTargets.has('0,4')).toBe(true);
  });

  test('Level 2: \\ at (2,0) and \\ at (2,5) hits targets (2,3) and (5,5)', () => {
    const level = LEVELS[1];
    const mirrors = new Map([['2,0', '\\'], ['2,5', '\\']]);
    const targets = new Set(level.targets.map(([r, c]) => `${r},${c}`));
    const { hitTargets } = traceLaser(level.gridSize, level.source, mirrors, targets);
    expect(hitTargets.has('2,3')).toBe(true);
    expect(hitTargets.has('5,5')).toBe(true);
  });

  test('Level 3: \\ at (3,0) and \\ at (3,6) hits targets (3,4) and (6,6)', () => {
    const level = LEVELS[2];
    const mirrors = new Map([['3,0', '\\'], ['3,6', '\\']]);
    const targets = new Set(level.targets.map(([r, c]) => `${r},${c}`));
    const { hitTargets } = traceLaser(level.gridSize, level.source, mirrors, targets);
    expect(hitTargets.has('3,4')).toBe(true);
    expect(hitTargets.has('6,6')).toBe(true);
  });

  test('Level 4: / at (5,0), / at (5,6), \\ at (0,6) hits all 3 targets', () => {
    const level = LEVELS[3];
    const mirrors = new Map([['5,0', '/'], ['5,6', '/'], ['0,6', '\\']]);
    const targets = new Set(level.targets.map(([r, c]) => `${r},${c}`));
    const { hitTargets } = traceLaser(level.gridSize, level.source, mirrors, targets);
    expect(hitTargets.has('5,3')).toBe(true);
    expect(hitTargets.has('2,6')).toBe(true);
    expect(hitTargets.has('0,4')).toBe(true);
  });

  test('Level 5: \\ at (0,3), \\ at (4,3), / at (4,6) hits all 3 targets', () => {
    const level = LEVELS[4];
    const mirrors = new Map([['0,3', '\\'], ['4,3', '\\'], ['4,6', '/']]);
    const targets = new Set(level.targets.map(([r, c]) => `${r},${c}`));
    const { hitTargets } = traceLaser(level.gridSize, level.source, mirrors, targets);
    expect(hitTargets.has('0,2')).toBe(true);
    expect(hitTargets.has('4,4')).toBe(true);
    expect(hitTargets.has('1,6')).toBe(true);
  });

  test('All levels have valid configuration', () => {
    for (const [i, level] of LEVELS.entries()) {
      expect(level.gridSize).toBeGreaterThan(0);
      expect(level.targets.length).toBeGreaterThan(0);
      expect(level.availableMirrors).toBeGreaterThan(0);
      expect(level.source.row).toBeGreaterThanOrEqual(0);
      expect(level.source.col).toBeGreaterThanOrEqual(0);
      expect(['right', 'left', 'up', 'down']).toContain(level.source.dir);
    }
  });
});
