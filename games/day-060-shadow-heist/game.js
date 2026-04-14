export const LEVELS = [
  {
    width: 3,
    height: 2,
    lureCharges: 2,
    par: 3,
    grid: [
      'PK.',
      '..E',
    ],
    guards: [],
  },
  {
    width: 6,
    height: 5,
    lureCharges: 2,
    par: 8,
    grid: [
      'P...#.',
      '.#...#',
      '.K.G.E',
      '.#...#',
      '......',
    ],
    guards: [
      { x: 3, y: 2, patrol: [{ x: 3, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 2 }] },
    ],
  },
  {
    width: 7,
    height: 6,
    lureCharges: 3,
    par: 11,
    grid: [
      'P..#...',
      '.#...#.',
      '..G.K..',
      '.###.#.',
      '...#..E',
      '.......',
    ],
    guards: [
      { x: 2, y: 2, patrol: [{ x: 2, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 5 }, { x: 2, y: 5 }] },
    ],
  },
  {
    width: 7,
    height: 7,
    lureCharges: 3,
    par: 13,
    grid: [
      'P...#..',
      '.###.#.',
      '.K..#..',
      '.#..G..',
      '.#.#.#.',
      '...#..E',
      '.......',
    ],
    guards: [
      { x: 4, y: 3, patrol: [{ x: 4, y: 3 }, { x: 6, y: 3 }, { x: 6, y: 0 }, { x: 4, y: 0 }] },
      { x: 0, y: 5, patrol: [{ x: 0, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 0, y: 6 }] },
    ],
  },
  {
    width: 8,
    height: 7,
    lureCharges: 4,
    par: 16,
    grid: [
      'P....#..',
      '.###.#..',
      '.K...#..',
      '.#.G.#..',
      '.#...#..',
      '.###...E',
      '........',
    ],
    guards: [
      { x: 3, y: 3, patrol: [{ x: 3, y: 3 }, { x: 3, y: 6 }, { x: 7, y: 6 }, { x: 7, y: 3 }] },
      { x: 6, y: 1, patrol: [{ x: 6, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 4 }, { x: 6, y: 4 }] },
    ],
  },
];

const DELTAS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

function cloneGuard(guard) {
  return {
    x: guard.x,
    y: guard.y,
    patrol: guard.patrol.map((step) => ({ ...step })),
    patrolIndex: guard.patrolIndex ?? 0,
  };
}

export function createState(level, levelIndex = 0) {
  const walls = new Set();
  let player = { x: 0, y: 0 };
  let exit = { x: 0, y: 0 };
  let keycard = null;

  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const cell = level.grid[y][x];
      const key = `${x},${y}`;
      if (cell === '#') walls.add(key);
      if (cell === 'P') player = { x, y };
      if (cell === 'E') exit = { x, y };
      if (cell === 'K') keycard = { x, y };
    }
  }

  return {
    width: level.width,
    height: level.height,
    par: level.par ?? 0,
    levelIndex,
    player,
    exit,
    keycard,
    walls,
    hasKey: false,
    guards: (level.guards || []).map(cloneGuard),
    lureCharges: level.lureCharges ?? 0,
    moves: 0,
    alarm: false,
    won: false,
    lastAction: 'start',
    lure: null,
  };
}

function isInside(state, x, y) {
  return x >= 0 && y >= 0 && x < state.width && y < state.height;
}

function isWall(state, x, y) {
  return state.walls.has(`${x},${y}`);
}

