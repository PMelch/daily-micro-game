/**
 * Rhythm Relay - Game Logic
 * Pass & Play: Players watch a beat sequence, repeat it, then add one new beat.
 * The sequence grows. Miss a beat = lose a life. Last one standing wins!
 */

export const BEATS = [
  { id: 0, label: "🥁", color: "#ff6b6b", key: "1" },
  { id: 1, label: "🎸", color: "#4ecdc4", key: "2" },
  { id: 2, label: "🎹", color: "#ffe66d", key: "3" },
  { id: 3, label: "🎺", color: "#a29bfe", key: "4" },
];

export function createGameState(players) {
  if (!Array.isArray(players) || players.length < 2) {
    throw new Error("At least 2 players required");
  }
  if (players.length > 4) {
    throw new Error("Maximum 4 players allowed");
  }

  const scores = {};
  players.forEach(p => { scores[p] = 0; });

  return {
    players,
    currentPlayerIdx: 0,
    sequence: [],
    round: 1,
    scores,
    phase: "watch", // "watch" | "repeat" | "add"
    inputSoFar: [],
    lives: Object.fromEntries(players.map(p => [p, 3])),
  };
}

export function addBeat(state, beatId) {
  return {
    ...state,
    sequence: [...state.sequence, beatId],
  };
}

/**
 * Validate a player's input against the expected sequence.
 * During "repeat" phase: player must reproduce state.sequence exactly.
 * After completing sequence: player must add one new beat (phase transitions to "add").
 *
 * Returns: { correct, complete, transitionToAdd }
 *   correct: was this input beat correct?
 *   complete: has the player finished all required input (repeat + add)?
 *   transitionToAdd: player just finished the repeat portion, must now add new beat
 */
export function validateInput(state, beatId) {
  const { sequence, inputSoFar } = state;
  const pos = inputSoFar.length;

  if (pos < sequence.length) {
    // Still in repeat phase
    const expected = sequence[pos];
    const correct = beatId === expected;
    const transitionToAdd = correct && pos === sequence.length - 1;
    return { correct, complete: false, transitionToAdd };
  }

  // This should not happen in normal flow
  return { correct: false, complete: false, transitionToAdd: false };
}

export function getScore(state, playerName) {
  return state.scores[playerName] ?? 0;
}

export function nextTurn(state) {
  const { players, currentPlayerIdx } = state;
  const nextIdx = (currentPlayerIdx + 1) % players.length;
  const newRound = nextIdx === 0 ? state.round + 1 : state.round;

  return {
    ...state,
    currentPlayerIdx: nextIdx,
    round: newRound,
    phase: "watch",
    inputSoFar: [],
  };
}
