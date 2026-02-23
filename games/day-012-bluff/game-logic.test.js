// TDD tests for Bluff! card game logic
import { describe, it, expect } from 'bun:test';
import {
  createDeck,
  shuffleDeck,
  dealCards,
  resolveChallenge,
  isHandEmpty,
  nextClaimValue,
  canChallengePlay,
} from './game-logic.js';

describe('createDeck', () => {
  it('creates a deck with correct number of cards', () => {
    const deck = createDeck(8, 4);
    expect(deck.length).toBe(32); // 8 values × 4 copies
  });

  it('contains all values with correct frequency', () => {
    const deck = createDeck(6, 3);
    expect(deck.length).toBe(18);
    for (let v = 1; v <= 6; v++) {
      expect(deck.filter(c => c === v).length).toBe(3);
    }
  });

  it('defaults to 8 values, 4 copies', () => {
    const deck = createDeck();
    expect(deck.length).toBe(32);
  });
});

describe('shuffleDeck', () => {
  it('returns a deck of the same length', () => {
    const deck = createDeck(8, 4);
    const shuffled = shuffleDeck(deck);
    expect(shuffled.length).toBe(deck.length);
  });

  it('contains the same elements after shuffle', () => {
    const deck = createDeck(8, 4);
    const shuffled = shuffleDeck([...deck]);
    expect(shuffled.sort()).toEqual(deck.sort());
  });

  it('does not mutate the original array', () => {
    const deck = [1, 2, 3, 4];
    const original = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(original);
  });
});

describe('dealCards', () => {
  it('deals cards evenly for 2 players', () => {
    const deck = createDeck(8, 4); // 32 cards
    const hands = dealCards(deck, 2);
    expect(hands.length).toBe(2);
    expect(hands[0].length).toBe(16);
    expect(hands[1].length).toBe(16);
  });

  it('deals cards evenly for 4 players', () => {
    const deck = createDeck(8, 4); // 32 cards
    const hands = dealCards(deck, 4);
    expect(hands.length).toBe(4);
    hands.forEach(hand => expect(hand.length).toBe(8));
  });

  it('all cards are distributed — none left over', () => {
    const deck = createDeck(8, 4);
    const hands = dealCards(deck, 2);
    const total = hands.reduce((sum, h) => sum + h.length, 0);
    expect(total).toBe(deck.length);
  });

  it('each player gets different cards (no duplicates beyond allowed)', () => {
    const deck = createDeck(8, 4);
    const hands = dealCards(deck, 2);
    const combined = [...hands[0], ...hands[1]];
    expect(combined.sort()).toEqual(deck.slice().sort());
  });
});

describe('resolveChallenge', () => {
  it('returns success=false when all played cards match claim (honest play)', () => {
    // Challenger loses — honest player wins
    const result = resolveChallenge([3, 3, 3], 3);
    expect(result.bluffCaught).toBe(false);
  });

  it('returns bluffCaught=true when any card does not match claim', () => {
    const result = resolveChallenge([3, 3, 5], 3);
    expect(result.bluffCaught).toBe(true);
  });

  it('returns bluffCaught=true for completely wrong cards', () => {
    const result = resolveChallenge([7, 8, 1], 4);
    expect(result.bluffCaught).toBe(true);
  });

  it('returns bluffCaught=false for single honest card', () => {
    const result = resolveChallenge([6], 6);
    expect(result.bluffCaught).toBe(false);
  });

  it('includes the played cards in the result', () => {
    const cards = [2, 2];
    const result = resolveChallenge(cards, 2);
    expect(result.revealedCards).toEqual(cards);
  });
});

describe('isHandEmpty', () => {
  it('returns true for empty hand', () => {
    expect(isHandEmpty([])).toBe(true);
  });

  it('returns false for non-empty hand', () => {
    expect(isHandEmpty([1, 2, 3])).toBe(false);
  });

  it('returns false for hand with one card', () => {
    expect(isHandEmpty([5])).toBe(false);
  });
});

describe('nextClaimValue', () => {
  it('increments value by 1', () => {
    expect(nextClaimValue(3, 8)).toBe(4);
  });

  it('wraps from max back to 1', () => {
    expect(nextClaimValue(8, 8)).toBe(1);
  });

  it('works with custom max', () => {
    expect(nextClaimValue(6, 6)).toBe(1);
    expect(nextClaimValue(5, 6)).toBe(6);
  });
});

describe('canChallengePlay', () => {
  it('returns false on the very first play (no pile yet)', () => {
    expect(canChallengePlay(null)).toBe(false);
  });

  it('returns true when there is a pile to challenge', () => {
    expect(canChallengePlay({ cards: [3], claimed: 3, playerIndex: 0 })).toBe(true);
  });

  it('returns false for empty play object', () => {
    expect(canChallengePlay({ cards: [], claimed: null, playerIndex: 0 })).toBe(false);
  });
});
