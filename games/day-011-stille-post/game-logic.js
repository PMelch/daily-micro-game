/**
 * Stille Post — Game Logic
 * Telephone Pictionary: alternate drawing and guessing until the chain is revealed.
 */

/**
 * Returns which player (0-indexed) should act at a given step.
 * @param {number} step - 0-indexed step number
 * @param {number} numPlayers
 * @returns {number} player index
 */
export function getPlayerForStep(step, numPlayers) {
  return step % numPlayers;
}

/**
 * Returns whether the step is a 'draw' or 'guess' action.
 * Step 0 = draw (player sees the secret word and draws it).
 * Step 1 = guess (player sees the drawing and writes a word).
 * Step 2 = draw (player sees the guess and draws it). Etc.
 * @param {number} step
 * @returns {'draw'|'guess'}
 */
export function getStepType(step) {
  return step % 2 === 0 ? "draw" : "guess";
}

/**
 * Total number of steps equals the number of players
 * (each player contributes exactly once to the chain).
 * @param {number} numPlayers
 * @returns {number}
 */
export function getTotalSteps(numPlayers) {
  return numPlayers;
}

/**
 * Returns whether the given step (0-indexed) is the final step.
 * @param {number} step
 * @param {number} numPlayers
 * @returns {boolean}
 */
export function isLastStep(step, numPlayers) {
  return step === getTotalSteps(numPlayers) - 1;
}

/**
 * Picks a random word from the pool using a seed for determinism.
 * @param {string[]} pool
 * @param {number} seed
 * @returns {string}
 */
export function selectRandomWord(pool, seed) {
  // Simple deterministic pick using seed
  const index = Math.abs(seed) % pool.length;
  return pool[index];
}

/**
 * Creates an empty chain array. The secret word is stored separately.
 * @param {string} _secretWord - kept here for signature clarity
 * @returns {Array}
 */
export function createInitialChain(_secretWord) {
  return [];
}

/**
 * Prepends the original secret word to the chain for the reveal screen.
 * @param {string} secretWord
 * @param {Array<{type:string, value:string, author:string}>} chain
 * @returns {Array<{type:string, value:string, author:string}>}
 */
export function buildRevealChain(secretWord, chain) {
  return [
    { type: "word", value: secretWord, author: null },
    ...chain,
  ];
}

/**
 * Validates whether a guess can be submitted.
 * @param {string} text
 * @returns {boolean}
 */
export function canSubmitGuess(text) {
  return typeof text === "string" && text.trim().length > 0;
}

// ── Word Pool ──────────────────────────────────────────────────────────────────
// 60 drawable German nouns for the secret word
export const WORD_POOL = [
  "Katze", "Hund", "Elefant", "Gitarre", "Rakete",
  "Erdbeere", "Oktopus", "Schloss", "Fahrrad", "Pizza",
  "Regenbogen", "Kaktus", "Vulkan", "Pinguin", "Biene",
  "Dinosaurier", "Krone", "Mond", "Stern", "Schmetterling",
  "Waschmaschine", "Zahn", "Palme", "Boot", "Blitz",
  "Eisbär", "Kuchen", "Drache", "Uhr", "Brille",
  "Zug", "Burg", "Hai", "Krabbe", "Maus",
  "Ballon", "Turm", "Komet", "Socke", "Koala",
  "Ananas", "Kamel", "Flugzeug", "Tintenfisch", "Zebra",
  "Giraffe", "Igel", "Lupe", "Magnet", "Würfel",
  "Schildkröte", "Eis", "Saxophon", "Leuchtturm", "Tornado",
  "Wolke", "Astronaut", "Spiegelei", "Krokodil", "Marienkäfer",
];
