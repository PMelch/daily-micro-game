export const BOARD_SIZE = 6;
export const COMMANDS = {
  FORWARD: 'forward',
  LEFT: 'left',
  RIGHT: 'right',
  WAIT: 'wait',
  DASH: 'dash',
};

const FACINGS = ['N', 'E', 'S', 'W'];
const STARTS = [
  { x: 0, y: 0, facing: 'E' },
  { x: BOARD_SIZE - 1, y: 0, facing: 'S' },
  { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1, facing: 'W' },
  { x: 0, y: BOARD_SIZE - 1, facing: 'N' },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function posKey(pos) {
  return `${pos.x},${pos.y}`;
}

export function turnLeft(facing) {
  return FACINGS[(FACINGS.indexOf(facing) + 3) % 4];
}

export function turnRight(facing) {
  return FACINGS[(FACINGS.indexOf(facing) + 1) % 4];
}

export function movePosition(position, facing, steps = 1) {
  let { x, y } = position;
  for (let i = 0; i < steps; i += 1) {
    if (facing === 'N') y = clamp(y - 1, 0, BOARD_SIZE - 1);
    if (facing === 'E') x = clamp(x + 1, 0, BOARD_SIZE - 1);
    if (facing === 'S') y = clamp(y + 1, 0, BOARD_SIZE - 1);
    if (facing === 'W') x = clamp(x - 1, 0, BOARD_SIZE - 1);
  }
  return { x, y };
}

export function createRoundPickups(playerCount, round) {
  const forbidden = new Set(STARTS.slice(0, playerCount).map(posKey));
  const pickups = [];
  let cursor = round * 3;
  while (pickups.length < 3) {
    const x = cursor % BOARD_SIZE;
    const y = Math.floor(cursor / BOARD_SIZE) % BOARD_SIZE;
    const key = `${x},${y}`;
    if (!forbidden.has(key) && !pickups.some(p => p.x === x && p.y === y)) {
      pickups.push({ x, y, value: 1 });
    }
    cursor += 5;
  }
  return pickups;
}

export function createGameState(playerNames) {
  return {
    phase: 'name-entry',
    round: 1,
    maxRounds: 6,
    players: playerNames.map((name, index) => ({
      id: index,
      name,
      position: { x: STARTS[index].x, y: STARTS[index].y },
      facing: STARTS[index].facing,
      queue: [],
      score: 0,
      stunned: 0,
    })),
    pickups: createRoundPickups(playerNames.length, 1),
    replay: [],
  };
}

export function queueCommand(state, playerIndex, command) {
  if (!Object.values(COMMANDS).includes(command)) return state;
  return {
    ...state,
    players: state.players.map((player, index) => {
      if (index !== playerIndex || player.queue.length >= 3) return player;
      return { ...player, queue: [...player.queue, command] };
    }),
  };
}

export function allCommandsQueued(state) {
  return state.players.every(player => player.queue.length === 3);
}

function commandSteps(command) {
  if (command === COMMANDS.DASH) return 2;
  if (command === COMMANDS.FORWARD) return 1;
  return 0;
}

function collectPickups(players, pickups) {
  let remaining = [...pickups];
  const updatedPlayers = players.map(player => {
    const found = remaining.find(p => p.x === player.position.x && p.y === player.position.y);
    if (!found) return player;
    remaining = remaining.filter(p => !(p.x === found.x && p.y === found.y));
    return { ...player, score: player.score + found.value };
  });
  return { players: updatedPlayers, pickups: remaining };
}

export function resolveRound(state) {
  let players = state.players.map(player => ({ ...player, position: { ...player.position }, queue: [...player.queue] }));
  const replay = [];

  for (let stepIndex = 0; stepIndex < 3; stepIndex += 1) {
    const intents = players.map(player => {
      const command = player.queue[stepIndex] || COMMANDS.WAIT;
      if (player.stunned > 0) {
        return { type: 'stunned', command };
      }
      if (command === COMMANDS.LEFT) return { type: 'turn', facing: turnLeft(player.facing), command };
      if (command === COMMANDS.RIGHT) return { type: 'turn', facing: turnRight(player.facing), command };
      const steps = commandSteps(command);
      return { type: 'move', position: movePosition(player.position, player.facing, steps), command };
    });

    players = players.map((player, index) => {
      const intent = intents[index];
      if (intent.type === 'stunned') return player;
      if (intent.type === 'turn') return { ...player, facing: intent.facing };
      return { ...player, nextPosition: intent.position };
    });

    const counts = new Map();
    players.forEach(player => {
      const target = player.nextPosition || player.position;
      const key = posKey(target);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const swapCollisions = new Set();
    for (let i = 0; i < players.length; i += 1) {
      for (let j = i + 1; j < players.length; j += 1) {
        const a = players[i];
        const b = players[j];
        if (!a.nextPosition || !b.nextPosition) continue;
        const aSwaps = a.nextPosition.x === b.position.x && a.nextPosition.y === b.position.y;
        const bSwaps = b.nextPosition.x === a.position.x && b.nextPosition.y === a.position.y;
        if (aSwaps && bSwaps) {
          swapCollisions.add(i);
          swapCollisions.add(j);
        }
      }
    }

    players = players.map((player, index) => {
      if (!player.nextPosition) return player;
      const key = posKey(player.nextPosition);
      if (counts.get(key) > 1 || swapCollisions.has(index)) {
        const { nextPosition, ...rest } = player;
        return { ...rest, stunned: 1 };
      }
      const { nextPosition, ...rest } = player;
      return { ...rest, position: nextPosition };
    });

    const collected = collectPickups(players, state.pickups);
    players = collected.players;
    state = { ...state, pickups: collected.pickups };
    replay.push(players.map(p => ({ position: { ...p.position }, facing: p.facing, score: p.score, stunned: p.stunned })));
  }

  return {
    ...state,
    round: state.round + 1,
    phase: state.round + 1 > state.maxRounds ? 'game-over' : 'planning',
    players: players.map(player => ({ ...player, queue: [] })),
    pickups: state.pickups,
    replay,
  };
}

export function getWinners(state) {
  const best = Math.max(...state.players.map(player => player.score));
  return state.players.filter(player => player.score === best);
}
