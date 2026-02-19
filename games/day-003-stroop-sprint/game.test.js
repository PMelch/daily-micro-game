import { describe, test, expect } from 'bun:test';
import {
  COLORS, generateRound, checkAnswer, createGameState,
  handleAnswer, getTimeLimit, INITIAL_TIME_LIMIT
} from './game.js';

describe('COLORS', () => {
  test('has at least 4 colors', () => {
    expect(COLORS.length).toBeGreaterThanOrEqual(4);
  });

  test('each color has name and hex', () => {
    for (const c of COLORS) {
      expect(c.name).toBeTypeOf('string');
      expect(c.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('generateRound', () => {
  test('returns word and inkColor that differ', () => {
    for (let i = 0; i < 50; i++) {
      const round = generateRound();
      expect(round.word).not.toBe(round.inkColor);
      expect(COLORS.find(c => c.name === round.word)).toBeTruthy();
      expect(COLORS.find(c => c.name === round.inkColor)).toBeTruthy();
    }
  });

  test('returns inkHex matching inkColor', () => {
    const round = generateRound();
    const color = COLORS.find(c => c.name === round.inkColor);
    expect(round.inkHex).toBe(color.hex);
  });
});

describe('checkAnswer', () => {
  test('correct when answer matches ink color', () => {
    const round = { word: 'RED', inkColor: 'BLUE', inkHex: '#0000ff' };
    expect(checkAnswer(round, 'BLUE')).toBe(true);
  });

  test('wrong when answer matches word instead', () => {
    const round = { word: 'RED', inkColor: 'BLUE', inkHex: '#0000ff' };
    expect(checkAnswer(round, 'RED')).toBe(false);
  });
});

describe('createGameState', () => {
  test('initializes with 3 lives and 0 score', () => {
    const state = createGameState();
    expect(state.lives).toBe(3);
    expect(state.score).toBe(0);
    expect(state.round).toBe(0);
    expect(state.gameOver).toBe(false);
  });
});

describe('handleAnswer', () => {
  test('correct answer increments score and round', () => {
    const state = createGameState();
    const round = { word: 'RED', inkColor: 'BLUE', inkHex: '#0000ff' };
    const next = handleAnswer(state, round, 'BLUE');
    expect(next.score).toBe(1);
    expect(next.round).toBe(1);
    expect(next.lives).toBe(3);
  });

  test('wrong answer decrements lives', () => {
    const state = createGameState();
    const round = { word: 'RED', inkColor: 'BLUE', inkHex: '#0000ff' };
    const next = handleAnswer(state, round, 'RED');
    expect(next.score).toBe(0);
    expect(next.lives).toBe(2);
    expect(next.round).toBe(1);
  });

  test('3 wrong answers = game over', () => {
    let state = createGameState();
    const round = { word: 'RED', inkColor: 'BLUE', inkHex: '#0000ff' };
    state = handleAnswer(state, round, 'RED');
    state = handleAnswer(state, round, 'RED');
    state = handleAnswer(state, round, 'RED');
    expect(state.lives).toBe(0);
    expect(state.gameOver).toBe(true);
  });
});

describe('getTimeLimit', () => {
  test('starts at initial time limit', () => {
    expect(getTimeLimit(0)).toBe(INITIAL_TIME_LIMIT);
  });

  test('decreases over rounds', () => {
    expect(getTimeLimit(10)).toBeLessThan(getTimeLimit(0));
  });

  test('never goes below 1 second', () => {
    expect(getTimeLimit(1000)).toBeGreaterThanOrEqual(1000);
  });
});
