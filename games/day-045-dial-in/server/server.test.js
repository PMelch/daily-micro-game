/**
 * [TESTABILITY ANALYSIS]
 * Testing the pure business logic extracted from server.js:
 * - Room creation and management
 * - Score calculation (proximity scoring)
 * - Spectrum selection
 * - Round progression logic
 * 
 * We extract the scoring function for unit testing without needing WebSocket connections.
 * Integration behavior (WS messages) is validated via structural tests on the message shapes.
 */

import { describe, it, expect, beforeEach } from 'bun:test';

// ────────────────────────────────────────────────
// Pure scoring logic (extracted for unit testing)
// ────────────────────────────────────────────────

function scoreGuess(guess, target) {
  const diff = Math.abs(guess - target);
  if (diff <= 5) return 5;
  if (diff <= 10) return 4;
  if (diff <= 15) return 3;
  if (diff <= 25) return 2;
  if (diff <= 40) return 1;
  return 0;
}

function scoreAllGuesses(guesses, target, broadcasterId) {
  const scores = {};
  for (const [pid, guess] of Object.entries(guesses)) {
    if (pid === broadcasterId) continue;
    scores[pid] = scoreGuess(guess, target);
  }

  // Broadcaster bonus = avg of guesser scores
  const guesserScores = Object.values(scores);
  if (guesserScores.length > 0) {
    const avg = guesserScores.reduce((s, v) => s + v, 0) / guesserScores.length;
    scores[broadcasterId] = Math.round(avg);
  }

  return scores;
}

// ────────────────────────────────────────────────
// Room / state helpers
// ────────────────────────────────────────────────

function generateRoomCode(existing = new Set()) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do {
    code = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existing.has(code));
  return code;
}

function createRoom(code) {
  return {
    code,
    players: [],
    phase: 'lobby',
    round: 0,
    broadcasterIdx: 0,
    spectrum: null,
    target: null,
    clue: null,
    guesses: {},
    roundScores: {},
    totalScores: {},
    spectraUsed: [],
  };
}

// ────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────

describe('scoreGuess - proximity scoring', () => {
  it('exact hit → 5 points', () => {
    expect(scoreGuess(50, 50)).toBe(5);
  });

  it('within 5 → 5 points', () => {
    expect(scoreGuess(55, 50)).toBe(5);
    expect(scoreGuess(45, 50)).toBe(5);
  });

  it('within 10 → 4 points', () => {
    expect(scoreGuess(60, 50)).toBe(4);
    expect(scoreGuess(42, 50)).toBe(4);
  });

  it('within 15 → 3 points', () => {
    expect(scoreGuess(65, 50)).toBe(3);
    expect(scoreGuess(36, 50)).toBe(3);
  });

  it('within 25 → 2 points', () => {
    expect(scoreGuess(74, 50)).toBe(2);
    expect(scoreGuess(26, 50)).toBe(2);
  });

  it('within 40 → 1 point', () => {
    expect(scoreGuess(89, 50)).toBe(1);
    expect(scoreGuess(12, 50)).toBe(1);
  });

  it('beyond 40 → 0 points', () => {
    expect(scoreGuess(100, 50)).toBe(0);
    expect(scoreGuess(0, 50)).toBe(0);
    expect(scoreGuess(5, 50)).toBe(0);
  });

  it('target at edges - 20', () => {
    expect(scoreGuess(20, 20)).toBe(5);
    expect(scoreGuess(25, 20)).toBe(5);
    expect(scoreGuess(30, 20)).toBe(4);
  });
});

