// Word Forge - Game Logic
// Shared between tests and game (ES module)

export const VOWELS = ['A', 'E', 'I', 'O', 'U'];
export const CONSONANTS = [
  'B','C','D','F','G','H','J','K','L','M',
  'N','P','Q','R','S','T','V','W','X','Y','Z'
];

// Weighted consonant pool (more common letters appear more often)
const CONSONANT_POOL = [
  'B','C','D','D','F','G','G','H','H','J','K',
  'L','L','L','M','M','N','N','N','N',
  'P','P','R','R','R','R','S','S','S','S','S',
  'T','T','T','T','V','W','X','Y','Z'
];

const VOWEL_POOL = [
  'A','A','A','A','A',
  'E','E','E','E','E','E','E',
  'I','I','I','I',
  'O','O','O','O',
  'U','U'
];

/**
 * Pick a random letter from a weighted pool.
 * @param {'vowel'|'consonant'} type
 * @returns {string} uppercase letter
 */
export function pickLetter(type) {
  if (type === 'vowel') {
    return VOWEL_POOL[Math.floor(Math.random() * VOWEL_POOL.length)];
  }
  return CONSONANT_POOL[Math.floor(Math.random() * CONSONANT_POOL.length)];
}

/**
 * Generate a pool of 9 letters.
 * @param {number} vowels  - how many vowels (default: random 3–5)
 * @param {number} consonants - how many consonants (default: 9 - vowels)
 * @returns {string[]} array of 9 uppercase letters
 */
export function generateLetterPool(vowels, consonants) {
  const total = 9;
  if (vowels === undefined) {
    vowels = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
  }
  if (consonants === undefined) {
    consonants = total - vowels;
  }

  const letters = [];
  for (let i = 0; i < vowels; i++) letters.push(pickLetter('vowel'));
  for (let i = 0; i < consonants; i++) letters.push(pickLetter('consonant'));

  // Shuffle
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  return letters;
}

/**
 * Check if a word can be formed from the given letter pool.
 * Each letter in the pool may only be used as many times as it appears.
 * @param {string} word
 * @param {string[]} pool
 * @returns {boolean}
 */
export function canFormWord(word, pool) {
  if (!word || word.length === 0) return false;

  const upper = word.toUpperCase();
  const available = {};

  for (const l of pool) {
    available[l] = (available[l] || 0) + 1;
  }

  for (const l of upper) {
    if (!available[l] || available[l] === 0) return false;
    available[l]--;
  }

  return true;
}

/**
 * Check if a word meets the minimum length requirement (2+).
 * @param {string} word
 * @returns {boolean}
 */
export function isValidWordLength(word) {
  return word.length >= 2;
}

/**
 * Calculate score for a word.
 * Score = word length + bonus for long words.
 * Bonus: 7+ letters = +3, 9 letters = +5 (instead of +3)
 * @param {string} word
 * @param {boolean} isValid - whether the word was accepted as valid
 * @returns {number}
 */
export function scoreWord(word, isValid) {
  if (!isValid) return 0;
  const len = word.length;
  if (len === 9) return len + 5;
  if (len >= 7) return len + 3;
  return len;
}
