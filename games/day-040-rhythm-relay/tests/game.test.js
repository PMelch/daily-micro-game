import { describe, test, expect } from "bun:test";
import {
  createGameState,
  addBeat,
  validateInput,
  getScore,
  nextTurn,
  BEATS,
} from "../game-logic.js";

describe("BEATS constant", () => {
  test("has exactly 4 distinct beats", () => {
    expect(BEATS.length).toBe(4);
    const ids = BEATS.map(b => b.id);
    expect(new Set(ids).size).toBe(4);
  });
  test("each beat has id, label, color, key", () => {
    BEATS.forEach(b => {
      expect(b).toHaveProperty("id");
      expect(b).toHaveProperty("label");
      expect(b).toHaveProperty("color");
      expect(b).toHaveProperty("key");
    });
  });
});

describe("createGameState", () => {
  test("creates state with player names", () => {
    const state = createGameState(["Alice", "Bob"]);
    expect(state.players).toEqual(["Alice", "Bob"]);
    expect(state.currentPlayerIdx).toBe(0);
    expect(state.sequence).toEqual([]);
    expect(state.round).toBe(1);
    expect(state.scores).toEqual({ Alice: 0, Bob: 0 });
    expect(state.phase).toBe("watch"); // starts in watch phase
  });

  test("requires at least 2 players", () => {
    expect(() => createGameState(["Solo"])).toThrow();
  });

  test("supports 2–4 players", () => {
    expect(() => createGameState(["A", "B", "C", "D"])).not.toThrow();
    expect(() => createGameState(["A", "B", "C", "D", "E"])).toThrow();
  });
});

describe("addBeat", () => {
  test("adds a beat to the sequence", () => {
    const state = createGameState(["Alice", "Bob"]);
    const newState = addBeat(state, 0);
    expect(newState.sequence.length).toBe(1);
    expect(newState.sequence[0]).toBe(0);
  });

  test("adds beat at end, preserving previous beats", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = addBeat(state, 2);
    state = addBeat(state, 1);
    expect(state.sequence).toEqual([2, 1]);
  });

  test("does not mutate original state", () => {
    const state = createGameState(["Alice", "Bob"]);
    const newState = addBeat(state, 0);
    expect(state.sequence).toEqual([]);
    expect(newState.sequence.length).toBe(1);
  });
});

describe("validateInput", () => {
  test("correct single beat returns true", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = addBeat(state, 1);
    // Simulate entering repeat phase
    state = { ...state, phase: "repeat", inputSoFar: [] };
    const result = validateInput(state, 1);
    expect(result.correct).toBe(true);
    expect(result.complete).toBe(false); // sequence has 1 beat, we need to add 1 new
  });

  test("wrong beat returns false", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = addBeat(state, 2);
    state = { ...state, phase: "repeat", inputSoFar: [] };
    const result = validateInput(state, 0);
    expect(result.correct).toBe(false);
  });

  test("completing the old sequence transitions to add phase", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = addBeat(state, 1);
    state = addBeat(state, 3);
    // player must repeat [1, 3] then add one new beat
    state = { ...state, phase: "repeat", inputSoFar: [] };
    let result = validateInput(state, 1);
    expect(result.correct).toBe(true);
    expect(result.transitionToAdd).toBe(false);
    // update state for next input
    state = { ...state, inputSoFar: [1] };
    result = validateInput(state, 3);
    expect(result.correct).toBe(true);
    expect(result.transitionToAdd).toBe(true); // finished repeating, must now add new beat
  });
});

describe("getScore", () => {
  test("player earns 1 point per successful round survived", () => {
    let state = createGameState(["Alice", "Bob"]);
    // Alice successfully plays round 1 (sequence length 1 → score 1)
    state = { ...state, scores: { Alice: 1, Bob: 0 } };
    expect(getScore(state, "Alice")).toBe(1);
  });

  test("score starts at 0", () => {
    const state = createGameState(["Alice", "Bob"]);
    expect(getScore(state, "Alice")).toBe(0);
  });
});

describe("nextTurn", () => {
  test("advances to next player", () => {
    const state = createGameState(["Alice", "Bob"]);
    const next = nextTurn(state);
    expect(next.currentPlayerIdx).toBe(1);
  });

  test("wraps around to first player after last", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = { ...state, currentPlayerIdx: 1 };
    const next = nextTurn(state);
    expect(next.currentPlayerIdx).toBe(0);
  });

  test("increments round when cycling back to first player", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = { ...state, currentPlayerIdx: 1 };
    const next = nextTurn(state);
    expect(next.round).toBe(2);
  });

  test("resets to watch phase", () => {
    let state = createGameState(["Alice", "Bob"]);
    state = { ...state, phase: "add" };
    const next = nextTurn(state);
    expect(next.phase).toBe("watch");
  });
});
