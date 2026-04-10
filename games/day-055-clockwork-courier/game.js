/**
 * Clockwork Courier - Pure logic module
 */

export const DIRS = {
  'N': { dx: 0, dy: -1 },
  'E': { dx: 1, dy: 0 },
  'S': { dx: 0, dy: 1 },
  'W': { dx: -1, dy: 0 }
};

export function turnLeft(dir) {
  const order = ['N', 'W', 'S', 'E'];
  return order[(order.indexOf(dir) + 1) % 4];
}

export function turnRight(dir) {
  const order = ['N', 'E', 'S', 'W'];
  return order[(order.indexOf(dir) + 1) % 4];
}

export function moveForward({ x, y, dir }) {
  const delta = DIRS[dir];
  return { x: x + delta.dx, y: y + delta.dy, dir };
}

export function getPatrolPos(patrol, step) {
  if (!patrol || !patrol.path || patrol.path.length === 0) return null;
  const len = patrol.path.length;
  return patrol.path[step % len];
}

export function createState(level, program) {
  return {
    robot: { ...level.start },
    collected: new Set(),
    step: 0,
    status: 'running',
    failReason: null,
    level,
    program
  };
}

export function simulateStep(state) {
  if (state.status !== 'running') return state;

  const cmd = state.program[state.step % state.program.length];
  let nextRobot = { ...state.robot };

  if (cmd === 'L') {
    nextRobot.dir = turnLeft(nextRobot.dir);
  } else if (cmd === 'R') {
    nextRobot.dir = turnRight(nextRobot.dir);
  } else if (cmd === 'F') {
    nextRobot = moveForward(nextRobot);
  }

  const nextStep = state.step + 1;
  const nextCollected = new Set(state.collected);

  if (nextRobot.x < 0 || nextRobot.x >= state.level.cols || nextRobot.y < 0 || nextRobot.y >= state.level.rows) {
    return { ...state, robot: nextRobot, step: nextStep, status: 'crashed', failReason: 'wall' };
  }

  if (state.level.walls.some(w => w.x === nextRobot.x && w.y === nextRobot.y)) {
    return { ...state, robot: nextRobot, step: nextStep, status: 'crashed', failReason: 'wall' };
  }

  if (state.level.patrols.some(p => {
    const pos = getPatrolPos(p, nextStep);
    return pos.x === nextRobot.x && pos.y === nextRobot.y;
  })) {
    return { ...state, robot: nextRobot, step: nextStep, status: 'crashed', failReason: 'patrol' };
  }

  state.level.parcels.forEach((p, idx) => {
    if (p.x === nextRobot.x && p.y === nextRobot.y) {
      nextCollected.add(idx);
    }
  });

  if (nextRobot.x === state.level.exit.x && nextRobot.y === state.level.exit.y) {
    if (nextCollected.size === state.level.parcels.length) {
      return { ...state, robot: nextRobot, step: nextStep, collected: nextCollected, status: 'success' };
    }
  }

  if (nextStep >= state.level.maxSteps) {
    return { ...state, robot: nextRobot, step: nextStep, collected: nextCollected, status: 'crashed', failReason: 'timeout' };
  }

  return { ...state, robot: nextRobot, step: nextStep, collected: nextCollected };
}

export function simulateProgram(level, program, stepLimit) {
  let state = createState(level, program);
  for (let i = 0; i < stepLimit; i++) {
    state = simulateStep(state);
    if (state.status !== 'running') break;
  }
  return state;
}

export const LEVELS = [
  {
    id: 1,
    cols: 5, rows: 3,
    start: { x: 0, y: 1, dir: 'E' },
    exit: { x: 4, y: 1 },
    walls: [],
    parcels: [{ x: 2, y: 1 }],
    patrols: [],
    programLength: 4,
    maxSteps: 20,
    solution: ['F', 'F', 'F', 'F'] 
  }
];
