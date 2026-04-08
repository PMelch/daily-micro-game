/**
 * TDD tests for Vibe Check game logic
 * Run with: bun test
 */
import { describe, test, expect } from 'bun:test';
import {
  calculateScore,
  scoreLabel,
  getRandomTargetPosition,
  pickSpectrums,
  initGame,
  nextRound,
  submitClue,
  submitGuess,
  getWinners,
  SPECTRUMS,
} from './vibe-logic.js';

// ── calculateScore ─────────────────────────────────────────────────────────────
describe('calculateScore', () => {
  test('returns 4 for exact match (dist=0)', () => {
    expect(calculateScore(50, 50)).toBe(4);
  });

  test('returns 4 for dist=8 (edge of bullseye)', () => {
    expect(calculateScore(50, 58)).toBe(4);
    expect(calculateScore(50, 42)).toBe(4);
  });

  test('returns 3 for dist=9 (just outside bullseye)', () => {
    expect(calculateScore(50, 59)).toBe(3);
  });

  test('returns 3 for dist=18 (edge of close zone)', () => {
    expect(calculateScore(50, 68)).toBe(3);
  });

  test('returns 2 for dist=19 (just outside close zone)', () => {
    expect(calculateScore(50, 69)).toBe(2);
  });

  test('returns 2 for dist=30 (edge of warm zone)', () => {
    expect(calculateScore(50, 80)).toBe(2);
  });

  test('returns 1 for dist=31 (cold zone)', () => {
    expect(calculateScore(50, 81)).toBe(1);
    expect(calculateScore(50, 0)).toBe(1);
  });

  test('score is symmetric', () => {
    expect(calculateScore(30, 70)).toBe(calculateScore(70, 30));
  });

  test('handles edge positions', () => {
    expect(calculateScore(0, 0)).toBe(4);
    expect(calculateScore(100, 100)).toBe(4);
  });
});

// ── scoreLabel ─────────────────────────────────────────────────────────────────
describe('scoreLabel', () => {
  test('maps 4 to bullseye', () => expect(scoreLabel(4)).toBe('bullseye'));
  test('maps 3 to close', () => expect(scoreLabel(3)).toBe('close'));
  test('maps 2 to warm', () => expect(scoreLabel(2)).toBe('warm'));
  test('maps 1 to cold', () => expect(scoreLabel(1)).toBe('cold'));
});

// ── getRandomTargetPosition ────────────────────────────────────────────────────
describe('getRandomTargetPosition', () => {
  test('returns value between 15 and 85', () => {
    for (let i = 0; i < 100; i++) {
      const pos = getRandomTargetPosition();
      expect(pos).toBeGreaterThanOrEqual(15);
      expect(pos).toBeLessThanOrEqual(85);
    }
  });
});

// ── pickSpectrums ──────────────────────────────────────────────────────────────
describe('pickSpectrums', () => {
  test('returns requested count of spectrums', () => {
    const s = pickSpectrums(5);
    expect(s).toHaveLength(5);
  });

  test('returns unique spectrums', () => {
    const s = pickSpectrums(10);
    const keys = s.map(sp => sp.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(10);
  });

  test('caps at total available spectrums', () => {
    const s = pickSpectrums(999);
    expect(s.length).toBeLessThanOrEqual(SPECTRUMS.length);
  });

  test('all spectrums have required language keys', () => {
    SPECTRUMS.forEach(sp => {
      ['de', 'en', 'fr', 'it', 'es'].forEach(lang => {
        expect(sp[`left_${lang}`]).toBeTruthy();
        expect(sp[`right_${lang}`]).toBeTruthy();
      });
    });
  });
});

// ── initGame ───────────────────────────────────────────────────────────────────
describe('initGame', () => {
  test('initializes with correct player count', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.players).toHaveLength(2);
    expect(state.numPlayers).toBe(2);
  });

  test('player names are set correctly', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
    expect(state.players[2].name).toBe('Charlie');
  });

  test('all players start with 0 score', () => {
    const state = initGame(['Alice', 'Bob']);
    state.players.forEach(p => expect(p.score).toBe(0));
  });

  test('totalRounds is numPlayers * 2', () => {
    expect(initGame(['A', 'B']).totalRounds).toBe(4);
    expect(initGame(['A', 'B', 'C']).totalRounds).toBe(6);
    expect(initGame(['A', 'B', 'C', 'D']).totalRounds).toBe(8);
  });

  test('starts at round 0 with clue phase', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.currentRound).toBe(0);
    expect(state.phase).toBe('clue');
    expect(state.clueGiverIndex).toBe(0);
  });

  test('has a valid spectrum and target position', () => {
    const state = initGame(['Alice', 'Bob']);
    expect(state.currentSpectrum).toBeTruthy();
    expect(state.targetPos).toBeGreaterThanOrEqual(15);
    expect(state.targetPos).toBeLessThanOrEqual(85);
  });
});

