import { describe, it, expect } from "bun:test";
import {
  getPlayerForStep,
  getStepType,
  isLastStep,
  getTotalSteps,
  selectRandomWord,
  buildRevealChain,
  createInitialChain,
  canSubmitGuess,
} from "./game-logic.js";

// ── getPlayerForStep ──────────────────────────────────────────────────────────
describe("getPlayerForStep", () => {
  it("step 0 → player 0", () => {
    expect(getPlayerForStep(0, 3)).toBe(0);
  });
  it("step 1 → player 1", () => {
    expect(getPlayerForStep(1, 3)).toBe(1);
  });
  it("step 2 → player 2 (last player, 3p game)", () => {
    expect(getPlayerForStep(2, 3)).toBe(2);
  });
  it("wraps around for long chains", () => {
    expect(getPlayerForStep(3, 3)).toBe(0);
  });
  it("works for 2 players", () => {
    expect(getPlayerForStep(0, 2)).toBe(0);
    expect(getPlayerForStep(1, 2)).toBe(1);
    expect(getPlayerForStep(2, 2)).toBe(0);
  });
  it("works for 4 players", () => {
    expect(getPlayerForStep(3, 4)).toBe(3);
    expect(getPlayerForStep(4, 4)).toBe(0);
  });
});

// ── getStepType ───────────────────────────────────────────────────────────────
describe("getStepType", () => {
  it("step 0 is always 'draw'", () => {
    expect(getStepType(0)).toBe("draw");
  });
  it("step 1 is 'guess'", () => {
    expect(getStepType(1)).toBe("guess");
  });
  it("step 2 is 'draw'", () => {
    expect(getStepType(2)).toBe("draw");
  });
  it("step 3 is 'guess'", () => {
    expect(getStepType(3)).toBe("guess");
  });
  it("odd steps are always 'guess'", () => {
    for (let i = 1; i < 10; i += 2) {
      expect(getStepType(i)).toBe("guess");
    }
  });
  it("even steps are always 'draw'", () => {
    for (let i = 0; i < 10; i += 2) {
      expect(getStepType(i)).toBe("draw");
    }
  });
});

// ── getTotalSteps ─────────────────────────────────────────────────────────────
describe("getTotalSteps", () => {
  it("2 players → 2 steps", () => {
    expect(getTotalSteps(2)).toBe(2);
  });
  it("3 players → 3 steps", () => {
    expect(getTotalSteps(3)).toBe(3);
  });
  it("4 players → 4 steps", () => {
    expect(getTotalSteps(4)).toBe(4);
  });
});

// ── isLastStep ────────────────────────────────────────────────────────────────
describe("isLastStep", () => {
  it("step 1 of 2 is last (2 players, 0-indexed)", () => {
    expect(isLastStep(1, 2)).toBe(true);
  });
  it("step 0 of 2 is not last", () => {
    expect(isLastStep(0, 2)).toBe(false);
  });
  it("step 2 of 3 is last", () => {
    expect(isLastStep(2, 3)).toBe(true);
  });
  it("step 3 of 4 is last", () => {
    expect(isLastStep(3, 4)).toBe(true);
  });
  it("step 2 of 4 is not last", () => {
    expect(isLastStep(2, 4)).toBe(false);
  });
});

// ── selectRandomWord ──────────────────────────────────────────────────────────
describe("selectRandomWord", () => {
  const pool = ["Katze", "Hund", "Pizza", "Rakete", "Gitarre"];

  it("returns a word from the pool", () => {
    const word = selectRandomWord(pool, 0);
    expect(pool).toContain(word);
  });

  it("returns deterministic result for same seed", () => {
    expect(selectRandomWord(pool, 42)).toBe(selectRandomWord(pool, 42));
  });

  it("returns different words for different seeds (usually)", () => {
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      results.add(selectRandomWord(pool, i));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it("never returns undefined", () => {
    for (let i = 0; i < 50; i++) {
      expect(selectRandomWord(pool, i)).toBeDefined();
    }
  });
});

// ── createInitialChain ────────────────────────────────────────────────────────
describe("createInitialChain", () => {
  it("creates empty chain array", () => {
    const chain = createInitialChain("Katze");
    expect(Array.isArray(chain)).toBe(true);
    expect(chain.length).toBe(0);
  });
});

// ── buildRevealChain ──────────────────────────────────────────────────────────
describe("buildRevealChain", () => {
  it("builds a reveal chain with original word first", () => {
    const chain = [
      { type: "draw", value: "data:image/png;base64,abc", author: "Anna" },
      { type: "guess", value: "Katze", author: "Ben" },
    ];
    const reveal = buildRevealChain("Erdbeere", chain);
    expect(reveal[0].type).toBe("word");
    expect(reveal[0].value).toBe("Erdbeere");
  });

  it("includes all chain entries after the original word", () => {
    const chain = [
      { type: "draw", value: "data:image/png;base64,abc", author: "Anna" },
      { type: "guess", value: "Vogel", author: "Ben" },
    ];
    const reveal = buildRevealChain("Elefant", chain);
    expect(reveal.length).toBe(3); // original + 2 chain items
    expect(reveal[1].type).toBe("draw");
    expect(reveal[2].type).toBe("guess");
    expect(reveal[2].value).toBe("Vogel");
  });
});

// ── canSubmitGuess ────────────────────────────────────────────────────────────
describe("canSubmitGuess", () => {
  it("returns false for empty string", () => {
    expect(canSubmitGuess("")).toBe(false);
  });

  it("returns false for whitespace only", () => {
    expect(canSubmitGuess("   ")).toBe(false);
  });

  it("returns true for non-empty guess", () => {
    expect(canSubmitGuess("Elefant")).toBe(true);
  });

  it("returns true for single character", () => {
    expect(canSubmitGuess("A")).toBe(true);
  });
});
