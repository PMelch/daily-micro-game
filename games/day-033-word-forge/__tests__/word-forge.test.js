// Word Forge - TDD Tests
// Pass & Play Countdown-style letters duel

import { describe, it, expect } from 'bun:test';

// ---- Module under test ----
import {
  generateLetterPool,
  canFormWord,
  scoreWord,
  isValidWordLength,
  pickLetter,
  VOWELS,
  CONSONANTS,
} from '../word-forge-logic.js';

// ---- Letter Pool Generation ----
describe('generateLetterPool', () => {
  it('returns exactly 9 letters', () => {
    const pool = generateLetterPool();
    expect(pool.length).toBe(9);
  });

  it('all letters are uppercase A-Z', () => {
    const pool = generateLetterPool();
    pool.forEach(l => expect(l).toMatch(/^[A-Z]$/));
  });

  it('respects forced vowels count', () => {
    const pool = generateLetterPool(4, 5);
    const vowelCount = pool.filter(l => VOWELS.includes(l)).length;
    expect(vowelCount).toBe(4);
  });

  it('respects forced consonants count', () => {
    const pool = generateLetterPool(3, 6);
    const consCount = pool.filter(l => CONSONANTS.includes(l)).length;
    expect(consCount).toBe(6);
  });

  it('defaults to at least 3 vowels and 4 consonants', () => {
    const pool = generateLetterPool();
    const vowelCount = pool.filter(l => VOWELS.includes(l)).length;
    expect(vowelCount).toBeGreaterThanOrEqual(3);
    expect(pool.filter(l => CONSONANTS.includes(l)).length).toBeGreaterThanOrEqual(4);
  });
});

// ---- pickLetter ----
describe('pickLetter', () => {
  it('returns a vowel when type is vowel', () => {
    const l = pickLetter('vowel');
    expect(VOWELS).toContain(l);
  });

  it('returns a consonant when type is consonant', () => {
    const l = pickLetter('consonant');
    expect(CONSONANTS).toContain(l);
  });
});

// ---- canFormWord ----
describe('canFormWord', () => {
  it('returns true when word can be formed from pool', () => {
    const pool = ['C', 'A', 'T', 'D', 'O', 'G', 'E', 'N', 'S'];
    expect(canFormWord('CAT', pool)).toBe(true);
  });

  it('returns true for exact pool match', () => {
    const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    expect(canFormWord('ABCDE', pool)).toBe(true);
  });

  it('returns false when a letter is used more times than available', () => {
    const pool = ['C', 'A', 'T', 'D', 'O', 'G', 'E', 'N', 'S'];
    // Only one 'T' in pool
    expect(canFormWord('TATTOO', pool)).toBe(false);
  });

  it('returns false when a required letter is missing from pool', () => {
    const pool = ['C', 'A', 'T', 'D', 'O', 'G', 'E', 'N', 'S'];
    expect(canFormWord('ZIP', pool)).toBe(false);
  });

  it('is case-insensitive', () => {
    const pool = ['C', 'A', 'T', 'D', 'O', 'G', 'E', 'N', 'S'];
    expect(canFormWord('cat', pool)).toBe(true);
  });

  it('returns false for empty word', () => {
    const pool = ['C', 'A', 'T', 'D', 'O', 'G', 'E', 'N', 'S'];
    expect(canFormWord('', pool)).toBe(false);
  });
});

// ---- isValidWordLength ----
describe('isValidWordLength', () => {
  it('returns false for words shorter than 2 letters', () => {
    expect(isValidWordLength('A')).toBe(false);
    expect(isValidWordLength('')).toBe(false);
  });

  it('returns true for 2+ letter words', () => {
    expect(isValidWordLength('AT')).toBe(true);
    expect(isValidWordLength('CAT')).toBe(true);
    expect(isValidWordLength('ELEPHANT')).toBe(true);
  });
});

// ---- scoreWord ----
describe('scoreWord', () => {
  it('returns the word length as score for valid words', () => {
    expect(scoreWord('CAT', true)).toBe(3);
    expect(scoreWord('STONES', true)).toBe(6);
  });

  it('returns 0 for invalid words', () => {
    expect(scoreWord('ZXXQW', false)).toBe(0);
  });

  it('bonus: 9-letter word scores extra +5', () => {
    expect(scoreWord('ABCDEFGHI', true)).toBe(14); // 9 + 5
  });

  it('bonus: 7-letter word scores extra +3', () => {
    expect(scoreWord('ABCDEFG', true)).toBe(10); // 7 + 3
  });

  it('no bonus for 6-letter words', () => {
    expect(scoreWord('ABCDEF', true)).toBe(6);
  });
});

// ---- Integration: full round simulation ----
describe('integration: round simulation', () => {
  it('player can score by forming a valid word from pool', () => {
    const pool = ['S', 'T', 'O', 'N', 'E', 'S', 'A', 'R', 'D'];
    const word = 'STONE';
    const valid = canFormWord(word, pool) && isValidWordLength(word);
    const score = scoreWord(word, valid);
    expect(valid).toBe(true);
    expect(score).toBe(5);
  });

  it('player using duplicate letter not in pool scores 0', () => {
    const pool = ['S', 'T', 'O', 'N', 'E', 'A', 'R', 'D', 'L'];
    const word = 'STONES'; // needs 2 S but only 1 in pool
    const valid = canFormWord(word, pool) && isValidWordLength(word);
    const score = scoreWord(word, valid);
    expect(valid).toBe(false);
    expect(score).toBe(0);
  });
});
