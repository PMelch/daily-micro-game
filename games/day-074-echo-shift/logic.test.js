import { describe, expect, test } from 'bun:test';
import {
  LEVELS,
  createGameState,
  stepRun,
  saveEcho,
  resetRun,
  clearEchoes,
} from './logic.js';

describe('Echo Shift logic', () => {
  test('saving an echo resets the run and replays it from the start', () => {
    let state = createGameState(LEVELS[0]);

    state = stepRun(state, 'right');
    state = stepRun(state, 'right');
    state = stepRun(state, 'down');

    expect(state.currentPath).toEqual(['right', 'right', 'down']);
    expect(state.player.x).toBe(3);
    expect(state.player.y).toBe(2);

    state = saveEcho(state);

    expect(state.savedEchoes).toHaveLength(1);
    expect(state.savedEchoes[0]).toEqual(['right', 'right', 'down']);
    expect(state.player).toEqual(state.level.start);
    expect(state.stepsUsed).toBe(0);

    state = stepRun(state, 'down');
    state = stepRun(state, 'down');
    state = stepRun(state, 'right');

    expect(state.echoes[0].position).toEqual({ x: 3, y: 2 });
    expect(state.platesActive).toBe(1);
  });

  test('door opens once all plates are occupied and the player can then reach the exit', () => {
    let state = createGameState(LEVELS[0]);

    state = stepRun(state, 'right');
    state = stepRun(state, 'right');
    state = stepRun(state, 'down');
    state = saveEcho(state);

    state = stepRun(state, 'down');
    state = stepRun(state, 'down');
    state = stepRun(state, 'right');
    state = stepRun(state, 'right');
    state = stepRun(state, 'right');

    expect(state.doorOpen).toBe(true);

    state = stepRun(state, 'right');
    state = stepRun(state, 'right');

    expect(state.status).toBe('won');
  });

  test('clearEchoes removes saved recordings and resets the run', () => {
    let state = createGameState(LEVELS[1]);
    state = stepRun(state, 'right');
    state = saveEcho(state);
    expect(state.savedEchoes).toHaveLength(1);

    state = clearEchoes(state);

    expect(state.savedEchoes).toHaveLength(0);
    expect(state.echoes).toHaveLength(0);
    expect(state.player).toEqual(state.level.start);
    expect(state.currentPath).toEqual([]);
  });

  test('resetRun keeps saved echoes but rewinds every actor to the beginning', () => {
    let state = createGameState(LEVELS[1]);
    state = stepRun(state, 'right');
    state = saveEcho(state);
    state = stepRun(state, 'down');
    state = stepRun(state, 'down');

    expect(state.stepsUsed).toBe(2);

    state = resetRun(state);

    expect(state.savedEchoes).toHaveLength(1);
    expect(state.echoes[0].position).toEqual(state.level.start);
    expect(state.player).toEqual(state.level.start);
    expect(state.stepsUsed).toBe(0);
  });
});
