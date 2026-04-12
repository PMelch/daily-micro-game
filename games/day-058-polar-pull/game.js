export const DIRS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export const LEVELS = [
  {
    width: 5,
    height: 5,
    targetMoves: 7,
    grid: [
      'P...#',
      '.m.C.',
      '..#..',
      '.O..E',
      '.....',
    ],
  },
  {
    width: 6,
    height: 5,
    targetMoves: 9,
    grid: [
      'P..#..',
      '.m.C..',
      '..#O..',
      '.C..E.',
      '...m..',
    ],
  },
  {
    width: 6,
    height: 6,
    targetMoves: 11,
    grid: [
      'P....#',
      '.m.C..',
      '..#...',
      '.O..m.',
      '.C.#E.',
      '......',
    ],
  },
  {
    width: 7,
    height: 6,
    targetMoves: 12,
    grid: [
      'P...#..',
      '.m..C..',
      '..#..m.',
      '.O...#.',
      '..C..E.',
      '.......',
    ],
  },
  {
    width: 7,
    height: 7,
    targetMoves: 15,
    grid: [
      'P.....#',
      '.m.C...',
      '..#..m.',
      '.O...#.',
      '..C....',
      '...#..E',
      '.......',
    ],
  },
  {
    width: 8,
    height: 7,
    targetMoves: 18,
    grid: [
      'P....#..',
      '.m.C....',
      '..#..m..',
      '.O...#..',
      '..C...m.',
      '...#..E.',
      '........',
    ],
  },
];

function clone(state) {
  return {
    ...state,
    player: { ...state.player },
    exit: { ...state.exit },
    metals: state.metals.map(m => ({ ...m })),
    collectedCores: new Set(state.collectedCores),
  };
}

function parseGrid(level) {
  const walls = new Set();
  const holes = new Set();
  const cores = new Set();
  const metals = [];
  let player = null;
  let exit = null;

  level.grid.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      const key = `${x},${y}`;
      if (cell === '#') walls.add(key);
      if (cell === 'O') holes.add(key);
      if (cell === 'C') cores.add(key);
      if (cell === 'm') metals.push({ x, y, kind: 'metal' });
      if (cell === 'P') player = { x, y };
      if (cell === 'E') exit = { x, y };
    });
  });

  return { walls, holes, cores, metals, player, exit };
}

export function createState(level, levelIndex = 0) {
  const parsed = parseGrid(level);
  return {
    width: level.width,
    height: level.height,
    targetMoves: level.targetMoves,
    levelIndex,
    walls: parsed.walls,
    holes: parsed.holes,
    cores: parsed.cores,
    collectedCores: new Set(),
    metals: parsed.metals,
    player: parsed.player,
    exit: parsed.exit,
    moves: 0,
    energyUsed: 0,
    won: false,
    coresLeft: parsed.cores.size,
    collected: 0,
  };
}

function key(x, y) {
  return `${x},${y}`;
}

function inBounds(state, x, y) {
  return x >= 0 && y >= 0 && x < state.width && y < state.height;
}

function isBlocked(state, x, y) {
  return !inBounds(state, x, y) || state.walls.has(key(x, y)) || state.metals.some(m => m.x === x && m.y === y);
}

export function getTile(state, x, y) {
  if (state.walls.has(key(x, y))) return 'wall';
  if (state.holes.has(key(x, y))) return 'hole';
  if (state.exit.x === x && state.exit.y === y) return 'exit';
  if (state.cores.has(key(x, y)) && !state.collectedCores.has(key(x, y))) return 'core';
  return 'floor';
}

function collectIfNeeded(state) {
  const tileKey = key(state.player.x, state.player.y);
  if (state.cores.has(tileKey) && !state.collectedCores.has(tileKey)) {
    state.collectedCores.add(tileKey);
    state.collected += 1;
    state.coresLeft -= 1;
  }
  state.won = isWon(state);
  return state;
}

export function movePlayer(state, dirName) {
  const dir = DIRS[dirName];
  const next = clone(state);
  const x = next.player.x + dir.x;
  const y = next.player.y + dir.y;
  if (isBlocked(next, x, y)) return next;
  next.player = { x, y };
  next.moves += 1;
  return collectIfNeeded(next);
}

function getFirstMetalInLine(state, dir) {
  let x = state.player.x + dir.x;
  let y = state.player.y + dir.y;
  while (inBounds(state, x, y) && !state.walls.has(key(x, y))) {
    const metal = state.metals.find(m => m.x === x && m.y === y);
    if (metal) return metal;
    x += dir.x;
    y += dir.y;
  }
  return null;
}

export function pulse(state, dirName, mode) {
  const dir = DIRS[dirName];
  const next = clone(state);
  const metal = getFirstMetalInLine(next, dir);
  next.energyUsed += 1;
  if (!metal) return next;

  const delta = mode === 'attract' ? { x: -dir.x, y: -dir.y } : dir;
  const targetX = metal.x + delta.x;
  const targetY = metal.y + delta.y;

  if (!inBounds(next, targetX, targetY) || next.walls.has(key(targetX, targetY))) return next;
  if (targetX === next.player.x && targetY === next.player.y) return next;
  if (next.metals.some(m => m !== metal && m.x === targetX && m.y === targetY)) return next;

  if (next.holes.has(key(targetX, targetY))) {
    next.metals = next.metals.filter(m => m !== metal);
    return next;
  }

  metal.x = targetX;
  metal.y = targetY;
  return next;
}

export function isWon(state) {
  return state.coresLeft === 0 && state.player.x === state.exit.x && state.player.y === state.exit.y;
}
