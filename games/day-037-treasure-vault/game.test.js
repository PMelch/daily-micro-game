import { describe, it, expect } from 'bun:test';

// Core game logic functions we'll build
import {
  resolveAuction,
  generateTreasures,
  canBid,
  calculateFinalScores,
  getLeader
} from './game-logic.js';

describe('resolveAuction', () => {
  it('single winner with unique highest bid wins treasure', () => {
    const result = resolveAuction([5, 3], 8);
    expect(result.winnerIdx).toBe(0);
    expect(result.paid).toBe(5);
    expect(result.tie).toBe(false);
  });

  it('unique bid beats higher tied bids', () => {
    // p0=5, p1=5, p2=3 → p2 has highest UNIQUE bid
    const result = resolveAuction([5, 5, 3], 10);
    // 5 is tied, so effective highest unique is 3 → p2 wins
    expect(result.winnerIdx).toBe(2);
    expect(result.paid).toBe(3);
    expect(result.tie).toBe(false);
  });

  it('all bids tied → no winner, tokens refunded', () => {
    const result = resolveAuction([4, 4], 7);
    expect(result.winnerIdx).toBe(-1);
    expect(result.paid).toBe(0);
    expect(result.tie).toBe(true);
  });

  it('bid of 0 (pass) never wins', () => {
    const result = resolveAuction([0, 3], 7);
    expect(result.winnerIdx).toBe(1);
    expect(result.paid).toBe(3);
  });

  it('all pass → no winner', () => {
    const result = resolveAuction([0, 0, 0], 5);
    expect(result.winnerIdx).toBe(-1);
    expect(result.tie).toBe(true);
  });
});

describe('generateTreasures', () => {
  it('returns exactly 8 treasures', () => {
    const t = generateTreasures(42);
    expect(t.length).toBe(8);
  });

  it('each treasure has id, value, emoji, type', () => {
    const t = generateTreasures(42);
    for (const item of t) {
      expect(typeof item.id).toBe('number');
      expect(typeof item.value).toBe('number');
      expect(item.value).toBeGreaterThanOrEqual(1);
      expect(item.value).toBeLessThanOrEqual(12);
      expect(typeof item.emoji).toBe('string');
    }
  });

  it('total treasure value is always between 40 and 65', () => {
    const t = generateTreasures(42);
    const total = t.reduce((s, item) => s + item.value, 0);
    expect(total).toBeGreaterThanOrEqual(40);
    expect(total).toBeLessThanOrEqual(65);
  });
});

describe('canBid', () => {
  it('allows bid within token budget', () => {
    expect(canBid(10, 7)).toBe(true);
    expect(canBid(10, 10)).toBe(true);
    expect(canBid(10, 0)).toBe(true);
  });

  it('rejects bid exceeding tokens', () => {
    expect(canBid(5, 6)).toBe(false);
    expect(canBid(0, 1)).toBe(false);
  });

  it('rejects negative bids', () => {
    expect(canBid(10, -1)).toBe(false);
  });
});

describe('calculateFinalScores', () => {
  it('score = treasure values + remaining tokens', () => {
    // Alice: 5+3 treasure + 3 remaining = 11 total
    // Bob: 4 treasure + 12 remaining = 16 total → Bob wins
    const players = [
      { name: 'Alice', tokens: 3, treasuresWon: [{ value: 5 }, { value: 3 }], tokensSpent: 12 },
      { name: 'Bob', tokens: 12, treasuresWon: [{ value: 4 }], tokensSpent: 3 }
    ];
    const scores = calculateFinalScores(players);
    expect(scores[0].name).toBe('Bob');  // Bob wins (16 > 11)
    expect(scores[1].name).toBe('Alice');
    expect(scores[0].score).toBe(16);
    expect(scores[1].score).toBe(11);
  });

  it('remaining tokens count toward final score', () => {
    const players = [
      { name: 'A', tokens: 5, treasuresWon: [], tokensSpent: 10 },
      { name: 'B', tokens: 15, treasuresWon: [], tokensSpent: 0 }
    ];
    const scores = calculateFinalScores(players);
    expect(scores[0].name).toBe('B');
  });
});

describe('getLeader', () => {
  it('returns player with most treasure value so far', () => {
    const players = [
      { name: 'A', treasuresWon: [{ value: 3 }, { value: 2 }] },
      { name: 'B', treasuresWon: [{ value: 6 }] }
    ];
    expect(getLeader(players)).toBe('B');
  });

  it('returns null when no treasures won yet', () => {
    const players = [
      { name: 'A', treasuresWon: [] },
      { name: 'B', treasuresWon: [] }
    ];
    expect(getLeader(players)).toBeNull();
  });
});
