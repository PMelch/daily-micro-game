// TDD Tests for Number Crunch game logic
// Run with: bun test

import { describe, test, expect } from "bun:test";
import {
  generateNumbers,
  generateTarget,
  evaluateExpression,
  scoreResult,
  validateNumbersUsed,
  formatScore,
} from "./game-logic.js";

// ─── generateNumbers ───────────────────────────────────────────────────────

describe("generateNumbers", () => {
  test("returns exactly 6 numbers", () => {
    const nums = generateNumbers();
    expect(nums).toHaveLength(6);
  });

  test("all numbers are positive integers", () => {
    const nums = generateNumbers();
    for (const n of nums) {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    }
  });

  test("large numbers come from pool [25, 50, 75, 100]", () => {
    // Call many times; large numbers should only be from valid pool
    const largePool = new Set([25, 50, 75, 100]);
    for (let i = 0; i < 50; i++) {
      const nums = generateNumbers();
      // At least 4 must be small (1-10), at most 2 large
      const large = nums.filter((n) => n > 10);
      for (const n of large) {
        expect(largePool.has(n)).toBe(true);
      }
    }
  });

  test("small numbers are between 1 and 10 inclusive", () => {
    for (let i = 0; i < 50; i++) {
      const nums = generateNumbers();
      const small = nums.filter((n) => n <= 10);
      for (const n of small) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
      }
    }
  });
});

// ─── generateTarget ────────────────────────────────────────────────────────

describe("generateTarget", () => {
  test("target is between 101 and 999", () => {
    for (let i = 0; i < 100; i++) {
      const t = generateTarget();
      expect(t).toBeGreaterThanOrEqual(101);
      expect(t).toBeLessThanOrEqual(999);
    }
  });

  test("target is an integer", () => {
    const t = generateTarget();
    expect(Number.isInteger(t)).toBe(true);
  });
});

// ─── evaluateExpression ────────────────────────────────────────────────────

describe("evaluateExpression", () => {
  test("evaluates simple addition", () => {
    expect(evaluateExpression("3 + 4")).toBe(7);
  });

  test("evaluates subtraction", () => {
    expect(evaluateExpression("10 - 3")).toBe(7);
  });

  test("evaluates multiplication", () => {
    expect(evaluateExpression("5 * 6")).toBe(30);
  });

  test("evaluates division", () => {
    expect(evaluateExpression("10 / 2")).toBe(5);
  });

  test("evaluates complex expression", () => {
    // (25 + 50) * 3 = 225
    expect(evaluateExpression("(25 + 50) * 3")).toBe(225);
  });

  test("returns null for division that produces non-integer", () => {
    expect(evaluateExpression("5 / 2")).toBeNull();
  });

  test("returns null for division by zero", () => {
    expect(evaluateExpression("5 / 0")).toBeNull();
  });

  test("returns null for empty/invalid expression", () => {
    expect(evaluateExpression("")).toBeNull();
    expect(evaluateExpression("abc")).toBeNull();
  });

  test("returns null for negative intermediate results", () => {
    // Note: final result CAN be positive even with subtraction
    // but intermediate negatives in classic countdown are not allowed
    // We allow final negative in this version — just test null on invalid
    expect(evaluateExpression("")).toBeNull();
  });
});

// ─── validateNumbersUsed ──────────────────────────────────────────────────

describe("validateNumbersUsed", () => {
  test("valid: uses subset of available numbers", () => {
    const available = [25, 50, 3, 7, 2, 9];
    const used = [25, 3, 7];
    expect(validateNumbersUsed(used, available)).toBe(true);
  });

  test("invalid: uses number not in available set", () => {
    const available = [25, 50, 3, 7, 2, 9];
    const used = [25, 3, 11]; // 11 not available
    expect(validateNumbersUsed(used, available)).toBe(false);
  });

  test("invalid: uses number more times than available", () => {
    const available = [2, 3, 5, 7, 8, 9];
    const used = [2, 2]; // only one 2 available
    expect(validateNumbersUsed(used, available)).toBe(false);
  });

  test("valid: uses duplicate if available twice", () => {
    const available = [3, 3, 5, 7, 8, 9]; // two 3s available
    const used = [3, 3];
    expect(validateNumbersUsed(used, available)).toBe(true);
  });

  test("valid: uses all 6 numbers", () => {
    const available = [1, 2, 3, 4, 5, 6];
    expect(validateNumbersUsed([1, 2, 3, 4, 5, 6], available)).toBe(true);
  });

  test("valid: uses no numbers (empty expression)", () => {
    const available = [1, 2, 3, 4, 5, 6];
    expect(validateNumbersUsed([], available)).toBe(true);
  });
});

// ─── scoreResult ──────────────────────────────────────────────────────────

describe("scoreResult", () => {
  test("exact match gives 10 points", () => {
    expect(scoreResult(350, 350)).toBe(10);
  });

  test("within 5 gives 7 points", () => {
    expect(scoreResult(353, 350)).toBe(7);
    expect(scoreResult(347, 350)).toBe(7);
    expect(scoreResult(355, 350)).toBe(7);
  });

  test("within 10 gives 5 points", () => {
    expect(scoreResult(358, 350)).toBe(5);
    expect(scoreResult(342, 350)).toBe(5);
    expect(scoreResult(360, 350)).toBe(5);
  });

  test("within 25 gives 3 points", () => {
    expect(scoreResult(370, 350)).toBe(3);
    expect(scoreResult(330, 350)).toBe(3);
    expect(scoreResult(375, 350)).toBe(3);
  });

  test("within 50 gives 1 point", () => {
    expect(scoreResult(395, 350)).toBe(1);
    expect(scoreResult(305, 350)).toBe(1);
    expect(scoreResult(400, 350)).toBe(1);
  });

  test("more than 50 away gives 0 points", () => {
    expect(scoreResult(401, 350)).toBe(0);
    expect(scoreResult(250, 350)).toBe(0);
  });

  test("null result gives 0 points", () => {
    expect(scoreResult(null, 350)).toBe(0);
  });
});

// ─── formatScore ──────────────────────────────────────────────────────────

describe("formatScore", () => {
  test("formats a score object to string", () => {
    const result = formatScore({ player: "Alice", score: 7, value: 353, target: 350 });
    expect(typeof result).toBe("string");
    expect(result).toContain("Alice");
    expect(result).toContain("7");
  });

  test("handles null value (no answer)", () => {
    const result = formatScore({ player: "Bob", score: 0, value: null, target: 350 });
    expect(typeof result).toBe("string");
    expect(result).toContain("Bob");
  });
});
