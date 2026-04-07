/**
 * TDD Tests for Volt Rush
 * Run: bun test game.test.js
 *
 * [TESTABILITY ANALYSIS]
 * Pure logic module: createGameState, recordAttempt, computeScore,
 * nextRound, isGameOver, getWinner, generateZone.
 * All functions are deterministic given fixed input. No external deps.
 */

import { describe, test, expect } from 'bun:test';
import {
  createGameState,
  generateZone,
  computeScore,
  recordAttempt,
  nextRound,
  isGameOver,
  getWinner,
  TOTAL_ROUNDS,
  ZONE_TYPES,
} from './game-logic.js';

// ─── ZONE_TYPES ───────────────────────────────────────────────────────────────

describe('ZONE_TYPES', () => {
  test('has at least 3 zone types', () => {
    expect(ZONE_TYPES.length).toBeGreaterThanOrEqual(3);
  });

  test('each zone type has points, width, and label', () => {
    for (const z of ZONE_TYPES) {
      expect(typeof z.points).toBe('number');
      expect(typeof z.width).toBe('number');
      expect(typeof z.label).toBe('string');
      expect(z.width).toBeGreaterThan(0);
      expect(z.width).toBeLessThanOrEqual(1);
      expect(z.points).toBeGreaterThan(0);
    }
  });

  test('higher points zones are narrower', () => {
    const sorted = [...ZONE_TYPES].sort((a, b) => a.points - b.points);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].width).toBeGreaterThanOrEqual(sorted[i + 1].width);
    }
  });
});

// ─── generateZone ─────────────────────────────────────────────────────────────

describe('generateZone', () => {
  test('returns a zone with center and type', () => {
    const zone = generateZone(0);
    expect(typeof zone.center).toBe('number');
    expect(zone.center).toBeGreaterThanOrEqual(0);
    expect(zone.center).toBeLessThanOrEqual(1);
    expect(zone.type).toBeDefined();
    expect(ZONE_TYPES.some(z => z.label === zone.type.label)).toBe(true);
  });

  test('zone center leaves room for zone width (fits within 0..1)', () => {
    for (let i = 0; i < 10; i++) {
      const zone = generateZone(i);
      const half = zone.type.width / 2;
      expect(zone.center - half).toBeGreaterThanOrEqual(0);
      expect(zone.center + half).toBeLessThanOrEqual(1);
    }
  });
});

// ─── computeScore ─────────────────────────────────────────────────────────────

describe('computeScore', () => {
  test('exact center hit returns full points', () => {
    const zone = { center: 0.5, type: { points: 100, width: 0.2 } };
    expect(computeScore(0.5, zone)).toBe(100);
  });

  test('hit within zone returns full points', () => {
    const zone = { center: 0.5, type: { points: 100, width: 0.2 } };
    // zone spans 0.4 - 0.6
    expect(computeScore(0.41, zone)).toBe(100);
    expect(computeScore(0.59, zone)).toBe(100);
  });

  test('miss outside zone returns 0', () => {
    const zone = { center: 0.5, type: { points: 100, width: 0.2 } };
    expect(computeScore(0.2, zone)).toBe(0);
    expect(computeScore(0.8, zone)).toBe(0);
  });

  test('edge of zone (exactly on boundary) returns full points', () => {
    const zone = { center: 0.5, type: { points: 50, width: 0.2 } };
    // boundary is at 0.4 and 0.6
    expect(computeScore(0.4, zone)).toBe(50);
    expect(computeScore(0.6, zone)).toBe(50);
  });
});

// ─── createGameState ──────────────────────────────────────────────────────────

describe('createGameState', () => {
  test('creates state with 2 players', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.players.length).toBe(2);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
  });

  test('all players start with score 0', () => {
    const state = createGameState(['Alice', 'Bob', 'Charlie']);
    state.players.forEach(p => expect(p.score).toBe(0));
  });

  test('phase starts as setup', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.phase).toBe('setup');
  });

  test('round starts at 1', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.round).toBe(1);
  });

  test('activePlayerIndex starts at 0', () => {
    const state = createGameState(['Alice', 'Bob']);
    expect(state.activePlayerIndex).toBe(0);
  });

  test('supports 2-4 players', () => {
    expect(() => createGameState(['A', 'B'])).not.toThrow();
    expect(() => createGameState(['A', 'B', 'C'])).not.toThrow();
    expect(() => createGameState(['A', 'B', 'C', 'D'])).not.toThrow();
  });
});

