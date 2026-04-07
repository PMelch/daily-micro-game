/**
 * Volt Rush - Game Logic
 * Pure functional module for pass-and-play precision timing duel.
 */

export const TOTAL_ROUNDS = 5;

export const ZONE_TYPES = [
  { label: 'safe',    points: 10,  width: 0.30, color: '#4caf50' },
  { label: 'good',    points: 30,  width: 0.18, color: '#8bc34a' },
  { label: 'great',   points: 60,  width: 0.10, color: '#ffeb3b' },
  { label: 'perfect', points: 100, width: 0.05, color: '#ff9800' },
];

/**
 * Generate a target zone for a given seed (round-based determinism optional,
 * but random is fine for gameplay).
 * @param {number} seed - used to vary zone types across rounds
 * @returns {{ center: number, type: object }}
 */
export function generateZone(seed) {
  // Pick zone type based on seed/round - cycle through types + random
  const typeIndex = Math.floor(Math.random() * ZONE_TYPES.length);
  const type = ZONE_TYPES[typeIndex];

  const half = type.width / 2;
  // Keep center away from edges so zone fits in [0,1]
  const margin = half + 0.05;
  const center = margin + Math.random() * (1 - 2 * margin);

  return { center, type };
}

/**
 * Compute score for a needle stop position given the zone.
 * Returns full points if within zone, 0 otherwise.
 * @param {number} pos - 0..1 position where needle stopped
 * @param {{ center: number, type: { points: number, width: number } }} zone
 * @returns {number}
 */
export function computeScore(pos, zone) {
  const half = zone.type.width / 2;
  const dist = Math.abs(pos - zone.center);
  if (dist <= half) {
    return zone.type.points;
  }
  return 0;
}

/**
 * Create initial game state.
 * @param {string[]} names - player names
 * @returns {object}
 */
export function createGameState(names) {
  return {
    phase: 'setup',
    round: 1,
    activePlayerIndex: 0,
    players: names.map(name => ({ name, score: 0 })),
    currentZone: null,
    lastHitPos: null,
    lastWasHit: null,
  };
}

/**
 * Record a player's timing attempt.
 * @param {object} state
 * @param {number} pos - 0..1 position where needle was stopped
 * @returns {object} new state
 */
export function recordAttempt(state, pos) {
  const score = computeScore(pos, state.currentZone);
  const wasHit = score > 0;

  const newPlayers = state.players.map((p, i) => {
    if (i === state.activePlayerIndex) {
      return { ...p, score: p.score + score };
    }
    return p;
  });

  return {
    ...state,
    players: newPlayers,
    lastHitPos: pos,
    lastWasHit: wasHit,
    phase: 'pass-device',
  };
}

/**
 * Advance to the next player / next round.
 * @param {object} state
 * @returns {object} new state
 */
export function nextRound(state) {
  const numPlayers = state.players.length;
  const isLastPlayer = state.activePlayerIndex === numPlayers - 1;

  let newRound = state.round;
  let newActiveIndex;

  if (isLastPlayer) {
    newRound = state.round + 1;
    newActiveIndex = 0;
  } else {
    newActiveIndex = state.activePlayerIndex + 1;
  }

  return {
    ...state,
    round: newRound,
    activePlayerIndex: newActiveIndex,
    phase: 'playing',
    currentZone: generateZone(newRound),
    lastHitPos: null,
    lastWasHit: null,
  };
}

/**
 * Check if the game is over.
 * Game ends when the last player finishes the last round.
 * @param {object} state
 * @returns {boolean}
 */
export function isGameOver(state) {
  if (state.phase !== 'pass-device') return false;
  const isLastRound = state.round === TOTAL_ROUNDS;
  const isLastPlayer = state.activePlayerIndex === state.players.length - 1;
  return isLastRound && isLastPlayer;
}

/**
 * Get the winner (highest score, first player wins tie).
 * @param {object} state
 * @returns {object} player
 */
export function getWinner(state) {
  return state.players.reduce((best, p) => p.score > best.score ? p : best, state.players[0]);
}
