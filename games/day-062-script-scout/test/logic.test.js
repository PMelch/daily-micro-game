const { describe, test, expect } = require('bun:test');
const {
  TURN_LEFT,
  TURN_RIGHT,
  FORWARD,
  WAIT,
  executeProgram,
  isLevelComplete,
  createRunSummary,
} = require('../logic.js');

describe('Script Scout logic', () => {
  test('robot turns and collects crystals while following a program', () => {
    const level = {
      width: 5,
      height: 5,
      start: { x: 1, y: 3, dir: 'N' },
      goal: { x: 2, y: 1 },
      walls: [{ x: 0, y: 0 }],
      crystals: [{ x: 1, y: 2 }, { x: 2, y: 2 }],
      commandLimit: 5,
    };

    const result = executeProgram(level, [FORWARD, TURN_RIGHT, FORWARD, TURN_LEFT, FORWARD]);

    expect(result.position).toEqual({ x: 2, y: 1, dir: 'N' });
    expect(result.crystalsCollected).toBe(2);
    expect(result.hitWall).toBe(false);
    expect(result.visited).toContainEqual({ x: 2, y: 1 });
    expect(isLevelComplete(level, result)).toBe(true);
  });

  test('robot stops when it tries to walk into a wall or outside the board', () => {
    const level = {
      width: 4,
      height: 4,
      start: { x: 0, y: 0, dir: 'N' },
      goal: { x: 3, y: 3 },
      walls: [],
      crystals: [],
      commandLimit: 3,
    };

    const result = executeProgram(level, [FORWARD, TURN_LEFT, FORWARD]);

    expect(result.hitWall).toBe(true);
    expect(result.failedStep).toBe(1);
    expect(result.position).toEqual({ x: 0, y: 0, dir: 'N' });
    expect(isLevelComplete(level, result)).toBe(false);
  });

  test('summary rates efficient runs with stars', () => {
    const level = {
      width: 5,
      height: 5,
      start: { x: 1, y: 3, dir: 'N' },
      goal: { x: 2, y: 1 },
      walls: [],
      crystals: [{ x: 1, y: 2 }, { x: 2, y: 2 }],
      commandLimit: 5,
      par: 5,
    };

    const perfect = createRunSummary(level, executeProgram(level, [FORWARD, TURN_RIGHT, FORWARD, TURN_LEFT, FORWARD]), 5);
    const sloppy = createRunSummary(level, executeProgram(level, [WAIT, FORWARD, TURN_RIGHT, FORWARD, TURN_LEFT, FORWARD]), 6);

    expect(perfect.stars).toBe(3);
    expect(sloppy.stars).toBeLessThan(3);
    expect(perfect.completed).toBe(true);
  });
});
