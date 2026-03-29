// TDD: cipher-break game logic tests
// Run with: bun test games/day-046-cipher-break/cipher.test.js

import { describe, test, expect } from "bun:test";
import {
  generateCipher,
  applyCipher,
  decodeCipher,
  checkSolution,
  getLetterFrequency,
  validateMapping,
  isPuzzleSolved,
  getHint,
} from "./cipher-logic.js";

describe("generateCipher", () => {
  test("returns an object with 26 letter mappings", () => {
    const cipher = generateCipher(42);
    expect(Object.keys(cipher).length).toBe(26);
  });

  test("each letter maps to a unique letter", () => {
    const cipher = generateCipher(42);
    const values = Object.values(cipher);
    const unique = new Set(values);
    expect(unique.size).toBe(26);
  });

  test("all keys are uppercase A-Z", () => {
    const cipher = generateCipher(42);
    const keys = Object.keys(cipher);
    keys.forEach(k => {
      expect(k).toMatch(/^[A-Z]$/);
    });
  });

  test("no letter maps to itself (makes puzzle too easy)", () => {
    const cipher = generateCipher(42);
    Object.entries(cipher).forEach(([plain, encoded]) => {
      expect(plain).not.toBe(encoded);
    });
  });

  test("same seed produces same cipher", () => {
    const c1 = generateCipher(123);
    const c2 = generateCipher(123);
    expect(c1).toEqual(c2);
  });

  test("different seeds produce different ciphers", () => {
    const c1 = generateCipher(1);
    const c2 = generateCipher(2);
    expect(c1).not.toEqual(c2);
  });
});

describe("applyCipher", () => {
  test("encodes plain text using cipher", () => {
    const cipher = { A: "X", B: "Y", Z: "W" };
    // Only first letter matters for this test
    const result = applyCipher("A", cipher);
    expect(result).toBe("X");
  });

  test("preserves non-letter characters", () => {
    const cipher = generateCipher(10);
    expect(applyCipher("Hello, World!", cipher)).toMatch(/[^A-Za-z]/);
    const result = applyCipher("A B!", cipher);
    expect(result[1]).toBe(" ");
    expect(result[3]).toBe("!");
  });

  test("preserves case (uppercase maps to uppercase)", () => {
    const cipher = generateCipher(10);
    const result = applyCipher("HELLO", cipher);
    expect(result).toMatch(/^[A-Z]+$/);
  });

  test("lowercase is encoded same as uppercase (case-insensitive)", () => {
    const cipher = generateCipher(10);
    const upper = applyCipher("HELLO", cipher);
    const lower = applyCipher("hello", cipher);
    expect(upper.toLowerCase()).toBe(lower.toLowerCase());
  });
});

describe("decodeCipher", () => {
  test("returns the inverse cipher", () => {
    const cipher = generateCipher(42);
    const inverse = decodeCipher(cipher);
    // Applying cipher then inverse should give back original
    Object.keys(cipher).forEach(letter => {
      expect(inverse[cipher[letter]]).toBe(letter);
    });
  });

  test("inverse is also a valid 26-letter bijection", () => {
    const cipher = generateCipher(42);
    const inverse = decodeCipher(cipher);
    expect(Object.keys(inverse).length).toBe(26);
    const values = new Set(Object.values(inverse));
    expect(values.size).toBe(26);
  });
});

describe("checkSolution", () => {
  test("returns true when userMapping decodes all encoded letters correctly", () => {
    const cipher = generateCipher(7);
    const inverse = decodeCipher(cipher);
    // inverse maps encoded → plain
    expect(checkSolution(inverse, cipher)).toBe(true);
  });

  test("returns false when mapping has an error", () => {
    const cipher = generateCipher(7);
    const inverse = decodeCipher(cipher);
    // Swap two entries
    const keys = Object.keys(inverse);
    const tmp = inverse[keys[0]];
    inverse[keys[0]] = inverse[keys[1]];
    inverse[keys[1]] = tmp;
    expect(checkSolution(inverse, cipher)).toBe(false);
  });

  test("returns false for empty mapping", () => {
    const cipher = generateCipher(7);
    expect(checkSolution({}, cipher)).toBe(false);
  });
});

