import { describe, test, expect } from 'bun:test';
import {
  LEVELS,
  createState,
  movePlayer,
  throwLure,
  getGuardVision,
  isWon,
} from './game.js';

describe('Shadow Heist logic', () => {
  test('player collects keycard when stepping onto it', () => {
    const state = createState({
      width: 4,
      height: 1,
      lureCharges: 2,
      grid: ['PK.E'],
      guards: [],
    });

    const next = movePlayer(state, 'right');
    expect(next.hasKey).toBe(true);
    expect(next.player).toEqual({ x: 1, y: 0 });
  });

  test('guard follows lure one step when aligned with a clear path', () => {
    const state = createState({
      width: 5,
      height: 3,
      lureCharges: 2,
      grid: [
        'P....',
        '.G...',
        '...E.',
      ],
      guards: [
        {
          x: 1,
          y: 1,
          patrol: [
            { x: 1, y: 1 },
            { x: 1, y: 2 },
          ],
        },
      ],
    });

    const next = throwLure(state, 3, 1);
    expect(next.lureCharges).toBe(1);
    expect(next.guards[0].x).toBe(2);
    expect(next.guards[0].y).toBe(1);
  });

  test('moving into a guard vision ray triggers alarm', () => {
    const state = createState({
      width: 5,
      height: 3,
      lureCharges: 2,
      grid: [
        '.....',
        'PG...',
        '...E.',
      ],
      guards: [
        {
          x: 1,
          y: 1,
          patrol: [
            { x: 1, y: 1 }],
        },
      ],
    });

    const next = movePlayer(state, 'right');
    expect(next.alarm).toBe(true);
    expect(getGuardVision(next)).toContainEqual({ x: 0, y: 1 });
  });

  test('walls block guard vision', () => {
    const state = createState({
      width: 4,
      height: 3,
      lureCharges: 2,
      grid: [
        'P...',
        '.G#.',
        '...E',
      ],
      guards: [
        { x: 1, y: 1, patrol: [{ x: 1, y: 1 }] },
      ],
    });

    const vision = getGuardVision(state);
    expect(vision).not.toContainEqual({ x: 3, y: 1 });
  });

  test('exit only wins after keycard is collected', () => {
    let state = createState(LEVELS[0]);
    state = movePlayer(state, 'right');
    state = movePlayer(state, 'down');
    expect(state.player).toEqual({ x: 1, y: 1 });
    expect(state.hasKey).toBe(true);
    state = movePlayer(state, 'right');
    expect(isWon(state)).toBe(true);
  });
});
