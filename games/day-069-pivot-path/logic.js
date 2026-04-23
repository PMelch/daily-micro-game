(function (global) {
const DIRS = ['up', 'right', 'down', 'left'];
const VECTORS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

function cloneLevel(level) {
  return {
    ...level,
    grid: level.grid.map((row) => row.map((cell) => ({ ...cell }))),
    start: { ...level.start },
    exit: { ...level.exit },
    stamps: level.stamps.map((stamp) => ({ ...stamp })),
  };
}

function createLevelState(level) {
  const copy = cloneLevel(level);
  const state = {
    id: copy.id,
    nameKey: copy.nameKey,
    width: copy.width,
    height: copy.height,
    grid: copy.grid,
    start: copy.start,
    exit: copy.exit,
    parcel: { ...copy.start },
    stamps: copy.stamps,
    collected: new Set(),
    steps: 0,
    status: 'ready',
    trail: [keyOf(copy.start)],
    par: copy.par,
  };
  collectStamp(state, state.parcel);
  return state;
}

function keyOf(point) {
  return `${point.x},${point.y}`;
}

function getCell(state, point) {
  if (point.x < 0 || point.y < 0 || point.x >= state.width || point.y >= state.height) return null;
  return state.grid[point.y][point.x];
}

function rotateDir(dir) {
  const index = DIRS.indexOf(dir);
  return DIRS[(index + 1) % DIRS.length];
}

function rotateCell(state, point) {
  const cell = getCell(state, point);
  if (!cell || cell.locked) return false;
  cell.dir = rotateDir(cell.dir);
  return true;
}

function collectStamp(state, point) {
  const found = state.stamps.find((stamp) => stamp.x === point.x && stamp.y === point.y);
  if (found) state.collected.add(keyOf(found));
}

function allStampsCollected(state) {
  return state.collected.size === state.stamps.length;
}

function advance(state) {
  if (state.status === 'success' || state.status === 'crash') return state;
  const cell = getCell(state, state.parcel);
  if (!cell) {
    state.status = 'crash';
    return state;
  }
  const vector = VECTORS[cell.dir];
  const next = { x: state.parcel.x + vector.x, y: state.parcel.y + vector.y };
  state.steps += 1;
  if (!getCell(state, next)) {
    state.status = 'crash';
    return state;
  }
  state.parcel = next;
  state.trail.push(keyOf(next));
  collectStamp(state, next);
  if (next.x === state.exit.x && next.y === state.exit.y && allStampsCollected(state)) {
    state.status = 'success';
  } else {
    state.status = 'running';
  }
  return state;
}

function applyTurn(inputState, action) {
  const state = serializeState(inputState);
  const next = deserializeState(state);
  if (action && action.type === 'rotate') {
    rotateCell(next, action.point);
  }
  advance(next);
  return next;
}

function serializeState(state) {
  return {
    ...state,
    grid: state.grid.map((row) => row.map((cell) => ({ ...cell }))),
    start: { ...state.start },
    exit: { ...state.exit },
    parcel: { ...state.parcel },
    stamps: state.stamps.map((stamp) => ({ ...stamp })),
    collected: [...state.collected],
    trail: [...state.trail],
  };
}

function deserializeState(snapshot) {
  return {
    ...snapshot,
    grid: snapshot.grid.map((row) => row.map((cell) => ({ ...cell }))),
    start: { ...snapshot.start },
    exit: { ...snapshot.exit },
    parcel: { ...snapshot.parcel },
    stamps: snapshot.stamps.map((stamp) => ({ ...stamp })),
    collected: new Set(snapshot.collected),
    trail: [...snapshot.trail],
  };
}

function scoreLevel(state) {
  const slack = Math.max(0, (state.par || state.steps) - state.steps);
  return {
    stars: state.status === 'success' ? (slack >= 2 ? 3 : slack >= 1 ? 2 : 1) : 0,
    slack,
  };
}

const LEVELS = [
  {
    id: 1,
    nameKey: 'level1',
    width: 4,
    height: 4,
    start: { x: 0, y: 0 },
    exit: { x: 3, y: 3 },
    par: 6,
    stamps: [{ x: 1, y: 0 }, { x: 2, y: 2 }],
    grid: [
      [{ dir: 'right', locked: true }, { dir: 'right', locked: true }, { dir: 'down', locked: true }, { dir: 'left', locked: true }],
      [{ dir: 'up', locked: false }, { dir: 'left', locked: false }, { dir: 'down', locked: true }, { dir: 'left', locked: false }],
      [{ dir: 'up', locked: false }, { dir: 'right', locked: false }, { dir: 'right', locked: true }, { dir: 'down', locked: true }],
      [{ dir: 'up', locked: false }, { dir: 'right', locked: false }, { dir: 'right', locked: false }, { dir: 'left', locked: true }],
    ],
  },
  {
    id: 2,
    nameKey: 'level2',
    width: 4,
    height: 4,
    start: { x: 0, y: 1 },
    exit: { x: 3, y: 0 },
    par: 7,
    stamps: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
    grid: [
      [{ dir: 'right', locked: false }, { dir: 'down', locked: false }, { dir: 'right', locked: false }, { dir: 'left', locked: true }],
      [{ dir: 'right', locked: true }, { dir: 'down', locked: true }, { dir: 'left', locked: false }, { dir: 'up', locked: false }],
      [{ dir: 'up', locked: false }, { dir: 'right', locked: false }, { dir: 'up', locked: true }, { dir: 'left', locked: false }],
      [{ dir: 'up', locked: false }, { dir: 'right', locked: false }, { dir: 'right', locked: false }, { dir: 'up', locked: false }],
    ],
  },
  {
    id: 3,
    nameKey: 'level3',
    width: 5,
    height: 4,
    start: { x: 0, y: 3 },
    exit: { x: 4, y: 0 },
    par: 9,
    stamps: [{ x: 1, y: 3 }, { x: 2, y: 1 }, { x: 4, y: 1 }],
    grid: [
      [{ dir: 'right', locked: false }, { dir: 'right', locked: false }, { dir: 'down', locked: false }, { dir: 'right', locked: false }, { dir: 'left', locked: true }],
      [{ dir: 'up', locked: false }, { dir: 'right', locked: false }, { dir: 'right', locked: true }, { dir: 'right', locked: false }, { dir: 'up', locked: true }],
      [{ dir: 'up', locked: false }, { dir: 'left', locked: false }, { dir: 'down', locked: false }, { dir: 'up', locked: false }, { dir: 'left', locked: false }],
      [{ dir: 'right', locked: true }, { dir: 'right', locked: true }, { dir: 'up', locked: true }, { dir: 'left', locked: false }, { dir: 'up', locked: false }],
    ],
  },
];

const api = {
  DIRS,
  LEVELS,
  keyOf,
  createLevelState,
  rotateCell,
  advance,
  applyTurn,
  scoreLevel,
  serializeState,
  deserializeState,
  allStampsCollected,
};

if (typeof module !== 'undefined' && module.exports) module.exports = api;
Object.assign(global, api);
})(typeof window !== 'undefined' ? window : globalThis);