describe("getLetterFrequency", () => {
  test("counts letter occurrences in text", () => {
    const freq = getLetterFrequency("AABBC");
    expect(freq["A"]).toBe(2);
    expect(freq["B"]).toBe(2);
    expect(freq["C"]).toBe(1);
  });

  test("ignores non-letters", () => {
    const freq = getLetterFrequency("A, B! C?");
    expect(Object.keys(freq).length).toBe(3);
  });

  test("returns sorted entries by frequency descending", () => {
    const freq = getLetterFrequency("AAABBC");
    const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    expect(entries[0][0]).toBe("A");
    expect(entries[0][1]).toBe(3);
  });
});

describe("validateMapping", () => {
  test("returns true for a valid partial or complete mapping (bijective subset)", () => {
    // Each encoded letter maps to a unique plain letter
    const valid = { A: "E", B: "T" };
    expect(validateMapping(valid)).toBe(true);
  });

  test("returns false when two encoded letters map to same plain letter", () => {
    const invalid = { A: "E", B: "E" };
    expect(validateMapping(invalid)).toBe(false);
  });

  test("returns true for empty mapping", () => {
    expect(validateMapping({})).toBe(true);
  });
});

describe("isPuzzleSolved", () => {
  test("returns true when all encoded letters in text are correctly mapped", () => {
    const cipher = generateCipher(5);
    const inverse = decodeCipher(cipher);
    const encodedText = applyCipher("THE QUICK BROWN FOX", cipher);
    const lettersInText = [...new Set(encodedText.replace(/[^A-Z]/g, "").split(""))];
    const partialMapping = {};
    lettersInText.forEach(enc => { partialMapping[enc] = inverse[enc]; });
    expect(isPuzzleSolved(encodedText, partialMapping, "THE QUICK BROWN FOX")).toBe(true);
  });

  test("returns false when not all letters are mapped", () => {
    const cipher = generateCipher(5);
    const encodedText = applyCipher("HELLO WORLD", cipher);
    expect(isPuzzleSolved(encodedText, {}, "HELLO WORLD")).toBe(false);
  });

  test("returns false when a letter is mapped incorrectly", () => {
    const cipher = generateCipher(5);
    const inverse = decodeCipher(cipher);
    const encodedText = applyCipher("HI", cipher);
    // Build correct mapping but corrupt one
    const lettersInText = [...new Set(encodedText.replace(/[^A-Z]/g, "").split(""))];
    const mapping = {};
    lettersInText.forEach(enc => { mapping[enc] = inverse[enc]; });
    mapping[lettersInText[0]] = "Z"; // wrong
    expect(isPuzzleSolved(encodedText, mapping, "HI")).toBe(false);
  });
});

describe("getHint", () => {
  test("returns an encoded letter and its correct plain letter", () => {
    const cipher = generateCipher(99);
    const inverse = decodeCipher(cipher);
    const hint = getHint(inverse, {});
    expect(hint).toHaveProperty("encoded");
    expect(hint).toHaveProperty("plain");
    expect(inverse[hint.encoded]).toBe(hint.plain);
  });

  test("does not reveal an already-mapped letter", () => {
    const cipher = generateCipher(99);
    const inverse = decodeCipher(cipher);
    const known = { A: inverse["A"] };
    // Get multiple hints; none should be A
    for (let i = 0; i < 5; i++) {
      const hint = getHint(inverse, known);
      expect(hint.encoded).not.toBe("A");
    }
  });

  test("returns null when all letters are already mapped", () => {
    const cipher = generateCipher(99);
    const inverse = decodeCipher(cipher);
    expect(getHint(inverse, inverse)).toBeNull();
  });
});
