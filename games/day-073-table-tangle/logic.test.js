import { describe, expect, test } from 'bun:test';
import {
  PUZZLES,
  createGame,
  scoreArrangement,
  isArrangementComplete,
  submitArrangement,
} from './logic.js';

describe('Table Tangle logic', () => {
  test('createGame builds players with names and zeroed scores', () => {
    const game = createGame(['Ada', 'Bob']);

    expect(game.round).toBe(1);
    expect(game.players.map((player) => player.name)).toEqual(['Ada', 'Bob']);
    expect(game.players.map((player) => player.score)).toEqual([0, 0]);
    expect(game.currentPlayerIndex).toBe(0);
  });

  test('scoreArrangement rewards satisfied and penalizes broken seating rules', () => {
    const puzzle = PUZZLES[0];
    const arrangement = ['mayor', 'chef', 'critic', 'cat', 'robot', 'dj'];

    const result = scoreArrangement(puzzle, arrangement);

    expect(result.total).toBe(18);
    expect(result.satisfied).toBe(4);
    expect(result.broken).toBe(1);
    expect(result.details.map((detail) => detail.ok)).toEqual([true, true, true, true, false]);
  });

  test('isArrangementComplete requires every seat to be filled', () => {
    expect(isArrangementComplete(['a', 'b', null])).toBe(false);
    expect(isArrangementComplete(['a', 'b', 'c'])).toBe(true);
  });

  test('submitArrangement adds score and advances to the next player', () => {
    const game = createGame(['Ada', 'Bob']);
    const arrangement = ['mayor', 'chef', 'critic', 'cat', 'robot', 'dj'];

    const result = submitArrangement(game, arrangement);

    expect(result.ok).toBe(true);
    expect(result.score.total).toBe(18);
    expect(game.players[0].score).toBe(18);
    expect(game.currentPlayerIndex).toBe(1);
    expect(game.round).toBe(1);
    expect(game.status).toBe('transition');
  });
});
