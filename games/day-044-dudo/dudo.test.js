// TDD tests for Dudo (Liar's Dice) game logic
// Run with: bun test

import { expect, test, describe, beforeEach } from "bun:test";
import {
  rollDice,
  isValidBid,
  resolveDudo,
  countFace,
  calcNextMinBid,
  isWildFace,
  countFaceWithWilds,
} from "./dudo-logic.js";

// ── rollDice ──────────────────────────────────────────────────────────────────
describe("rollDice", () => {
  test("returns array of correct length", () => {
    expect(rollDice(5)).toHaveLength(5);
    expect(rollDice(1)).toHaveLength(1);
    expect(rollDice(0)).toHaveLength(0);
  });

  test("all values are 1-6", () => {
    const dice = rollDice(20);
    dice.forEach(d => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
  });
});

// ── countFace ─────────────────────────────────────────────────────────────────
describe("countFace", () => {
  test("counts exact face", () => {
    expect(countFace([[3, 3, 3, 1, 2], [3, 5, 6, 2, 3]], 3)).toBe(5);
  });

  test("returns 0 when no match", () => {
    expect(countFace([[1, 2, 4, 5, 6], [2, 4, 5, 6, 1]], 3)).toBe(0);
  });
});

// ── countFaceWithWilds (1s = jokers) ──────────────────────────────────────────
describe("countFaceWithWilds", () => {
  test("counts face + wilds (1s) unless bidding on 1s", () => {
    // 1s are wild for non-1 bids
    const cups = [[1, 3, 1, 5, 3]]; // face 3: 2 threes + 2 wilds = 4
    expect(countFaceWithWilds(cups, 3)).toBe(4);
  });

  test("when bidding on 1s, no wilds", () => {
    const cups = [[1, 1, 3, 5, 3]]; // face 1: just 2 ones
    expect(countFaceWithWilds(cups, 1)).toBe(2);
  });

  test("returns correct total across multiple cups", () => {
    const cups = [[1, 2, 3, 4, 5], [1, 1, 3, 3, 6]];
    // face 3: 1+0 wilds + 1+2 = cup1: 1(wild)+1(face)=2, cup2: 2(wilds)+2(face)=4 → total 6
    expect(countFaceWithWilds(cups, 3)).toBe(6);
  });
});

// ── isValidBid ────────────────────────────────────────────────────────────────
describe("isValidBid", () => {
  test("any bid valid when no previous bid", () => {
    expect(isValidBid({ quantity: 1, face: 1 }, null, 10)).toBe(true);
    expect(isValidBid({ quantity: 5, face: 6 }, null, 10)).toBe(true);
  });

  test("higher quantity same face is valid", () => {
    const prev = { quantity: 3, face: 4 };
    expect(isValidBid({ quantity: 4, face: 4 }, prev, 10)).toBe(true);
  });

  test("same quantity higher face is valid", () => {
    const prev = { quantity: 3, face: 4 };
    expect(isValidBid({ quantity: 3, face: 5 }, prev, 10)).toBe(true);
  });

  test("same or lower quantity same face is invalid", () => {
    const prev = { quantity: 3, face: 4 };
    expect(isValidBid({ quantity: 3, face: 4 }, prev, 10)).toBe(false);
    expect(isValidBid({ quantity: 2, face: 4 }, prev, 10)).toBe(false);
  });

  test("lower quantity lower face is invalid", () => {
    const prev = { quantity: 3, face: 4 };
    expect(isValidBid({ quantity: 2, face: 3 }, prev, 10)).toBe(false);
  });

  test("quantity must be at least 1", () => {
    expect(isValidBid({ quantity: 0, face: 3 }, null, 10)).toBe(false);
  });

  test("quantity cannot exceed total dice", () => {
    expect(isValidBid({ quantity: 11, face: 3 }, null, 10)).toBe(false);
  });

  test("face must be 1-6", () => {
    expect(isValidBid({ quantity: 1, face: 0 }, null, 10)).toBe(false);
    expect(isValidBid({ quantity: 1, face: 7 }, null, 10)).toBe(false);
  });
});

// ── resolveDudo ───────────────────────────────────────────────────────────────
describe("resolveDudo", () => {
  test("challenger wins when bid is too high", () => {
    // actual count of face 4 (with wilds) < bid quantity → bidder loses
    const cups = [[2, 2, 2, 2, 2], [2, 2, 2, 2, 2]]; // 0 fours total
    const bid = { quantity: 3, face: 4 };
    const result = resolveDudo(cups, bid, 0, 1); // player 0 bid, player 1 challenges
    expect(result.loser).toBe(0); // bidder loses
    expect(result.actualCount).toBe(0);
    expect(result.bidSurvived).toBe(false);
  });

  test("challenger loses when bid is accurate or low", () => {
    const cups = [[4, 4, 4, 4, 4], [4, 4, 4, 4, 4]]; // 10 fours
    const bid = { quantity: 5, face: 4 };
    const result = resolveDudo(cups, bid, 0, 1);
    expect(result.loser).toBe(1); // challenger loses
    expect(result.actualCount).toBe(10);
    expect(result.bidSurvived).toBe(true);
  });

  test("exact count: bidder wins (challenger loses)", () => {
    const cups = [[3, 3, 3, 1, 2]]; // exactly 3 threes + 0 wilds but wilds=1s
    // only 1 cup so 1s are wild: count 3s + wilds(1s)
    // dice: 3,3,3,1,2 → 3 threes + 1 wild = 4
    // let's use a non-wild scenario: bid on 1s
    const cups2 = [[1, 1, 3, 5, 6]]; // 2 ones (no wilds when bidding 1s)
    const bid2 = { quantity: 2, face: 1 };
    const result = resolveDudo(cups2, bid2, 0, 1);
    expect(result.loser).toBe(1); // exact match → challenger loses
  });
});

// ── calcNextMinBid ────────────────────────────────────────────────────────────
describe("calcNextMinBid", () => {
  test("returns null when no prev bid", () => {
    expect(calcNextMinBid(null)).toEqual({ quantity: 1, face: 1 });
  });

  test("minimum valid next bid increments face", () => {
    const next = calcNextMinBid({ quantity: 3, face: 4 });
    expect(isValidBid(next, { quantity: 3, face: 4 }, 20)).toBe(true);
  });

  test("when at face 6, increments quantity", () => {
    const next = calcNextMinBid({ quantity: 3, face: 6 });
    expect(next.quantity).toBe(4);
    expect(next.face).toBe(1);
  });
});
