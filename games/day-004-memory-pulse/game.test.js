import { describe, test, expect } from 'bun:test';
import { createGame, addToSequence, addToSequenceWithValue, getFlashDuration, handleInput, markInputReady, getTileColors } from './game.js';

describe('createGame', () => {
  test('creates game with default 4 tiles', () => {
    const g = createGame();
    expect(g.tileCount).toBe(4);
    expect(g.sequence).toEqual([]);
    expect(g.round).toBe(0);
    expect(g.state).toBe('idle');
    expect(g.bestRound).toBe(0);
  });

  test('creates game with custom tile count', () => {
    const g = createGame(6);
    expect(g.tileCount).toBe(6);
  });
});

describe('addToSequence', () => {
  test('adds one element to sequence', () => {
    const g = createGame(4);
    const next = addToSequence(g);
    expect(next.sequence.length).toBe(1);
    expect(next.round).toBe(1);
    expect(next.state).toBe('playing');
    expect(next.sequence[0]).toBeGreaterThanOrEqual(0);
    expect(next.sequence[0]).toBeLessThan(4);
  });

  test('preserves existing sequence', () => {
    let g = createGame(4);
    g = addToSequenceWithValue(g, 2);
    g = addToSequenceWithValue(g, 0);
    expect(g.sequence).toEqual([2, 0]);
    expect(g.round).toBe(2);
  });

  test('does not mutate original', () => {
    const g = createGame(4);
    addToSequence(g);
    expect(g.sequence).toEqual([]);
  });

  test('resets inputIndex', () => {
    let g = createGame(4);
    g = { ...g, inputIndex: 3 };
    const next = addToSequence(g);
    expect(next.inputIndex).toBe(0);
  });
});

describe('getFlashDuration', () => {
  test('round 1 returns base duration', () => {
    expect(getFlashDuration(1)).toBe(600);
  });

  test('duration decreases with rounds', () => {
    expect(getFlashDuration(5)).toBeLessThan(getFlashDuration(1));
  });

  test('never goes below minimum', () => {
    expect(getFlashDuration(100)).toBeGreaterThanOrEqual(250);
  });

  test('monotonically decreasing', () => {
    for (let i = 1; i < 20; i++) {
      expect(getFlashDuration(i + 1)).toBeLessThanOrEqual(getFlashDuration(i));
    }
  });
});

describe('handleInput', () => {
  test('ignores input when not in input state', () => {
    const g = createGame(4);
    const result = handleInput(g, 0);
    expect(result.state).toBe('idle');
  });

  test('correct input advances inputIndex', () => {
    let g = createGame(4);
    g = addToSequenceWithValue(g, 2);
    g = addToSequenceWithValue(g, 1);
    g = markInputReady(g);
    const result = handleInput(g, 2);
    expect(result.inputIndex).toBe(1);
    expect(result.state).toBe('input');
  });

  test('wrong input triggers gameover', () => {
    let g = createGame(4);
    g = addToSequenceWithValue(g, 2);
    g = markInputReady(g);
    const result = handleInput(g, 1);
    expect(result.state).toBe('gameover');
  });

  test('gameover records best round (round-1 since current failed)', () => {
    let g = createGame(4);
    g = addToSequenceWithValue(g, 0);
    g = addToSequenceWithValue(g, 1);
    g = addToSequenceWithValue(g, 2);
    g = markInputReady(g);
    // Fail on round 3
    const result = handleInput(g, 3);
    expect(result.bestRound).toBe(2);
  });

  test('completing sequence sets roundcomplete', () => {
    let g = createGame(4);
    g = addToSequenceWithValue(g, 2);
    g = markInputReady(g);
    const result = handleInput(g, 2);
    expect(result.state).toBe('roundcomplete');
  });

  test('best round tracks across games', () => {
    let g = createGame(4);
    g = { ...g, bestRound: 5 };
    g = addToSequenceWithValue(g, 0);
    g = addToSequenceWithValue(g, 1);
    g = markInputReady(g);
    const result = handleInput(g, 3); // wrong
    expect(result.bestRound).toBe(5); // keeps old best since round-1=1 < 5
  });
});

describe('getTileColors', () => {
  test('returns correct number of colors', () => {
    expect(getTileColors(4).length).toBe(4);
    expect(getTileColors(6).length).toBe(6);
  });
});
