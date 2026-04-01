/**
 * TDD Tests for Category Clash
 * Run: bun test game.test.js
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
  createGameState,
  startGame,
  submitAnswer,
  nextTurn,
  checkAnswer,
  isGameOver,
  getWinner,
  generateCategory,
  CATEGORIES,
} from './game-logic.js';

// ─── TESTABILITY ANALYSIS ─────────────────────────────────────────────────────
// Pure logic module: createGameState, submitAnswer, checkAnswer, nextTurn, isGameOver
// All functions are deterministic when given fixed input.
// Categories are tested against lists.
// No external deps needed.
// ─────────────────────────────────────────────────────────────────────────────

describe('CATEGORIES data', () => {
  test('has at least 10 categories', () => {
    expect(Object.keys(CATEGORIES).length).toBeGreaterThanOrEqual(10);
  });

  test('each category has a label and answers array', () => {
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      expect(cat.label).toBeDefined();
      expect(Array.isArray(cat.answers)).toBe(true);
      expect(cat.answers.length).toBeGreaterThan(10);
    }
  });
});

describe('generateCategory', () => {
  test('returns a valid category key', () => {
    const key = generateCategory([]);
    expect(CATEGORIES[key]).toBeDefined();
  });

  test('avoids excluded categories when possible', () => {
    const allKeys = Object.keys(CATEGORIES);
    const exclude = allKeys.slice(0, allKeys.length - 1);
    const key = generateCategory(exclude);
    expect(CATEGORIES[key]).toBeDefined();
  });
});

describe('createGameState', () => {
  test('creates state with player names', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.players.length).toBe(2);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
  });

  test('players start with 3 lives', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players.forEach(p => expect(p.lives).toBe(3));
  });

  test('first player is active', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.activePlayerIndex).toBe(0);
  });

  test('phase is setup initially', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.phase).toBe('setup');
  });
});

describe('startGame', () => {
  test('sets phase to playing', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    expect(state.phase).toBe('playing');
  });

  test('assigns a category', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    expect(state.currentCategory).toBeDefined();
    expect(CATEGORIES[state.currentCategory]).toBeDefined();
  });

  test('starts a timer (timestamp)', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    expect(state.turnStartTime).toBeGreaterThan(0);
  });

  test('usedAnswers is empty at start', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    expect(state.usedAnswers.length).toBe(0);
  });
});

describe('checkAnswer', () => {
  test('valid answer returns true', () => {
    // Use a real category
    const catKey = Object.keys(CATEGORIES)[0];
    const cat = CATEGORIES[catKey];
    const answer = cat.answers[0];
    expect(checkAnswer(answer, catKey, [])).toBe(true);
  });

  test('invalid answer returns false', () => {
    const catKey = Object.keys(CATEGORIES)[0];
    expect(checkAnswer('xyzzy_not_a_thing', catKey, [])).toBe(false);
  });

  test('already used answer returns false', () => {
    const catKey = Object.keys(CATEGORIES)[0];
    const cat = CATEGORIES[catKey];
    const answer = cat.answers[0];
    expect(checkAnswer(answer, catKey, [answer.toLowerCase()])).toBe(false);
  });

  test('case insensitive matching', () => {
    const catKey = Object.keys(CATEGORIES)[0];
    const cat = CATEGORIES[catKey];
    const answer = cat.answers[0];
    expect(checkAnswer(answer.toUpperCase(), catKey, [])).toBe(true);
    expect(checkAnswer(answer.toLowerCase(), catKey, [])).toBe(true);
  });
});

describe('submitAnswer', () => {
  test('correct answer advances to pass-device phase', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    const catKey = state.currentCategory;
    const cat = CATEGORIES[catKey];
    const answer = cat.answers[0];
    const result = submitAnswer(state, answer);
    expect(result.state.phase).toBe('pass-device');
    expect(result.correct).toBe(true);
  });

  test('wrong answer costs active player a life', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    const result = submitAnswer(state, 'ZZZZNOTVALID');
    expect(result.state.players[0].lives).toBe(2);
    expect(result.correct).toBe(false);
  });

  test('correct answer is added to usedAnswers', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    const catKey = state.currentCategory;
    const answer = CATEGORIES[catKey].answers[0];
    const result = submitAnswer(state, answer);
    // After pass-device, check that answer was recorded (in the new turn after nextTurn)
    expect(result.state.lastAnswer).toBe(answer.toLowerCase());
  });

  test('timeout (no answer) costs a life', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    // Simulate timeout: pass empty string
    const result = submitAnswer(state, '', true); // third param = timeout flag
    expect(result.state.players[0].lives).toBe(2);
    expect(result.correct).toBe(false);
  });
});

describe('nextTurn', () => {
  test('advances to next player', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    state = nextTurn(state);
    expect(state.activePlayerIndex).toBe(1);
  });

  test('wraps around to player 0', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    state = nextTurn(state); // -> 1
    state = nextTurn(state); // -> 0
    expect(state.activePlayerIndex).toBe(0);
  });

  test('skips eliminated players (0 lives)', () => {
    let state = createGameState(['Alice', 'Bob', 'Charlie']);
    state = startGame(state);
    state.players[1].lives = 0; // eliminate Bob
    state = nextTurn(state); // Alice -> Charlie (skip Bob)
    expect(state.activePlayerIndex).toBe(2);
  });

  test('phase returns to playing after nextTurn', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    state.phase = 'pass-device';
    state = nextTurn(state);
    expect(state.phase).toBe('playing');
  });

  test('usedAnswers persist across turns (same category)', () => {
    let state = createGameState(['Alice', 'Bob']);
    state = startGame(state);
    const catKey = state.currentCategory;
    const answer = CATEGORIES[catKey].answers[0];
    const r = submitAnswer(state, answer);
    state = r.state;
    state = nextTurn(state);
    expect(state.usedAnswers).toContain(answer.toLowerCase());
  });
});

describe('isGameOver', () => {
  test('not over when 2+ players alive', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(isGameOver(state)).toBe(false);
  });

  test('game over when only 1 player alive', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players[1].lives = 0;
    expect(isGameOver(state)).toBe(true);
  });

  test('game over when all players eliminated (edge case)', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players[0].lives = 0;
    state.players[1].lives = 0;
    expect(isGameOver(state)).toBe(true);
  });
});

describe('getWinner', () => {
  test('returns the last surviving player', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players[1].lives = 0;
    const winner = getWinner(state);
    expect(winner.name).toBe('Alice');
  });

  test('returns player with most lives if all have lives', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players[0].lives = 3;
    state.players[1].lives = 1;
    const winner = getWinner(state);
    expect(winner.name).toBe('Alice');
  });
});
