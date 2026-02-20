// Mind Meld — Game Logic
// Pass & Play word convergence game

export const PROMPTS = [
  'SOMMER', 'WINTER', 'FEUER', 'WASSER', 'HUND', 'KATZE', 'REISE', 'MUSIK',
  'SPORT', 'ESSEN', 'NATUR', 'STADT', 'MEER', 'BERG', 'TRAUM', 'FARBE',
  'LIEBE', 'GLÜCK', 'ANGST', 'GELD', 'ARBEIT', 'SCHULE', 'KINO', 'BUCH',
  'AUTO', 'NACHT', 'LICHT', 'DUNKEL', 'GROSS', 'KLEIN', 'SCHNELL', 'LAUT',
  'FRIEDEN', 'KRIEG', 'HELD', 'MONSTER', 'MAGIE', 'TECHNIK', 'ZUKUNFT',
  'VERGANGENHEIT', 'KÜCHE', 'GARTEN', 'HIMMEL', 'ERDE', 'FREUDE', 'TRAUER',
];

/**
 * Normalize a player's word answer.
 * Trims whitespace and lowercases.
 */
export function normalizeWord(word) {
  return word.trim().toLowerCase();
}

/**
 * Get a prompt word for the current round.
 * Avoids recently used prompts when unused ones remain.
 */
export function getPrompt(game) {
  const unused = PROMPTS.filter(p => !game.usedPrompts.has(p));
  const pool = unused.length > 0 ? unused : PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Create a fresh game state.
 * @param {string[]} playerNames
 */
export function createGame(playerNames) {
  const game = {
    players: playerNames.map(name => ({ name, score: 0 })),
    round: 1,
    attempt: 1,
    answers: [],
    usedPrompts: new Set(),
    prompt: '',
  };
  game.prompt = getPrompt(game);
  return game;
}

/**
 * Submit or overwrite a player's answer for the current attempt.
 * @param {object} game
 * @param {number} playerIndex
 * @param {string} rawWord
 */
export function submitAnswer(game, playerIndex, rawWord) {
  const word = normalizeWord(rawWord);
  const existing = game.answers.findIndex(a => a.playerIndex === playerIndex);
  if (existing >= 0) {
    game.answers[existing].word = word;
  } else {
    game.answers.push({ playerIndex, word });
  }
}

/**
 * Check if all players have submitted answers.
 */
export function canProgress(game) {
  return game.answers.length === game.players.length;
}

/**
 * Evaluate if any two or more players wrote the same word.
 * Returns the largest matching group.
 */
export function getMatchResult(game) {
  if (game.answers.length < 2) {
    return { matched: false, matchWord: null, winners: [] };
  }

  // Count occurrences of each word
  const wordMap = new Map();
  for (const a of game.answers) {
    if (!wordMap.has(a.word)) wordMap.set(a.word, []);
    wordMap.get(a.word).push(a.playerIndex);
  }

  // Find best match (most players on same word)
  let bestWord = null;
  let bestWinners = [];
  for (const [word, players] of wordMap.entries()) {
    if (players.length >= 2 && players.length > bestWinners.length) {
      bestWord = word;
      bestWinners = players;
    }
  }

  return {
    matched: bestWinners.length >= 2,
    matchWord: bestWord,
    winners: bestWinners,
  };
}

/**
 * Advance the game based on the match result.
 * - Match: increment round, update scores, pick new prompt
 * - No match: increment attempt, clear answers, keep prompt
 */
export function nextRound(game, result) {
  // Award points to winners
  if (result.matched) {
    for (const idx of result.winners) {
      game.players[idx].score += 1;
    }
    // Mark prompt as used and get a new one
    game.usedPrompts.add(game.prompt);
    game.round += 1;
    game.attempt = 1;
    game.prompt = getPrompt(game);
  } else {
    game.attempt += 1;
  }
  game.answers = [];
}