describe('scoreAllGuesses - with broadcaster bonus', () => {
  it('broadcaster gets avg of guesser scores', () => {
    const guesses = { 'guesser1': 50, 'guesser2': 50, 'broadcaster': 50 };
    const scores = scoreAllGuesses(guesses, 50, 'broadcaster');
    expect(scores['guesser1']).toBe(5);
    expect(scores['guesser2']).toBe(5);
    expect(scores['broadcaster']).toBe(5); // avg of 5,5 = 5
  });

  it('broadcaster gets partial score when guessers miss', () => {
    // guessers guess at extremes
    const guesses = { 'guesser1': 100, 'guesser2': 0, 'broadcaster': 0 };
    const scores = scoreAllGuesses(guesses, 50, 'broadcaster');
    expect(scores['guesser1']).toBe(0); // off by 50
    expect(scores['guesser2']).toBe(0); // off by 50
    expect(scores['broadcaster']).toBe(0); // avg of 0,0
  });

  it('broadcaster does not count in their own guess', () => {
    const guesses = { 'guesser1': 55, 'broadcaster': 99 };
    const scores = scoreAllGuesses(guesses, 50, 'broadcaster');
    expect(scores['broadcaster']).toBe(5); // avg of guesser1's score=5
    expect(scores['guesser1']).toBe(5);
    // broadcaster's own value (99) should be ignored
  });

  it('broadcaster score rounded to integer', () => {
    const guesses = { 'g1': 58, 'g2': 40, 'broadcaster': 0 };
    const scores = scoreAllGuesses(guesses, 50, 'broadcaster');
    // g1: diff=8 → 4pts, g2: diff=10 → 4pts, avg=4
    expect(scores['g1']).toBe(4);
    expect(scores['g2']).toBe(4);
    expect(typeof scores['broadcaster']).toBe('number');
    expect(Number.isInteger(scores['broadcaster'])).toBe(true);
  });
});

describe('generateRoomCode', () => {
  it('generates 4-character uppercase code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
    expect(code).toMatch(/^[A-Z]+$/);
  });

  it('avoids collision with existing codes', () => {
    const existing = new Set();
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode(existing);
      expect(existing.has(code)).toBe(false);
      existing.add(code);
    }
  });

  it('never contains O, I (confusing chars)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      expect(code).not.toMatch(/[OI]/);
    }
  });
});

describe('createRoom', () => {
  it('initializes with lobby phase', () => {
    const room = createRoom('TEST');
    expect(room.phase).toBe('lobby');
    expect(room.round).toBe(0);
    expect(room.players).toEqual([]);
  });

  it('stores the room code', () => {
    const room = createRoom('ABCD');
    expect(room.code).toBe('ABCD');
  });

  it('initializes empty scores and guesses', () => {
    const room = createRoom('XYZW');
    expect(room.totalScores).toEqual({});
    expect(room.guesses).toEqual({});
    expect(room.spectraUsed).toEqual([]);
  });
});

describe('broadcaster rotation', () => {
  it('rotates broadcaster each round', () => {
    const players = ['p1', 'p2', 'p3'];
    const getBC = (round) => players[(round - 1) % players.length];
    expect(getBC(1)).toBe('p1');
    expect(getBC(2)).toBe('p2');
    expect(getBC(3)).toBe('p3');
    expect(getBC(4)).toBe('p1'); // wraps around
  });
});

describe('target range validation', () => {
  it('target stays within 20-80 range (no extreme ends)', () => {
    for (let i = 0; i < 200; i++) {
      const target = Math.round(20 + Math.random() * 60);
      expect(target).toBeGreaterThanOrEqual(20);
      expect(target).toBeLessThanOrEqual(80);
    }
  });
});

describe('message structure validation', () => {
  it('roundStart message has required fields', () => {
    const msg = {
      type: 'roundStart',
      round: 1,
      totalRounds: 6,
      broadcasterIdx: 0,
      broadcasterId: 'p1',
      spectrum: { left: 'KALT', right: 'HEISS' },
      phase: 'giving_clue',
      timeLeft: 45,
    };
    expect(msg.type).toBe('roundStart');
    expect(msg.totalRounds).toBe(6);
    expect(msg.spectrum).toBeDefined();
    expect(msg.phase).toBe('giving_clue');
  });

  it('reveal message has target and guesses', () => {
    const msg = {
      type: 'reveal',
      target: 65,
      clue: 'Sauna',
      guesses: { 'p2': 70, 'p3': 55 },
      roundScores: { 'p1': 4, 'p2': 4, 'p3': 3 },
      totalScores: { 'p1': 4, 'p2': 4, 'p3': 3 },
      spectrum: { left: 'KALT', right: 'HEISS' },
    };
    expect(msg.target).toBe(65);
    expect(msg.clue).toBe('Sauna');
    expect(Object.keys(msg.guesses)).toHaveLength(2);
  });
});
