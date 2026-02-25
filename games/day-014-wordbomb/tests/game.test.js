// WordBomb - Game Logic Tests
// Run with: bun test

import { describe, test, expect } from 'bun:test';
import {
  initGame,
  addLetter,
  applyBoom,
  nextTurn,
  startChallenge,
  resolveChallenge,
  isEliminated,
  getActivePlayers,
  getWinner,
  isCompleteWord,
  canFragmentContinue,
  WORDS
} from '../game.js';

// --- Word List Tests ---
describe('Word List', () => {
  test('WORDS is a non-empty Set', () => {
    expect(WORDS instanceof Set).toBe(true);
    expect(WORDS.size).toBeGreaterThan(100);
  });

  test('common words are in the list', () => {
    expect(WORDS.has('cat')).toBe(true);
    expect(WORDS.has('dog')).toBe(true);
    expect(WORDS.has('game')).toBe(true);
    expect(WORDS.has('play')).toBe(true);
  });

  test('non-words are not in the list', () => {
    expect(WORDS.has('xzq')).toBe(false);
    expect(WORDS.has('zzz')).toBe(false);
  });
});

// --- isCompleteWord Tests ---
describe('isCompleteWord', () => {
  test('returns false for fragments shorter than 3 letters', () => {
    expect(isCompleteWord('a')).toBe(false);
    expect(isCompleteWord('ca')).toBe(false);
  });

  test('returns true for exact dictionary words (3+ letters)', () => {
    expect(isCompleteWord('cat')).toBe(true);
    expect(isCompleteWord('dog')).toBe(true);
    expect(isCompleteWord('game')).toBe(true);
  });

  test('returns false for fragments that are not complete words', () => {
    expect(isCompleteWord('gam')).toBe(false); // prefix of game but not a word (maybe)
    expect(isCompleteWord('xyz')).toBe(false);
  });
});

// --- canFragmentContinue Tests ---
describe('canFragmentContinue', () => {
  test('returns true for fragments that can lead to a word', () => {
    expect(canFragmentContinue('ga')).toBe(true);   // game, gap, etc.
    expect(canFragmentContinue('ca')).toBe(true);   // cat, car, etc.
    expect(canFragmentContinue('pl')).toBe(true);   // play, plan, etc.
  });

  test('returns false for fragments with no continuation', () => {
    expect(canFragmentContinue('xzq')).toBe(false);
    expect(canFragmentContinue('qqq')).toBe(false);
  });

  test('returns true for single letters', () => {
    expect(canFragmentContinue('a')).toBe(true);
    expect(canFragmentContinue('g')).toBe(true);
  });
});

// --- initGame Tests ---
describe('initGame', () => {
  test('creates a game with correct players', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.players).toHaveLength(2);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
  });

  test('each player starts with 3 lives', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    state.players.forEach(p => expect(p.lives).toBe(3));
  });

  test('game starts with empty fragment', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.fragment).toBe('');
  });

  test('first player is active (index 0)', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.activePlayerIndex).toBe(0);
  });

  test('phase is "playing" initially', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.phase).toBe('playing');
  });

  test('requires at least 2 players', () => {
    expect(() => initGame(['Solo'])).toThrow();
  });

  test('requires at most 4 players', () => {
    expect(() => initGame(['A', 'B', 'C', 'D', 'E'])).toThrow();
  });
});

// --- addLetter Tests ---
describe('addLetter', () => {
  test('appends letter to fragment', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = addLetter(state, 'g');
    expect(next.fragment).toBe('g');
  });

  test('converts letter to lowercase', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = addLetter(state, 'G');
    expect(next.fragment).toBe('g');
  });

  test('advances turn after adding a safe letter', () => {
    const state = initGame(['Alice', 'Bob']);
    // 'g' alone is not a word, so turn advances
    const next = addLetter(state, 'g');
    expect(next.activePlayerIndex).toBe(1);
  });

  test('does not mutate original state', () => {
    const state = initGame(['Alice', 'Bob']);
    addLetter(state, 'g');
    expect(state.fragment).toBe('');
  });

  test('detects completed word and triggers boom', () => {
    // Set up a fragment that will become a complete word on next letter
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, fragment: 'ca' };  // 'ca' + 't' = 'cat'
    const next = addLetter(state, 't');
    expect(next.phase).toBe('boom');
    expect(next.boomReason).toBe('word');
    expect(next.boomPlayer).toBe(0);  // Alice triggered the boom
  });

  test('does not boom on 2-letter non-word fragment', () => {
    let state = initGame(['Alice', 'Bob']);
    const next = addLetter(state, 'g');
    expect(next.phase).toBe('playing');
  });
});

