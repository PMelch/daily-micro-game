// TDD tests for Codebreaker Duel game logic
import { describe, it, expect } from 'bun:test';
import { checkGuess, generateCode, isValidCode, COLORS, MAX_ATTEMPTS } from './codebreaker-logic.js';

describe('COLORS', () => {
  it('should have at least 6 distinct colors', () => {
    expect(COLORS.length).toBeGreaterThanOrEqual(6);
    const unique = new Set(COLORS);
    expect(unique.size).toBe(COLORS.length);
  });
});

describe('MAX_ATTEMPTS', () => {
  it('should be a positive number (8)', () => {
    expect(MAX_ATTEMPTS).toBe(8);
  });
});

describe('generateCode', () => {
  it('should return an array of length 4', () => {
    const code = generateCode();
    expect(code).toHaveLength(4);
  });

  it('should only use valid colors', () => {
    const code = generateCode();
    code.forEach(c => expect(COLORS).toContain(c));
  });

  it('should be random (two consecutive codes usually differ)', () => {
    const codes = new Set();
    for (let i = 0; i < 20; i++) codes.add(generateCode().join(','));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('isValidCode', () => {
  it('should accept an array of 4 valid colors', () => {
    expect(isValidCode([COLORS[0], COLORS[1], COLORS[2], COLORS[3]])).toBe(true);
  });

  it('should reject wrong length', () => {
    expect(isValidCode([COLORS[0], COLORS[1], COLORS[2]])).toBe(false);
    expect(isValidCode([COLORS[0], COLORS[1], COLORS[2], COLORS[3], COLORS[4]])).toBe(false);
  });

  it('should reject invalid colors', () => {
    expect(isValidCode([COLORS[0], COLORS[1], COLORS[2], 'purple'])).toBe(false);
  });

  it('should accept duplicate colors', () => {
    expect(isValidCode([COLORS[0], COLORS[0], COLORS[0], COLORS[0]])).toBe(true);
  });
});

describe('checkGuess', () => {
  it('should return {blacks: 4, whites: 0} for exact match', () => {
    const code = ['red', 'blue', 'green', 'yellow'];
    const guess = ['red', 'blue', 'green', 'yellow'];
    const result = checkGuess(code, guess);
    expect(result.blacks).toBe(4);
    expect(result.whites).toBe(0);
  });

  it('should return {blacks: 0, whites: 0} for no match', () => {
    const code = ['red', 'red', 'red', 'red'];
    const guess = ['blue', 'blue', 'blue', 'blue'];
    const result = checkGuess(code, guess);
    expect(result.blacks).toBe(0);
    expect(result.whites).toBe(0);
  });

  it('should return correct blacks (right color right position)', () => {
    const code = ['red', 'blue', 'green', 'yellow'];
    const guess = ['red', 'green', 'blue', 'yellow'];
    const result = checkGuess(code, guess);
    expect(result.blacks).toBe(2); // red, yellow correct
  });

  it('should return correct whites (right color wrong position)', () => {
    const code = ['red', 'blue', 'green', 'yellow'];
    const guess = ['blue', 'red', 'yellow', 'green'];
    const result = checkGuess(code, guess);
    expect(result.blacks).toBe(0);
    expect(result.whites).toBe(4);
  });

  it('should not double-count colors for whites', () => {
    const code = ['red', 'blue', 'green', 'yellow'];
    const guess = ['red', 'red', 'purple', 'purple'];
    const result = checkGuess(code, guess);
    expect(result.blacks).toBe(1);
    expect(result.whites).toBe(0);
  });

  it('classic Mastermind example: code=RGBY guess=RRBG', () => {
    const code = ['red','green','blue','yellow'];
    const guess = ['red','red','blue','green'];
    const result = checkGuess(code, guess);
    expect(result.blacks).toBe(2);
    expect(result.whites).toBe(1);
  });
});
