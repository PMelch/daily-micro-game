import { describe, it, expect } from 'bun:test';
import { createGame, tapNumber, getElapsed } from './game.js';

describe('createGame', () => {
  it('creates a grid with correct total numbers', () => {
    const game = createGame(4);
    expect(game.total).toBe(16);
    expect(game.numbers.length).toBe(16);
    expect(game.nextTarget).toBe(1);
    expect(game.finished).toBe(false);
  });

  it('assigns all values 1..N', () => {
    const game = createGame(5);
    const values = game.numbers.map(n => n.value).sort((a, b) => a - b);
    expect(values).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it('places numbers in valid grid positions', () => {
    const game = createGame(3);
    for (const n of game.numbers) {
      expect(n.row).toBeGreaterThanOrEqual(0);
      expect(n.row).toBeLessThan(3);
      expect(n.col).toBeGreaterThanOrEqual(0);
      expect(n.col).toBeLessThan(3);
    }
  });

  it('no two numbers share a position', () => {
    const game = createGame(5);
    const keys = game.numbers.map(n => `${n.row},${n.col}`);
    expect(new Set(keys).size).toBe(25);
  });
});

describe('tapNumber', () => {
  it('accepts correct sequence', () => {
    const game = createGame(3);
    expect(tapNumber(game, 1)).toEqual({ ok: true, finished: false });
    expect(tapNumber(game, 2)).toEqual({ ok: true, finished: false });
    expect(game.nextTarget).toBe(3);
  });

  it('rejects wrong number', () => {
    const game = createGame(3);
    const result = tapNumber(game, 5);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('wrong');
    expect(result.expected).toBe(1);
    expect(game.mistakes).toBe(1);
  });

  it('marks game finished when all tapped', () => {
    const game = createGame(2); // 4 numbers
    tapNumber(game, 1);
    tapNumber(game, 2);
    tapNumber(game, 3);
    const result = tapNumber(game, 4);
    expect(result.ok).toBe(true);
    expect(result.finished).toBe(true);
    expect(game.finished).toBe(true);
    expect(typeof result.time).toBe('number');
  });

  it('rejects taps after finished', () => {
    const game = createGame(2);
    for (let i = 1; i <= 4; i++) tapNumber(game, i);
    expect(tapNumber(game, 1)).toEqual({ ok: false, reason: 'finished' });
  });

  it('starts timer on first tap', () => {
    const game = createGame(3);
    expect(game.startTime).toBeNull();
    tapNumber(game, 1);
    expect(game.startTime).not.toBeNull();
  });
});

describe('getElapsed', () => {
  it('returns 0 before start', () => {
    const game = createGame(3);
    expect(getElapsed(game)).toBe(0);
  });

  it('returns elapsed after start', () => {
    const game = createGame(3);
    tapNumber(game, 1);
    const elapsed = getElapsed(game);
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });
});
