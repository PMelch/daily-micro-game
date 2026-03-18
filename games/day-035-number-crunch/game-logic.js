// game-logic.js — Number Crunch core logic

/**
 * Generate 6 numbers: 0-2 large (25/50/75/100), rest small (1-10).
 */
export function generateNumbers() {
  const largePool = [25, 50, 75, 100];
  const smallPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Pick 0-2 large numbers (weighted toward 1-2 for fun gameplay)
  const largeCount = Math.random() < 0.15 ? 0 : Math.random() < 0.5 ? 1 : 2;
  const result = [];

  // Pick large numbers without replacement from pool
  const largeShuffle = [...largePool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < largeCount; i++) {
    result.push(largeShuffle[i]);
  }

  // Fill remaining spots with small numbers
  const smallShuffle = [...smallPool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 6 - largeCount; i++) {
    result.push(smallShuffle[i]);
  }

  return result;
}

/**
 * Generate a target between 101 and 999.
 */
export function generateTarget() {
  return Math.floor(Math.random() * 899) + 101;
}

/**
 * Safely evaluate a math expression string.
 * Only allows digits, operators, spaces, parentheses.
 * Returns null if:
 *  - invalid/empty
 *  - division by zero
 *  - result is not an integer
 */
export function evaluateExpression(expr) {
  if (!expr || typeof expr !== "string") return null;
  const trimmed = expr.trim();
  if (!trimmed) return null;

  // Whitelist: only digits, operators, parens, spaces
  if (!/^[\d\s+\-*/().]+$/.test(trimmed)) return null;

  // Check for division by zero before eval
  // We'll use a safe recursive evaluator instead of eval
  try {
    const result = safeEval(trimmed);
    if (result === null || !Number.isFinite(result)) return null;
    if (!Number.isInteger(result)) return null;
    return result;
  } catch {
    return null;
  }
}

/**
 * Safe recursive expression evaluator.
 * Handles +, -, *, / and parentheses.
 * Returns null for division by zero or non-integer division.
 */
function safeEval(expr) {
  expr = expr.trim();

  // Try to parse as a number
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return parseFloat(expr);
  }

  // Find lowest precedence operator outside parentheses (right-to-left for left-assoc)
  // First look for + and - (lowest), then * and / (higher)
  let depth = 0;
  let lastAddSub = -1;
  let lastMulDiv = -1;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (depth === 0) {
      if ((ch === "+" || ch === "-") && i > 0) {
        lastAddSub = i;
      } else if ((ch === "*" || ch === "/") && i > 0) {
        lastMulDiv = i;
      }
    }
  }

  // Split at lowest precedence operator
  const splitAt = lastAddSub !== -1 ? lastAddSub : lastMulDiv;

  if (splitAt !== -1) {
    const op = expr[splitAt];
    const left = safeEval(expr.slice(0, splitAt));
    const right = safeEval(expr.slice(splitAt + 1));
    if (left === null || right === null) return null;

    if (op === "+") return left + right;
    if (op === "-") return left - right;
    if (op === "*") return left * right;
    if (op === "/") {
      if (right === 0) return null;
      const result = left / right;
      if (!Number.isInteger(result)) return null;
      return result;
    }
  }

  // Handle parentheses wrapping entire expression
  if (expr.startsWith("(") && expr.endsWith(")")) {
    // Verify these parens match
    let d = 0;
    let valid = true;
    for (let i = 0; i < expr.length - 1; i++) {
      if (expr[i] === "(") d++;
      else if (expr[i] === ")") d--;
      if (d === 0) { valid = false; break; }
    }
    if (valid) return safeEval(expr.slice(1, -1));
  }

  // Try as plain number
  const n = parseFloat(expr);
  if (!isNaN(n)) return n;

  return null;
}

/**
 * Validate that the numbers used in an expression
 * are a valid subset of the available numbers (respecting duplicates).
 * @param {number[]} used - numbers extracted from the player's expression
 * @param {number[]} available - the 6 generated numbers
 */
export function validateNumbersUsed(used, available) {
  // Build a frequency map of available numbers
  const freq = {};
  for (const n of available) {
    freq[n] = (freq[n] || 0) + 1;
  }

  for (const n of used) {
    if (!freq[n] || freq[n] <= 0) return false;
    freq[n]--;
  }

  return true;
}

/**
 * Score a result based on how close it is to the target.
 * @param {number|null} value - the player's result
 * @param {number} target - the target number
 * @returns {number} points
 */
export function scoreResult(value, target) {
  if (value === null || value === undefined) return 0;
  const diff = Math.abs(value - target);
  if (diff === 0) return 10;
  if (diff <= 5) return 7;
  if (diff <= 10) return 5;
  if (diff <= 25) return 3;
  if (diff <= 50) return 1;
  return 0;
}

/**
 * Format a score result for display.
 * @param {{player: string, score: number, value: number|null, target: number}} opts
 */
export function formatScore({ player, score, value, target }) {
  if (value === null) {
    return `${player}: no answer — 0 pts`;
  }
  const diff = Math.abs(value - target);
  if (diff === 0) {
    return `${player}: ${value} — EXACT! ${score} pts 🎯`;
  }
  return `${player}: ${value} (off by ${diff}) — ${score} pts`;
}
