// Memory Pulse - Game Logic

const TILE_COLORS = ['#ff4444', '#44bb44', '#4488ff', '#ffaa00', '#cc44ff', '#44dddd'];
const BASE_FLASH_MS = 600;
const MIN_FLASH_MS = 250;
const SPEED_DECAY = 0.92;

export function createGame(tileCount = 4) {
  return {
    tileCount,
    sequence: [],
    inputIndex: 0,
    round: 0,
    state: 'idle', // idle | playing | input | gameover
    bestRound: 0,
  };
}

export function addToSequence(game) {
  const next = Math.floor(Math.random() * game.tileCount);
  return {
    ...game,
    sequence: [...game.sequence, next],
    round: game.round + 1,
    inputIndex: 0,
    state: 'playing',
  };
}

export function addToSequenceWithValue(game, value) {
  return {
    ...game,
    sequence: [...game.sequence, value],
    round: game.round + 1,
    inputIndex: 0,
    state: 'playing',
  };
}

export function getFlashDuration(round) {
  return Math.max(MIN_FLASH_MS, Math.floor(BASE_FLASH_MS * Math.pow(SPEED_DECAY, round - 1)));
}

export function handleInput(game, tileIndex) {
  if (game.state !== 'input') return game;

  const expected = game.sequence[game.inputIndex];
  if (tileIndex !== expected) {
    return {
      ...game,
      state: 'gameover',
      bestRound: Math.max(game.bestRound, game.round - 1),
    };
  }

  const newIndex = game.inputIndex + 1;
  if (newIndex >= game.sequence.length) {
    // Round complete - ready for next
    return { ...game, inputIndex: newIndex, state: 'roundcomplete' };
  }

  return { ...game, inputIndex: newIndex };
}

export function markInputReady(game) {
  return { ...game, state: 'input', inputIndex: 0 };
}

export function getTileColors(count) {
  return TILE_COLORS.slice(0, count);
}
