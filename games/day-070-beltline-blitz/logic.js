export const BOARD_SIZE = 5;
export const ENERGY_COUNT = 3;
export const MAX_TURNS_PER_PLAYER = 5;
export const DIRECTIONS = ['up', 'right', 'down', 'left'];
export const PLAYER_SLOTS = [
  { start: { x: 2, y: 4 }, goal: 'up', color: '#ff6b6b', icon: '⬆️' },
  { start: { x: 2, y: 0 }, goal: 'down', color: '#4dabf7', icon: '⬇️' },
  { start: { x: 0, y: 2 }, goal: 'right', color: '#ffd43b', icon: '➡️' },
  { start: { x: 4, y: 2 }, goal: 'left', color: '#69db7c', icon: '⬅️' },
];

const DELTAS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export function rotateDirection(direction) {
  const index = DIRECTIONS.indexOf(direction);
  return DIRECTIONS[(index + 1) % DIRECTIONS.length];
}

export function computeWinners(players) {
  const topScore = Math.max(...players.map((player) => player.score));
  return players
    .filter((player) => player.score === topScore)
    .map((player) => ({ name: player.name, score: player.score }));
}

export function createGame(playerNames, seed = 70) {
  const random = mulberry32(seed);
  const players = playerNames.map((name, index) => ({
    id: index,
    name,
    score: 0,
    pos: { ...PLAYER_SLOTS[index].start },
    start: { ...PLAYER_SLOTS[index].start },
    goal: PLAYER_SLOTS[index].goal,
    color: PLAYER_SLOTS[index].color,
    icon: PLAYER_SLOTS[index].icon,
  }));

  const game = {
    seed,
    random,
    board: createBoard(random),
    players,
    energy: [],
    currentPlayerIndex: 0,
    turn: 1,
    maxTurns: Math.max(8, playerNames.length * MAX_TURNS_PER_PLAYER),
    status: 'transition',
    winners: [],
    lastTurn: null,
  };

  refillEnergy(game);
  return game;
}

export function applyTurn(game, x, y) {
  if (game.status === 'finished') {
    return { rotated: null, deliveries: [], jams: [], collected: [] };
  }

  game.board[y][x].dir = rotateDirection(game.board[y][x].dir);
  const rotated = { x, y, dir: game.board[y][x].dir };
  const intents = game.players.map((player, index) => getIntent(game, player, index));
  const jams = collectJams(intents);
  const jammedPlayers = new Set(jams.flatMap((jam) => jam.players));
  const deliveries = [];
  const collected = [];
  const occupiedAfterMove = new Set();

  intents.forEach((intent, index) => {
    const player = game.players[index];
    if (intent.type === 'deliver') {
      player.score += 3;
      deliveries.push({ playerIndex: index, score: 3 });
      return;
    }

    if (intent.type === 'move' && !jammedPlayers.has(index)) {
      player.pos = intent.to;
    }

    occupiedAfterMove.add(posKey(player.pos));
  });

  for (const delivery of deliveries) {
    const player = game.players[delivery.playerIndex];
    occupiedAfterMove.delete(posKey(player.pos));
    player.pos = findRespawnCell(game, player.start, occupiedAfterMove);
    occupiedAfterMove.add(posKey(player.pos));
  }

  for (let index = 0; index < game.players.length; index += 1) {
    const player = game.players[index];
    const energyIndex = game.energy.findIndex((cell) => samePos(cell, player.pos));
    if (energyIndex >= 0) {
      player.score += 1;
      collected.push({ playerIndex: index, at: { ...player.pos }, score: 1 });
      game.energy.splice(energyIndex, 1);
    }
  }

  refillEnergy(game);

  game.lastTurn = {
    rotated,
    deliveries,
    jams,
    collected,
    playerIndex: game.currentPlayerIndex,
  };

  game.turn += 1;
  if (game.turn > game.maxTurns) {
    game.status = 'finished';
    game.winners = computeWinners(game.players);
  } else {
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    game.status = 'transition';
  }

  return game.lastTurn;
}

function getIntent(game, player, index) {
  const dir = game.board[player.pos.y][player.pos.x].dir;
  const delta = DELTAS[dir];
  const next = { x: player.pos.x + delta.x, y: player.pos.y + delta.y };
  if (isInside(next)) {
    return { type: 'move', to: next, playerIndex: index };
  }

  if (dir === player.goal && isGoalEdge(player.pos, player.goal)) {
    return { type: 'deliver', playerIndex: index };
  }

  return { type: 'blocked', playerIndex: index };
}

function collectJams(intents) {
  const destinations = new Map();
  intents.forEach((intent) => {
    if (intent.type !== 'move') return;
    const key = posKey(intent.to);
    if (!destinations.has(key)) destinations.set(key, []);
    destinations.get(key).push(intent.playerIndex);
  });

  return [...destinations.entries()]
    .filter(([, players]) => players.length > 1)
    .map(([key, players]) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, players };
    });
}

function createBoard(random) {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      dir: DIRECTIONS[Math.floor(random() * DIRECTIONS.length)],
    })),
  );
}

function refillEnergy(game) {
  while (game.energy.length < ENERGY_COUNT) {
    const cell = randomEmptyCell(game);
    if (!cell) return;
    game.energy.push(cell);
  }
}

function randomEmptyCell(game) {
  const taken = new Set(game.energy.map(posKey).concat(game.players.map((player) => posKey(player.pos))));
  const candidates = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const key = posKey({ x, y });
      if (!taken.has(key)) candidates.push({ x, y });
    }
  }
  if (!candidates.length) return null;
  return candidates[Math.floor(game.random() * candidates.length)];
}

function findRespawnCell(game, preferred, occupied) {
  const queue = [{ ...preferred }];
  const seen = new Set();
  while (queue.length) {
    const cell = queue.shift();
    const key = posKey(cell);
    if (seen.has(key) || !isInside(cell)) continue;
    seen.add(key);
    if (!occupied.has(key)) return cell;
    queue.push(
      { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x - 1, y: cell.y },
    );
  }
  return { ...preferred };
}

function isGoalEdge(pos, goal) {
  return (
    (goal === 'up' && pos.y === 0) ||
    (goal === 'down' && pos.y === BOARD_SIZE - 1) ||
    (goal === 'left' && pos.x === 0) ||
    (goal === 'right' && pos.x === BOARD_SIZE - 1)
  );
}

function isInside(pos) {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
}

function samePos(a, b) {
  return a.x === b.x && a.y === b.y;
}

function posKey(pos) {
  return `${pos.x},${pos.y}`;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