function samePos(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

function cloneState(state) {
  return {
    ...state,
    player: { ...state.player },
    exit: { ...state.exit },
    keycard: state.keycard ? { ...state.keycard } : null,
    guards: state.guards.map(cloneGuard),
    lure: state.lure ? { ...state.lure } : null,
  };
}

function guardDirection(guard) {
  const target = guard.patrol[(guard.patrolIndex + 1) % guard.patrol.length] ?? guard.patrol[0] ?? { x: guard.x, y: guard.y };
  const dx = Math.sign(target.x - guard.x);
  const dy = Math.sign(target.y - guard.y);
  if (dx === 0 && dy === 0) return { x: 1, y: 0 };
  if (Math.abs(target.x - guard.x) >= Math.abs(target.y - guard.y)) return { x: dx, y: 0 };
  return { x: 0, y: dy };
}

function canStand(state, x, y) {
  return isInside(state, x, y) && !isWall(state, x, y);
}

function stepToward(start, target) {
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  if (Math.abs(dx) >= Math.abs(dy)) return { x: Math.sign(dx), y: 0 };
  return { x: 0, y: Math.sign(dy) };
}

function hasClearLine(state, from, to) {
  if (from.x !== to.x && from.y !== to.y) return false;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x + dx;
  let y = from.y + dy;
  while (x !== to.x || y !== to.y) {
    if (isWall(state, x, y)) return false;
    x += dx;
    y += dy;
  }
  return true;
}

function moveGuards(state, lureTarget = null) {
  const next = cloneState(state);
  next.guards = next.guards.map((guard) => {
    let delta = null;
    if (lureTarget && hasClearLine(next, guard, lureTarget) && Math.abs(lureTarget.x - guard.x) + Math.abs(lureTarget.y - guard.y) <= 4) {
      delta = stepToward(guard, lureTarget);
    } else {
      delta = guardDirection(guard);
    }

    const candidate = { x: guard.x + delta.x, y: guard.y + delta.y };
    if (canStand(next, candidate.x, candidate.y)) {
      guard.x = candidate.x;
      guard.y = candidate.y;
    }

    const patrolTarget = guard.patrol[(guard.patrolIndex + 1) % guard.patrol.length];
    if (patrolTarget && samePos(guard, patrolTarget)) {
      guard.patrolIndex = (guard.patrolIndex + 1) % guard.patrol.length;
    }
    return guard;
  });
  return next;
}

export function getGuardVision(state) {
  const tiles = [];
  for (const guard of state.guards) {
    const dir = guardDirection(guard);
    const dirs = [dir, { x: -dir.x, y: -dir.y }];
    for (const viewDir of dirs) {
      let x = guard.x + viewDir.x;
      let y = guard.y + viewDir.y;
      while (isInside(state, x, y) && !isWall(state, x, y)) {
        tiles.push({ x, y });
        x += viewDir.x;
        y += viewDir.y;
      }
    }
  }
  return tiles;
}

function refreshState(state) {
  const next = cloneState(state);
  if (next.keycard && samePos(next.player, next.keycard)) {
    next.hasKey = true;
    next.keycard = null;
  }
  const vision = getGuardVision(next);
  next.alarm = next.guards.some((guard) => samePos(guard, next.player)) || vision.some((tile) => samePos(tile, next.player));
  next.won = Boolean(next.hasKey && samePos(next.player, next.exit) && !next.alarm);
  return next;
}

export function movePlayer(state, dir) {
  if (state.alarm || state.won) return state;
  const next = cloneState(state);
  const delta = DELTAS[dir];
  const candidate = { x: next.player.x + delta.x, y: next.player.y + delta.y };
  if (!canStand(next, candidate.x, candidate.y)) return state;
  next.player = candidate;
  next.moves += 1;
  next.lastAction = `move-${dir}`;
  const immediate = refreshState(next);
  if (immediate.alarm || immediate.won) return immediate;
  return refreshState(moveGuards(immediate));
}

export function throwLure(state, x, y) {
  if (state.alarm || state.won || state.lureCharges <= 0) return state;
  if (!canStand(state, x, y)) return state;
  const next = cloneState(state);
  next.lureCharges -= 1;
  next.lure = { x, y };
  next.lastAction = 'lure';
  return refreshState(moveGuards(next, { x, y }));
}

export function isWon(state) {
  return state.won;
}

export function getTile(state, x, y) {
  if (isWall(state, x, y)) return 'wall';
  if (samePos(state.exit, { x, y })) return 'exit';
  if (state.keycard && samePos(state.keycard, { x, y })) return 'keycard';
  return 'floor';
}
