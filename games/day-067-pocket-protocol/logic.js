(function (global) {
const DIRECTIONS = ['up', 'right', 'down', 'left'];

function facingVector(direction) {
  if (direction === 'up') return { x: 0, y: -1 };
  if (direction === 'right') return { x: 1, y: 0 };
  if (direction === 'down') return { x: 0, y: 1 };
  return { x: -1, y: 0 };
}

function rotate(direction, turn) {
  const index = DIRECTIONS.indexOf(direction);
  const delta = turn === 'left' ? -1 : 1;
  return DIRECTIONS[(index + delta + DIRECTIONS.length) % DIRECTIONS.length];
}

function keyOf(point) {
  return `${point.x},${point.y}`;
}

function cloneState(state) {
  return {
    width: state.width,
    height: state.height,
    start: { ...state.start },
    bot: { ...state.bot },
    facing: state.facing,
    exit: { ...state.exit },
    walls: state.walls.map((wall) => ({ ...wall })),
    wallSet: new Set(state.wallSet),
    dataNodes: state.dataNodes.map((node) => ({ ...node })),
    dataSet: new Set(state.dataSet),
    collected: new Set(state.collected),
    sentries: state.sentries.map((sentry) => ({ path: sentry.path.map((step) => ({ ...step })) })),
    sentryStep: state.sentryStep,
    tick: state.tick,
  };
}

function createLevelState(level) {
  const state = {
    width: level.width,
    height: level.height,
    start: { ...level.start },
    bot: { ...level.start },
    facing: level.facing || 'right',
    exit: { ...level.exit },
    walls: (level.walls || []).map((wall) => ({ ...wall })),
    wallSet: new Set((level.walls || []).map(keyOf)),
    dataNodes: (level.dataNodes || []).map((node) => ({ ...node })),
    dataSet: new Set((level.dataNodes || []).map(keyOf)),
    collected: new Set(),
    sentries: (level.sentries || []).map((sentry) => ({ path: sentry.path.map((step) => ({ ...step })) })),
    sentryStep: 0,
    tick: 0,
  };
  collectNode(state, state.bot);
  return state;
}

function isInside(state, point) {
  return point.x >= 0 && point.y >= 0 && point.x < state.width && point.y < state.height;
}

function isBlocked(state, point) {
  return !isInside(state, point) || state.wallSet.has(keyOf(point));
}

function collectNode(state, point) {
  const key = keyOf(point);
  if (state.dataSet.has(key)) state.collected.add(key);
}

function moveForward(state) {
  const vector = facingVector(state.facing);
  const next = { x: state.bot.x + vector.x, y: state.bot.y + vector.y };
  if (!isBlocked(state, next)) state.bot = next;
  collectNode(state, state.bot);
}

function dashForward(state) {
  const vector = facingVector(state.facing);
  while (true) {
    const next = { x: state.bot.x + vector.x, y: state.bot.y + vector.y };
    if (isBlocked(state, next)) break;
    state.bot = next;
    collectNode(state, state.bot);
  }
}

function moveSentries(state) {
  state.sentryStep += 1;
}

function sentryPositions(state) {
  return state.sentries.map((sentry) => {
    if (!sentry.path.length) return null;
    return sentry.path[state.sentryStep % sentry.path.length];
  }).filter(Boolean);
}

function hasSentryCollision(state) {
  return sentryPositions(state).some((pos) => pos.x === state.bot.x && pos.y === state.bot.y);
}

function runCommand(inputState, command) {
  const state = cloneState(inputState);
  if (command === 'left' || command === 'right') {
    state.facing = rotate(state.facing, command);
  } else if (command === 'forward') {
    moveForward(state);
  } else if (command === 'dash') {
    dashForward(state);
  }
  state.tick += 1;
  moveSentries(state);
  return state;
}

function isSuccess(state) {
  return state.collected.size === state.dataSet.size && state.bot.x === state.exit.x && state.bot.y === state.exit.y;
}

function simulateProgram(level, program, maxTicks = 12) {
  let state = createLevelState(level);
  const history = [cloneState(state)];
  for (let tick = 0; tick < maxTicks; tick += 1) {
    const command = program[tick % program.length] || 'wait';
    state = runCommand(state, command);
    history.push(cloneState(state));
    if (hasSentryCollision(state)) {
      return { status: 'caught', reason: 'sentry', final: state, history };
    }
    if (isSuccess(state)) {
      return { status: 'success', reason: 'exit', final: state, history };
    }
  }
  return { status: 'incomplete', reason: 'ticks', final: state, history };
}

const api = { DIRECTIONS, createLevelState, runCommand, simulateProgram, facingVector, sentryPositions };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
Object.assign(global, api);
})(typeof window !== 'undefined' ? window : globalThis);
