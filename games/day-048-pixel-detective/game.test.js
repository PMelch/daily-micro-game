// TDD: Pixel Detective game logic tests
// Run with: bun test

import { describe, test, expect } from "bun:test";

// --- Game Logic Module ---
// We'll import from game-logic.js once created

import {
  getScore,
  nextRound,
  createGameState,
  pickAnswer,
  getPixelationLevel,
  TOTAL_ROUNDS,
  MAX_SCORE_PER_ROUND,
} from "./game-logic.js";

describe("Constants", () => {
  test("TOTAL_ROUNDS is 5", () => {
    expect(TOTAL_ROUNDS).toBe(5);
  });

  test("MAX_SCORE_PER_ROUND is 100", () => {
    expect(MAX_SCORE_PER_ROUND).toBe(100);
  });
});

describe("createGameState", () => {
  test("creates initial game state", () => {
    const state = createGameState();
    expect(state.round).toBe(0);
    expect(state.totalScore).toBe(0);
    expect(state.answers).toEqual([]);
    expect(state.gameOver).toBe(false);
  });
});

describe("getPixelationLevel", () => {
  test("returns max pixelation at t=0", () => {
    // t is elapsed time in ms, duration is 10000ms
    const level = getPixelationLevel(0, 10000);
    expect(level).toBe(32); // max block size = 32px (very blurry)
  });

  test("returns min pixelation at t=duration", () => {
    const level = getPixelationLevel(10000, 10000);
    expect(level).toBe(1); // min = 1px = fully clear
  });

  test("returns intermediate value at half time", () => {
    const level = getPixelationLevel(5000, 10000);
    expect(level).toBeGreaterThan(1);
    expect(level).toBeLessThan(32);
  });

  test("clamps t above duration", () => {
    const level = getPixelationLevel(15000, 10000);
    expect(level).toBe(1);
  });

  test("clamps t below 0", () => {
    const level = getPixelationLevel(-100, 10000);
    expect(level).toBe(32);
  });
});

describe("getScore", () => {
  test("returns max score when answered immediately (t=0)", () => {
    const score = getScore(0, 10000);
    expect(score).toBe(100);
  });

  test("returns 10 minimum when answered at end (t=duration)", () => {
    const score = getScore(10000, 10000);
    expect(score).toBe(10);
  });

  test("returns 0 for wrong answer", () => {
    const score = getScore(2000, 10000, false);
    expect(score).toBe(0);
  });

  test("returns proportional score in middle", () => {
    const score = getScore(5000, 10000);
    expect(score).toBeGreaterThan(10);
    expect(score).toBeLessThanOrEqual(100);
  });

  test("score is always integer", () => {
    const score = getScore(3333, 10000);
    expect(Number.isInteger(score)).toBe(true);
  });
});

describe("pickAnswer", () => {
  test("records correct answer", () => {
    const state = createGameState();
    const newState = pickAnswer(state, "house", "house", 2000, 10000);
    expect(newState.answers).toHaveLength(1);
    expect(newState.answers[0].isCorrect).toBe(true);
    expect(newState.answers[0].score).toBeGreaterThan(0);
    expect(newState.totalScore).toBeGreaterThan(0);
  });

  test("records wrong answer with 0 score", () => {
    const state = createGameState();
    const newState = pickAnswer(state, "car", "house", 2000, 10000);
    expect(newState.answers[0].isCorrect).toBe(false);
    expect(newState.answers[0].score).toBe(0);
    expect(newState.totalScore).toBe(0);
  });

  test("increments round", () => {
    const state = createGameState();
    const newState = pickAnswer(state, "house", "house", 1000, 10000);
    expect(newState.round).toBe(1);
  });
});

describe("nextRound", () => {
  test("increments round counter", () => {
    let state = createGameState();
    state = nextRound(state);
    expect(state.round).toBe(1);
  });

  test("sets gameOver after TOTAL_ROUNDS rounds", () => {
    let state = createGameState();
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      state = nextRound(state);
    }
    expect(state.gameOver).toBe(true);
  });

  test("does not set gameOver before TOTAL_ROUNDS", () => {
    let state = createGameState();
    for (let i = 0; i < TOTAL_ROUNDS - 1; i++) {
      state = nextRound(state);
    }
    expect(state.gameOver).toBe(false);
  });
});
