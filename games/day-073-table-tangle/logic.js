export const SEAT_COUNT = 6;

export const PUZZLES = [
  {
    id: 'civic-chaos',
    guestIds: ['mayor', 'chef', 'critic', 'cat', 'robot', 'dj'],
    rules: [
      { type: 'seat', a: 'mayor', seat: 0, reward: 5, penalty: -3 },
      { type: 'adjacent', a: 'chef', b: 'critic', reward: 6, penalty: -2 },
      { type: 'opposite', a: 'chef', b: 'robot', reward: 5, penalty: -3 },
      { type: 'notAdjacent', a: 'cat', b: 'dj', reward: 5, penalty: -2 },
      { type: 'opposite', a: 'mayor', b: 'critic', reward: 4, penalty: -3 },
    ],
  },
  {
    id: 'moon-banquet',
    guestIds: ['captain', 'oracle', 'pirate', 'botanist', 'ghost', 'pilot'],
    rules: [
      { type: 'seat', a: 'captain', seat: 0, reward: 5, penalty: -3 },
      { type: 'adjacent', a: 'oracle', b: 'ghost', reward: 5, penalty: -2 },
      { type: 'notAdjacent', a: 'pirate', b: 'captain', reward: 6, penalty: -3 },
      { type: 'opposite', a: 'pilot', b: 'botanist', reward: 5, penalty: -2 },
      { type: 'adjacent', a: 'botanist', b: 'captain', reward: 4, penalty: -2 },
    ],
  },
  {
    id: 'royal-mixup',
    guestIds: ['queen', 'magician', 'fox', 'knight', 'inventor', 'twin'],
    rules: [
      { type: 'seat', a: 'queen', seat: 0, reward: 5, penalty: -3 },
      { type: 'adjacent', a: 'magician', b: 'inventor', reward: 5, penalty: -2 },
      { type: 'opposite', a: 'fox', b: 'queen', reward: 6, penalty: -3 },
      { type: 'notAdjacent', a: 'knight', b: 'fox', reward: 4, penalty: -2 },
      { type: 'adjacent', a: 'twin', b: 'queen', reward: 5, penalty: -2 },
    ],
  },
];

export function createGame(names) {
  return {
    round: 1,
    maxRounds: PUZZLES.length,
    currentPlayerIndex: 0,
    status: 'setup',
    players: names.map((name, id) => ({ id, name, score: 0, turns: [] })),
  };
}

export function getCurrentPuzzle(game) {
  return PUZZLES[Math.max(0, Math.min(PUZZLES.length - 1, game.round - 1))];
}

export function isArrangementComplete(arrangement) {
  return arrangement.length > 0 && arrangement.every(Boolean);
}

function seatOf(arrangement, guestId) {
  return arrangement.indexOf(guestId);
}

function circularDistance(a, b, size) {
  const diff = Math.abs(a - b);
  return Math.min(diff, size - diff);
}

function evaluateRule(rule, arrangement) {
  const aSeat = seatOf(arrangement, rule.a);
  const bSeat = rule.b ? seatOf(arrangement, rule.b) : -1;
  let ok = false;

  if (aSeat === -1 || (rule.b && bSeat === -1)) {
    ok = false;
  } else if (rule.type === 'seat') {
    ok = aSeat === rule.seat;
  } else if (rule.type === 'adjacent') {
    ok = circularDistance(aSeat, bSeat, arrangement.length) === 1;
  } else if (rule.type === 'notAdjacent') {
    ok = circularDistance(aSeat, bSeat, arrangement.length) !== 1;
  } else if (rule.type === 'opposite') {
    ok = circularDistance(aSeat, bSeat, arrangement.length) === arrangement.length / 2;
  }

  return {
    ...rule,
    ok,
    scoreDelta: ok ? rule.reward : rule.penalty,
  };
}

export function scoreArrangement(puzzle, arrangement) {
  const details = puzzle.rules.map((rule) => evaluateRule(rule, arrangement));
  return {
    total: details.reduce((sum, detail) => sum + detail.scoreDelta, 0),
    satisfied: details.filter((detail) => detail.ok).length,
    broken: details.filter((detail) => !detail.ok).length,
    details,
  };
}

export function submitArrangement(game, arrangement) {
  if (!isArrangementComplete(arrangement)) {
    return { ok: false, reason: 'incomplete' };
  }

  const puzzle = getCurrentPuzzle(game);
  const score = scoreArrangement(puzzle, arrangement);
  const player = game.players[game.currentPlayerIndex];
  player.score += score.total;
  player.turns.push({ puzzleId: puzzle.id, arrangement: [...arrangement], score });

  const wasLastPlayer = game.currentPlayerIndex === game.players.length - 1;
  if (wasLastPlayer) {
    if (game.round === game.maxRounds) {
      game.status = 'finished';
    } else {
      game.round += 1;
      game.currentPlayerIndex = 0;
      game.status = 'transition';
    }
  } else {
    game.currentPlayerIndex += 1;
    game.status = 'transition';
  }

  return { ok: true, score };
}

export function getRankings(game) {
  return [...game.players]
    .map((player) => ({ name: player.name, score: player.score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

if (typeof window !== 'undefined') {
  window.TableTangle = {
    SEAT_COUNT,
    PUZZLES,
    createGame,
    getCurrentPuzzle,
    isArrangementComplete,
    scoreArrangement,
    submitArrangement,
    getRankings,
  };
}