// --- applyBoom Tests ---
describe('applyBoom', () => {
  test('removes a life from the boom player', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, fragment: 'ca' };
    state = addLetter(state, 't'); // triggers boom for player 0
    const next = applyBoom(state);
    expect(next.players[0].lives).toBe(2);
  });

  test('resets fragment to empty', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, fragment: 'ca' };
    state = addLetter(state, 't');
    const next = applyBoom(state);
    expect(next.fragment).toBe('');
  });

  test('advances turn after boom', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, fragment: 'ca', activePlayerIndex: 0 };
    state = addLetter(state, 't');
    const next = applyBoom(state);
    expect(next.activePlayerIndex).toBe(1);
  });

  test('phase returns to playing after boom', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, fragment: 'ca' };
    state = addLetter(state, 't');
    const next = applyBoom(state);
    expect(next.phase).toBe('playing');
  });

  test('eliminated player is skipped in future turns', () => {
    let state = initGame(['Alice', 'Bob']);
    // Give Alice 1 life left, then trigger a boom
    state.players[0].lives = 1;
    state = { ...state, fragment: 'ca', activePlayerIndex: 0 };
    state = addLetter(state, 't');
    const next = applyBoom(state);
    expect(next.players[0].lives).toBe(0);
    expect(next.players[0].eliminated).toBe(true);
  });
});

// --- nextTurn Tests ---
describe('nextTurn', () => {
  test('cycles through players', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    expect(nextTurn(state, 0).activePlayerIndex).toBe(1);
    expect(nextTurn(state, 1).activePlayerIndex).toBe(2);
    expect(nextTurn(state, 2).activePlayerIndex).toBe(0);
  });

  test('skips eliminated players', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    state.players[1].eliminated = true;
    // If current is 0, next alive is 2 (skipping 1)
    expect(nextTurn(state, 0).activePlayerIndex).toBe(2);
  });
});

// --- isEliminated / getActivePlayers / getWinner Tests ---
describe('isEliminated', () => {
  test('returns false for player with lives', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(isEliminated(state.players[0])).toBe(false);
  });

  test('returns true for player with 0 lives', () => {
    const state = initGame(['Alice', 'Bob']);
    state.players[0].lives = 0;
    expect(isEliminated(state.players[0])).toBe(true);
  });
});

describe('getActivePlayers', () => {
  test('returns all players initially', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    expect(getActivePlayers(state)).toHaveLength(3);
  });

  test('excludes eliminated players', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    state.players[0].eliminated = true;
    expect(getActivePlayers(state)).toHaveLength(2);
  });
});

describe('getWinner', () => {
  test('returns null when multiple players are active', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(getWinner(state)).toBeNull();
  });

  test('returns winning player when only one remains', () => {
    const state = initGame(['Alice', 'Bob']);
    state.players[1].eliminated = true;
    expect(getWinner(state)).toBe(state.players[0]);
  });
});

// --- Challenge Tests ---
describe('startChallenge', () => {
  test('sets phase to challenge', () => {
    const state = initGame(['Alice', 'Bob']);
    const state2 = addLetter(state, 'g');
    const challenged = startChallenge(state2);
    expect(challenged.phase).toBe('challenge');
  });

  test('challenger is the player who pressed challenge (previous player)', () => {
    const state = initGame(['Alice', 'Bob']);
    // After Alice adds 'g', Bob is active (index 1), so Bob challenges Alice (index 0)
    const state2 = addLetter(state, 'g');
    expect(state2.activePlayerIndex).toBe(1);
    const challenged = startChallenge(state2);
    // challenger = Bob (current active), challengedPlayer = Alice (previous)
    expect(challenged.challengerIndex).toBe(1);
    expect(challenged.challengedIndex).toBe(0);
  });
});

describe('resolveChallenge', () => {
  test('if challenged player provides a valid word → challenger loses a life', () => {
    const state = initGame(['Alice', 'Bob']);
    const state2 = addLetter(state, 'g'); // Bob is now active (index 1)
    const challenged = startChallenge(state2); // Bob challenges Alice
    // Alice provides 'game' (starts with 'g', is a real word) → Bob loses
    const resolved = resolveChallenge(challenged, 'game', true);
    expect(resolved.players[1].lives).toBe(2); // Bob (challenger) loses
    expect(resolved.players[0].lives).toBe(3); // Alice keeps lives
  });

  test('if challenged player cannot provide valid word → challenged loses a life', () => {
    const state = initGame(['Alice', 'Bob']);
    const state2 = addLetter(state, 'g');
    const challenged = startChallenge(state2);
    // Alice cannot provide a valid word → Alice loses
    const resolved = resolveChallenge(challenged, '', false);
    expect(resolved.players[0].lives).toBe(2); // Alice (challenged) loses
    expect(resolved.players[1].lives).toBe(3); // Bob keeps lives
  });

  test('after challenge resolution, phase returns to playing', () => {
    const state = initGame(['Alice', 'Bob']);
    const state2 = addLetter(state, 'g');
    const challenged = startChallenge(state2);
    const resolved = resolveChallenge(challenged, 'game', true);
    expect(resolved.phase).toBe('playing');
  });

  test('after challenge, fragment resets', () => {
    const state = initGame(['Alice', 'Bob']);
    const state2 = addLetter(state, 'g');
    const challenged = startChallenge(state2);
    const resolved = resolveChallenge(challenged, 'game', true);
    expect(resolved.fragment).toBe('');
  });
});