// ─── recordAttempt ────────────────────────────────────────────────────────────

describe('recordAttempt', () => {
  const makeState = () => {
    const s = createGameState(['Alice', 'Bob']);
    s.phase = 'playing';
    s.currentZone = { center: 0.5, type: { points: 100, width: 0.2 } };
    return s;
  };

  test('hit: adds points to active player score', () => {
    const state = makeState();
    const next = recordAttempt(state, 0.5);
    expect(next.players[0].score).toBe(100);
  });

  test('miss: adds 0 points, score unchanged', () => {
    const state = makeState();
    const next = recordAttempt(state, 0.01);
    expect(next.players[0].score).toBe(0);
  });

  test('records the hit position', () => {
    const state = makeState();
    const next = recordAttempt(state, 0.5);
    expect(next.lastHitPos).toBe(0.5);
  });

  test('records whether it was a hit', () => {
    const state = makeState();
    const hitState = recordAttempt(state, 0.5);
    const missState = recordAttempt(state, 0.01);
    expect(hitState.lastWasHit).toBe(true);
    expect(missState.lastWasHit).toBe(false);
  });

  test('phase changes to pass-device after attempt', () => {
    const state = makeState();
    const next = recordAttempt(state, 0.5);
    expect(next.phase).toBe('pass-device');
  });

  test('does not modify original state (immutable)', () => {
    const state = makeState();
    const origScore = state.players[0].score;
    recordAttempt(state, 0.5);
    expect(state.players[0].score).toBe(origScore);
  });
});

// ─── nextRound ────────────────────────────────────────────────────────────────

describe('nextRound', () => {
  const makePPState = () => {
    const s = createGameState(['Alice', 'Bob']);
    s.phase = 'pass-device';
    s.round = 1;
    s.activePlayerIndex = 0;
    return s;
  };

  test('advances to next player when not all played this round', () => {
    const state = makePPState();
    const next = nextRound(state);
    expect(next.activePlayerIndex).toBe(1);
  });

  test('increments round when all players have played', () => {
    const state = makePPState();
    state.activePlayerIndex = 1; // last player
    const next = nextRound(state);
    expect(next.round).toBe(2);
    expect(next.activePlayerIndex).toBe(0);
  });

  test('phase returns to playing', () => {
    const state = makePPState();
    const next = nextRound(state);
    expect(next.phase).toBe('playing');
  });

  test('generates a new zone for next player', () => {
    const state = makePPState();
    const next = nextRound(state);
    expect(next.currentZone).toBeDefined();
    expect(next.currentZone.center).toBeGreaterThanOrEqual(0);
  });
});

// ─── isGameOver ───────────────────────────────────────────────────────────────

describe('isGameOver', () => {
  test('not over in early rounds', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.round = 1;
    state.activePlayerIndex = 0;
    expect(isGameOver(state)).toBe(false);
  });

  test('game over when last round completed for all players', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.round = TOTAL_ROUNDS;
    state.activePlayerIndex = 1; // last player just went
    state.phase = 'pass-device';
    expect(isGameOver(state)).toBe(true);
  });

  test('not over on last round if not all players have gone', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.round = TOTAL_ROUNDS;
    state.activePlayerIndex = 0;
    state.phase = 'pass-device';
    expect(isGameOver(state)).toBe(false);
  });
});

// ─── getWinner ────────────────────────────────────────────────────────────────

describe('getWinner', () => {
  test('returns player with highest score', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players[0].score = 300;
    state.players[1].score = 450;
    expect(getWinner(state).name).toBe('Bob');
  });

  test('returns first player if tied', () => {
    const state = createGameState(['Alice', 'Bob']);
    state.players[0].score = 200;
    state.players[1].score = 200;
    const winner = getWinner(state);
    expect(winner.name).toBe('Alice');
  });

  test('works with 4 players', () => {
    const state = createGameState(['A', 'B', 'C', 'D']);
    state.players[0].score = 100;
    state.players[1].score = 200;
    state.players[2].score = 350;
    state.players[3].score = 150;
    expect(getWinner(state).name).toBe('C');
  });
});
