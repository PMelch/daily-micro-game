export const LEVELS = [
  {
    id: 1,
    key: 'level1',
    name: 'Warm Echo',
    echoLimit: 1,
    maxSteps: 8,
    map: [
      '########',
      '#S.....#',
      '#..P...#',
      '#...D.E#',
      '########',
    ],
  },
  {
    id: 2,
    key: 'level2',
    name: 'Double Duty',
    echoLimit: 2,
    maxSteps: 9,
    map: [
      '########',
      '#S.....#',
      '#..P...#',
      '#......#',
      '#..PDE.#',
      '########',
    ],
  },
  {
    id: 3,
    key: 'level3',
    name: 'Cross Hall',
    echoLimit: 2,
    maxSteps: 10,
    map: [
      '#########',
      '#S....P.#',
      '#.###...#',
      '#...#...#',
      '#.P.D.E.#',
      '#########',
    ],
  },
  {
    id: 4,
    key: 'level4',
    name: 'Late Shift',
    echoLimit: 3,
    maxSteps: 11,
    map: [
      '#########',
      '#S..#..P#',
      '#...#...#',
      '#.P...#.#',
      '#...D.EP#',
      '#########',
    ],
  },
  {
    id: 5,
    key: 'level5',
    name: 'Triple Lock',
    echoLimit: 3,
    maxSteps: 12,
    map: [
      '##########',
      '#S....#P.#',
      '#.##.....#',
      '#..P.#...#',
      '#....D.EP#',
      '##########',
    ],
  },
];

function findTiles(map, target) {
  const matches = [];
  map.forEach((row, y) => {
    [...row].forEach((tile, x) => {
      if (tile === target) matches.push({ x, y });
    });
  });
  return matches;
}

function prepareLevel(level) {
  return {
    ...level,
    width: level.map[0].length,
    height: level.map.length,
    start: findTiles(level.map, 'S')[0],
    exit: findTiles(level.map, 'E')[0],
    plates: findTiles(level.map, 'P'),
    doors: findTiles(level.map, 'D'),
  };
}

function tileAt(level, position) {
  if (!position || position.y < 0 || position.y >= level.height || position.x < 0 || position.x >= level.width) {
    return '#';
  }
  return level.map[position.y][position.x];
}

function samePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}

function countActivePlates(level, actors) {
  return level.plates.filter((plate) => actors.some((actor) => samePosition(actor, plate))).length;
}

function isDoorOpen(level, actors) {
  return level.plates.length > 0 && countActivePlates(level, actors) === level.plates.length;
}

function nextPosition(position, command) {
  switch (command) {
    case 'up': return { x: position.x, y: position.y - 1 };
    case 'down': return { x: position.x, y: position.y + 1 };
    case 'left': return { x: position.x - 1, y: position.y };
    case 'right': return { x: position.x + 1, y: position.y };
    default: return { ...position };
  }
}

function moveActor(level, position, command, doorOpen) {
  const candidate = nextPosition(position, command);
  const tile = tileAt(level, candidate);
  if (tile === '#') return { ...position };
  if (tile === 'D' && !doorOpen) return { ...position };
  return candidate;
}

function makeEchoes(level, savedEchoes) {
  return savedEchoes.map((commands) => ({
    commands: [...commands],
    index: 0,
    position: { ...level.start },
  }));
}

function deriveState(state) {
  const actors = [state.player, ...state.echoes.map((echo) => echo.position)];
  return {
    ...state,
    platesActive: countActivePlates(state.level, actors),
    doorOpen: isDoorOpen(state.level, actors),
  };
}

export function createGameState(levelInput) {
  const level = prepareLevel(levelInput);
  return deriveState({
    level,
    savedEchoes: [],
    echoes: [],
    currentPath: [],
    player: { ...level.start },
    stepsUsed: 0,
    status: 'running',
    message: '',
  });
}

export function resetRun(state) {
  const next = {
    ...state,
    echoes: makeEchoes(state.level, state.savedEchoes),
    currentPath: [],
    player: { ...state.level.start },
    stepsUsed: 0,
    status: 'running',
    message: '',
  };
  return deriveState(next);
}

export function clearEchoes(state) {
  const next = {
    ...state,
    savedEchoes: [],
    echoes: [],
    currentPath: [],
    player: { ...state.level.start },
    stepsUsed: 0,
    status: 'running',
    message: '',
  };
  return deriveState(next);
}

export function saveEcho(state) {
  if (!state.currentPath.length || state.savedEchoes.length >= state.level.echoLimit) {
    return state;
  }
  return resetRun({
    ...state,
    savedEchoes: [...state.savedEchoes, [...state.currentPath]],
  });
}

export function stepRun(state, command) {
  if (state.status !== 'running' || state.stepsUsed >= state.level.maxSteps) {
    return state;
  }

  const doorOpenBefore = state.doorOpen;
  const echoes = state.echoes.map((echo) => {
    const stepCommand = echo.commands[echo.index] || 'wait';
    const next = moveActor(state.level, echo.position, stepCommand, doorOpenBefore);
    return {
      ...echo,
      index: Math.min(echo.index + 1, echo.commands.length),
      position: next,
    };
  });

  const player = moveActor(state.level, state.player, command, doorOpenBefore);
  let next = deriveState({
    ...state,
    echoes,
    player,
    currentPath: [...state.currentPath, command],
    stepsUsed: state.stepsUsed + 1,
  });

  if (samePosition(next.player, next.level.exit)) {
    next = {
      ...next,
      status: 'won',
      message: 'won',
    };
  } else if (next.stepsUsed >= next.level.maxSteps) {
    next = {
      ...next,
      status: 'limit',
      message: 'limit',
    };
  }

  return next;
}
