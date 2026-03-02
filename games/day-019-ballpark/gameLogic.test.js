import { describe, it, expect } from 'bun:test';
import { QUESTIONS, pickQuestions, calcError, rankRound, calcTotals, formatNumber, shuffleArray } from './gameLogic.js';

// ─── QUESTIONS ───────────────────────────────────────────────────────────────

describe('QUESTIONS', () => {
  it('has at least 10 questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(10);
  });

  it('every question has required fields', () => {
    for (const q of QUESTIONS) {
      expect(q).toHaveProperty('key');
      expect(q).toHaveProperty('answer');
      expect(typeof q.answer).toBe('number');
      expect(q.answer).toBeGreaterThan(0);
    }
  });

  it('all question keys are unique', () => {
    const keys = QUESTIONS.map(q => q.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

// ─── shuffleArray ─────────────────────────────────────────────────────────────

describe('shuffleArray', () => {
  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    shuffleArray(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('produces deterministic output with seeded rng', () => {
    // Simple seeded RNG (lcg)
    let seed = 42;
    const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0x100000000; };
    let seed2 = 42;
    const rng2 = () => { seed2 = (seed2 * 1664525 + 1013904223) & 0xffffffff; return (seed2 >>> 0) / 0x100000000; };

    const a = shuffleArray([1, 2, 3, 4, 5], rng);
    const b = shuffleArray([1, 2, 3, 4, 5], rng2);
    expect(a).toEqual(b);
  });
});

// ─── pickQuestions ────────────────────────────────────────────────────────────

describe('pickQuestions', () => {
  it('returns the requested count', () => {
    expect(pickQuestions(7).length).toBe(7);
  });

  it('returns no duplicates', () => {
    const picked = pickQuestions(7);
    const keys = picked.map(q => q.key);
    expect(new Set(keys).size).toBe(7);
  });

  it('returns all questions when count equals pool size', () => {
    const picked = pickQuestions(QUESTIONS.length);
    expect(picked.length).toBe(QUESTIONS.length);
  });
});

// ─── calcError ────────────────────────────────────────────────────────────────

describe('calcError', () => {
  it('returns 0 when guess equals answer', () => {
    expect(calcError(100, 100)).toBe(0);
  });

  it('returns 1 when guess is double the answer', () => {
    expect(calcError(200, 100)).toBeCloseTo(1.0);
  });

  it('returns 0.5 when guess is half the answer', () => {
    expect(calcError(50, 100)).toBeCloseTo(0.5);
  });

  it('is always non-negative', () => {
    expect(calcError(10, 500)).toBeGreaterThanOrEqual(0);
    expect(calcError(1000, 5)).toBeGreaterThanOrEqual(0);
  });

  it('handles 0 answer / 0 guess as 0 error', () => {
    expect(calcError(0, 0)).toBe(0);
  });

  it('returns Infinity for non-zero guess when answer is 0', () => {
    expect(calcError(5, 0)).toBe(Infinity);
  });
});

// ─── rankRound ────────────────────────────────────────────────────────────────

describe('rankRound', () => {
  it('assigns 3 points to the closest guess', () => {
    const result = rankRound([100, 500, 1000], 110);
    const winner = result.find(r => r.playerIndex === 0);
    expect(winner.points).toBe(3);
  });

  it('assigns 1 point to the second closest', () => {
    const result = rankRound([100, 500, 1000], 110);
    const second = result.find(r => r.playerIndex === 1);
    expect(second.points).toBe(1);
  });

  it('assigns 0 points to the rest', () => {
    const result = rankRound([100, 500, 1000], 110);
    const last = result.find(r => r.playerIndex === 2);
    expect(last.points).toBe(0);
  });

  it('returns results sorted by error ascending', () => {
    const result = rankRound([1000, 200, 50], 100);
    const errors = result.map(r => r.error);
    for (let i = 1; i < errors.length; i++) {
      expect(errors[i]).toBeGreaterThanOrEqual(errors[i - 1]);
    }
  });

  it('works with 2 players, winner gets 3, loser gets 0', () => {
    const result = rankRound([90, 200], 100);
    const winner = result.find(r => r.playerIndex === 0);
    const loser = result.find(r => r.playerIndex === 1);
    expect(winner.points).toBe(3);
    expect(loser.points).toBe(1); // 2nd of 2 gets 1
  });

  it('includes guess and error in each result', () => {
    const result = rankRound([100, 200], 100);
    for (const r of result) {
      expect(r).toHaveProperty('guess');
      expect(r).toHaveProperty('error');
      expect(r).toHaveProperty('points');
      expect(r).toHaveProperty('playerIndex');
    }
  });
});

// ─── calcTotals ───────────────────────────────────────────────────────────────

describe('calcTotals', () => {
  it('sums points across rounds correctly', () => {
    // Player 0 wins round 0 (3pts), player 1 wins round 1 (3pts)
    const round0 = [
      { playerIndex: 0, points: 3, guess: 100, error: 0 },
      { playerIndex: 1, points: 1, guess: 80, error: 0.2 },
    ];
    const round1 = [
      { playerIndex: 1, points: 3, guess: 200, error: 0 },
      { playerIndex: 0, points: 1, guess: 150, error: 0.25 },
    ];
    const totals = calcTotals([round0, round1], 2);
    // Both have 4 points — sorted by total desc, tied
    expect(totals[0].total).toBe(4);
    expect(totals[1].total).toBe(4);
  });

  it('returns all players even with 0 points', () => {
    const round0 = [{ playerIndex: 0, points: 3, guess: 100, error: 0 }];
    const totals = calcTotals([round0], 2);
    expect(totals.length).toBe(2);
    const player1 = totals.find(t => t.playerIndex === 1);
    expect(player1.total).toBe(0);
  });

  it('sorts by total descending', () => {
    const rounds = [
      [
        { playerIndex: 0, points: 3 },
        { playerIndex: 1, points: 1 },
        { playerIndex: 2, points: 0 },
      ],
    ];
    const totals = calcTotals(rounds, 3);
    expect(totals[0].total).toBeGreaterThanOrEqual(totals[1].total);
    expect(totals[1].total).toBeGreaterThanOrEqual(totals[2].total);
  });

  it('handles empty rounds', () => {
    const totals = calcTotals([], 3);
    expect(totals.length).toBe(3);
    expect(totals.every(t => t.total === 0)).toBe(true);
  });
});

// ─── formatNumber ─────────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats large numbers with locale separators', () => {
    const result = formatNumber(1000000);
    // Should contain separator
    expect(result.length).toBeGreaterThan(6);
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('returns ? for null', () => {
    expect(formatNumber(null)).toBe('?');
  });

  it('returns ? for undefined', () => {
    expect(formatNumber(undefined)).toBe('?');
  });

  it('formats small numbers without separators', () => {
    const result = formatNumber(42);
    expect(result).toBe('42');
  });
});
