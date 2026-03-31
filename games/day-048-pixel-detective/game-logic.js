// Pixel Detective - Game Logic Module
// Single Player: identify pixelated images before they reveal

export const TOTAL_ROUNDS = 5;
export const MAX_SCORE_PER_ROUND = 100;
const MIN_SCORE = 10;
const MAX_BLOCK = 32;
const MIN_BLOCK = 1;

/**
 * Create initial game state.
 */
export function createGameState() {
  return {
    round: 0,
    totalScore: 0,
    answers: [],
    gameOver: false,
  };
}

/**
 * Get the current pixelation block size.
 * @param {number} elapsed - milliseconds since round started
 * @param {number} duration - total round duration in ms
 * @returns {number} block size (32=blurry, 1=clear)
 */
export function getPixelationLevel(elapsed, duration) {
  const t = Math.max(0, Math.min(elapsed, duration));
  const progress = t / duration; // 0..1
  // Exponential ease: starts slow (very blurry), accelerates to clear
  const eased = 1 - Math.pow(1 - progress, 2);
  const block = MAX_BLOCK - Math.round(eased * (MAX_BLOCK - MIN_BLOCK));
  return Math.max(MIN_BLOCK, Math.min(MAX_BLOCK, block));
}

/**
 * Calculate score for a correct answer based on time taken.
 * @param {number} elapsed - ms since round started
 * @param {number} duration - total round duration in ms
 * @param {boolean} correct - whether answer was correct
 * @returns {number} score 0..100
 */
export function getScore(elapsed, duration, correct = true) {
  if (!correct) return 0;
  const t = Math.max(0, Math.min(elapsed, duration));
  const progress = t / duration; // 0..1
  // Linear interpolation: 100 at t=0, 10 at t=duration
  const raw = MAX_SCORE_PER_ROUND - progress * (MAX_SCORE_PER_ROUND - MIN_SCORE);
  return Math.round(raw);
}

/**
 * Record a player's answer and update state.
 */
export function pickAnswer(state, chosen, correct, elapsed, duration) {
  const isCorrect = chosen === correct;
  const score = getScore(elapsed, duration, isCorrect);
  const answer = { chosen, correct, isCorrect, score, elapsed };
  return {
    ...state,
    round: state.round + 1,
    totalScore: state.totalScore + score,
    answers: [...state.answers, answer],
    gameOver: state.round + 1 >= TOTAL_ROUNDS,
  };
}

/**
 * Advance to next round without recording an answer (timeout).
 */
export function nextRound(state) {
  const newRound = state.round + 1;
  return {
    ...state,
    round: newRound,
    gameOver: newRound >= TOTAL_ROUNDS,
  };
}
