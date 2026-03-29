/**
 * Cipher Break – Game Logic
 * Pure functions for generating and solving substitution ciphers.
 */

/**
 * Seeded pseudo-random number generator (mulberry32).
 */
function seededRNG(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded RNG.
 */
function shuffleWithSeed(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a substitution cipher (bijective mapping of A-Z → A-Z, no fixed points).
 * @param {number} seed - Reproducible seed for consistent puzzles.
 * @returns {Object} cipher - Maps plain letter (uppercase) → encoded letter (uppercase).
 */
export function generateCipher(seed) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const rand = seededRNG(seed);

  // Keep shuffling until we have no fixed points (derangement)
  let shuffled;
  let attempts = 0;
  do {
    shuffled = shuffleWithSeed(letters, seededRNG(seed + attempts * 7919));
    attempts++;
  } while (shuffled.some((enc, i) => enc === letters[i]) && attempts < 1000);

  const cipher = {};
  letters.forEach((letter, i) => {
    cipher[letter] = shuffled[i];
  });
  return cipher;
}

/**
 * Apply a substitution cipher to a plaintext string.
 * Non-alphabetic characters are preserved. Case-insensitive (output uppercase for letters).
 * @param {string} text
 * @param {Object} cipher - Maps plain → encoded (uppercase keys)
 * @returns {string} encoded text
 */
export function applyCipher(text, cipher) {
  return text.split('').map(ch => {
    const upper = ch.toUpperCase();
    if (cipher[upper] !== undefined) {
      return ch === ch.toLowerCase() ? cipher[upper].toLowerCase() : cipher[upper];
    }
    return ch;
  }).join('');
}

/**
 * Compute the inverse (decoding) cipher.
 * @param {Object} cipher - Maps plain → encoded
 * @returns {Object} inverse - Maps encoded → plain
 */
export function decodeCipher(cipher) {
  const inverse = {};
  Object.entries(cipher).forEach(([plain, encoded]) => {
    inverse[encoded] = plain;
  });
  return inverse;
}

/**
 * Check if a user's mapping (encoded → plain) correctly inverts the cipher.
 * @param {Object} userMapping - Maps encoded → plain (user's guesses)
 * @param {Object} cipher - Maps plain → encoded (ground truth)
 * @returns {boolean}
 */
export function checkSolution(userMapping, cipher) {
  const inverse = decodeCipher(cipher);
  return Object.keys(inverse).every(enc => userMapping[enc] === inverse[enc]);
}

/**
 * Count letter frequencies in a text (uppercase, letters only).
 * @param {string} text
 * @returns {Object} freq - Maps letter → count
 */
export function getLetterFrequency(text) {
  const freq = {};
  for (const ch of text.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      freq[ch] = (freq[ch] || 0) + 1;
    }
  }
  return freq;
}

/**
 * Validate that a partial mapping is bijective (no two encoded letters map to the same plain letter).
 * @param {Object} mapping - Maps encoded → plain
 * @returns {boolean}
 */
export function validateMapping(mapping) {
  const values = Object.values(mapping);
  return values.length === new Set(values).size;
}

/**
 * Check if the puzzle is solved: all letters in the encoded text are correctly decoded.
 * @param {string} encodedText - The cipher text
 * @param {Object} userMapping - Maps encoded → plain
 * @param {string} plainText - The original plain text
 * @returns {boolean}
 */
export function isPuzzleSolved(encodedText, userMapping, plainText) {
  const encLetters = encodedText.replace(/[^A-Za-z]/g, '').toUpperCase().split('');
  const plainLetters = plainText.replace(/[^A-Za-z]/g, '').toUpperCase().split('');

  if (encLetters.length !== plainLetters.length) return false;

  return encLetters.every((enc, i) => {
    return userMapping[enc] === plainLetters[i];
  });
}

/**
 * Return a hint: one unmapped encoded letter and its correct plain letter.
 * @param {Object} inverse - The correct decoding map (encoded → plain)
 * @param {Object} currentMapping - User's current mapping (encoded → plain)
 * @returns {{ encoded: string, plain: string } | null}
 */
export function getHint(inverse, currentMapping) {
  const unmapped = Object.keys(inverse).filter(enc => !(enc in currentMapping));
  if (unmapped.length === 0) return null;
  // Pick first unmapped (deterministic)
  const encoded = unmapped[0];
  return { encoded, plain: inverse[encoded] };
}