// ── submitClue ─────────────────────────────────────────────────────────────────
describe('submitClue', () => {
  test('sets clue and advances to guess phase', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = submitClue(state, 'Volcano');
    expect(next.currentClue).toBe('Volcano');
    expect(next.phase).toBe('guess');
  });

  test('trims whitespace from clue', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = submitClue(state, '  Ocean  ');
    expect(next.currentClue).toBe('Ocean');
  });

  test('ignores empty clue', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = submitClue(state, '');
    expect(next.phase).toBe('clue');
  });

  test('ignores whitespace-only clue', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = submitClue(state, '   ');
    expect(next.phase).toBe('clue');
  });
});

// ── submitGuess ────────────────────────────────────────────────────────────────
describe('submitGuess', () => {
  test('advances phase to reveal', () => {
    let state = initGame(['Alice', 'Bob']);
    state = submitClue(state, 'Fire');
    state = submitGuess(state, 70);
    expect(state.phase).toBe('reveal');
  });

  test('records guess position', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, targetPos: 50 };
    state = submitClue(state, 'Fire');
    state = submitGuess(state, 55);
    expect(state.guessPos).toBe(55);
  });

  test('adds score to clue giver player', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, targetPos: 50, clueGiverIndex: 0 };
    state = submitClue(state, 'Fire');
    state = submitGuess(state, 50); // exact match = 4 pts
    expect(state.players[0].score).toBe(4);
    expect(state.players[1].score).toBe(0);
  });

  test('logs round entry', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, targetPos: 50 };
    state = submitClue(state, 'Lava');
    state = submitGuess(state, 45);
    expect(state.roundScoreLog).toHaveLength(1);
    expect(state.roundScoreLog[0].clue).toBe('Lava');
    expect(state.roundScoreLog[0].targetPos).toBe(50);
    expect(state.roundScoreLog[0].guessPos).toBe(45);
  });
});

// ── nextRound ──────────────────────────────────────────────────────────────────
describe('nextRound', () => {
  test('increments current round', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = nextRound(state);
    expect(next.currentRound).toBe(1);
  });

  test('rotates clue giver', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    const r1 = nextRound(state);   // round 1 → giver 1
    const r2 = nextRound(r1);      // round 2 → giver 2
    const r3 = nextRound(r2);      // round 3 → giver 0 (wraps)
    expect(r1.clueGiverIndex).toBe(1);
    expect(r2.clueGiverIndex).toBe(2);
    expect(r3.clueGiverIndex).toBe(0);
  });

  test('resets phase to clue', () => {
    let state = initGame(['Alice', 'Bob']);
    state = { ...state, phase: 'reveal' };
    const next = nextRound(state);
    expect(next.phase).toBe('clue');
  });

  test('sets phase to done after last round', () => {
    let state = initGame(['Alice', 'Bob']); // 4 rounds
    state = { ...state, currentRound: 3 }; // at last round
    const next = nextRound(state);
    expect(next.phase).toBe('done');
  });

  test('changes spectrum on new round', () => {
    const state = initGame(['Alice', 'Bob']);
    const next = nextRound(state);
    // Both states have spectrums[0] and spectrums[1]
    expect(next.currentSpectrum).toEqual(state.spectrums[1]);
  });
});

// ── getWinners ─────────────────────────────────────────────────────────────────
describe('getWinners', () => {
  test('returns player with highest score', () => {
    const state = initGame(['Alice', 'Bob']);
    const modified = {
      ...state,
      players: [{ name: 'Alice', score: 10 }, { name: 'Bob', score: 6 }],
    };
    expect(getWinners(modified)).toEqual(['Alice']);
  });

  test('returns all tied players', () => {
    const state = initGame(['Alice', 'Bob', 'Charlie']);
    const modified = {
      ...state,
      players: [
        { name: 'Alice', score: 8 },
        { name: 'Bob', score: 8 },
        { name: 'Charlie', score: 5 },
      ],
    };
    expect(getWinners(modified)).toEqual(['Alice', 'Bob']);
  });
});
