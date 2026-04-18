const ROLE_ORDER = ['up', 'right', 'down', 'left', 'scan', 'stun'];

const LEVELS = [
  {
    grid: [
      '#########',
      '#S..#..E#',
      '#.#.#.#.#',
      '#.#...#.#',
      '#.###.#.#',
      '#...C...#',
      '#.#.#.#.#',
      '#..C#...#',
      '#########',
    ],
    sentries: [{ x: 5, y: 5, dir: 1, range: 2 }],
  },
  {
    grid: [
      '#########',
      '#S..#..E#',
      '#.#.#.#.#',
      '#..C..#.#',
      '###.#.#.#',
      '#...#...#',
      '#.#.#.#.#',
      '#..C....#',
      '#########',
    ],
    sentries: [{ x: 3, y: 5, dir: 0, range: 2 }, { x: 6, y: 3, dir: 2, range: 2 }],
  },
];

function key(x, y) { return `${x},${y}`; }

function parseLevel(level) {
  const cores = new Set();
  let start = { x: 1, y: 1 };
  let exit = { x: 7, y: 1 };
  const grid = level.grid.map((row, y) => row.split('').map((cell, x) => {
    if (cell === 'S') { start = { x, y }; return '.'; }
    if (cell === 'E') { exit = { x, y }; return '.'; }
    if (cell === 'C') { cores.add(key(x, y)); return '.'; }
    return cell;
  }));
  return { grid, start, exit, cores, sentries: level.sentries.map(s => ({ ...s, disabledTicks: 0 })) };
}

export function createRoomState(code) {
  return {
    code,
    phase: 'lobby',
    players: [],
    hostId: null,
    levelIndex: -1,
    grid: [],
    drone: { x: 0, y: 0 },
    exit: { x: 0, y: 0 },
    cores: new Set(),
    revealed: new Set(),
    sentries: [],
    lastEvent: '',
    ticks: 0,
  };
}

export function addPlayer(room, player) {
  room.players.push({ ...player, role: null, score: 0 });
  if (!room.hostId) room.hostId = player.id;
}

export function assignRoles(playerIds) {
  const map = {};
  playerIds.forEach((id, index) => {
    map[id] = ROLE_ORDER[index] || ROLE_ORDER[4 + ((index - 4) % 2)];
  });
  return map;
}

function revealAround(room, cx, cy, radius = 1) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (room.grid[y]?.[x]) room.revealed.add(key(x, y));
    }
  }
}

function loadLevel(room, index) {
  const parsed = parseLevel(LEVELS[index]);
  room.levelIndex = index;
  room.grid = parsed.grid;
  room.drone = { ...parsed.start };
  room.exit = { ...parsed.exit };
  room.cores = parsed.cores;
  room.sentries = parsed.sentries;
  room.revealed = new Set();
  revealAround(room, room.drone.x, room.drone.y, 1);
  room.lastEvent = 'Level start';
}

export function startMatch(room) {
  const roleMap = assignRoles(room.players.map(p => p.id));
  room.players = room.players.map(p => ({ ...p, role: roleMap[p.id], score: 0 }));
  room.phase = 'playing';
  loadLevel(room, 0);
}

function canMove(room, x, y) {
  return room.grid[y]?.[x] && room.grid[y][x] !== '#';
}

function stepSentries(room) {
  room.sentries.forEach(s => {
    if (s.disabledTicks > 0) { s.disabledTicks--; return; }
    const dirs = [[0,-1],[1,0],[0,1],[-1,0]];
    const [dx, dy] = dirs[s.dir];
    const nx = s.x + dx;
    const ny = s.y + dy;
    if (canMove(room, nx, ny)) {
      s.x = nx; s.y = ny;
    } else {
      s.dir = (s.dir + 2) % 4;
    }
  });
}

function maybeCollectCore(room) {
  if (room.cores.delete(key(room.drone.x, room.drone.y))) {
    room.players.forEach(p => p.score += 1);
    room.lastEvent = 'Core collected';
  }
}

function checkLoss(room) {
  const hit = room.sentries.some(s => s.disabledTicks === 0 && s.x === room.drone.x && s.y === room.drone.y);
  if (hit) {
    loadLevel(room, room.levelIndex);
    room.lastEvent = 'Sentry hit, level reset';
    return true;
  }
  return false;
}

export function applyAction(room, playerId, action) {
  if (room.phase !== 'playing') return { ok: false };
  const player = room.players.find(p => p.id === playerId);
  if (!player || player.role !== action) return { ok: false, reason: 'wrong-role' };

  const dirs = { up: [0,-1], right: [1,0], down: [0,1], left: [-1,0] };
  if (dirs[action]) {
    const [dx, dy] = dirs[action];
    const nx = room.drone.x + dx;
    const ny = room.drone.y + dy;
    if (canMove(room, nx, ny)) {
      room.drone.x = nx;
      room.drone.y = ny;
      revealAround(room, nx, ny, 1);
      maybeCollectCore(room);
      stepSentries(room);
      if (checkLoss(room)) return { ok: true, reset: true };
      if (room.cores.size === 0 && room.drone.x === room.exit.x && room.drone.y === room.exit.y) {
        if (room.levelIndex === LEVELS.length - 1) {
          room.phase = 'ended';
        } else {
          loadLevel(room, room.levelIndex + 1);
        }
        return { ok: true, levelComplete: true, gameComplete: room.phase === 'ended' };
      }
      return { ok: true };
    }
    return { ok: false, reason: 'wall' };
  }

  if (action === 'scan') {
    revealAround(room, room.drone.x, room.drone.y, 3);
    room.lastEvent = 'Scan pulse';
    return { ok: true };
  }

  if (action === 'stun') {
    room.sentries.forEach(s => {
      const dist = Math.abs(s.x - room.drone.x) + Math.abs(s.y - room.drone.y);
      if (dist <= 2) s.disabledTicks = 3;
    });
    room.lastEvent = 'EMP stun';
    return { ok: true };
  }

  return { ok: false };
}

export function serializePublicState(room) {
  return {
    code: room.code,
    phase: room.phase,
    levelIndex: room.levelIndex,
    players: room.players.map(p => ({ id: p.id, name: p.name, role: p.role, score: p.score })),
    drone: room.drone,
    dronePos: `${room.drone.x},${room.drone.y}`,
    exit: room.exit,
    coresLeft: room.cores.size,
    grid: room.grid.map((row, y) => row.map((cell, x) => {
      if (room.drone.x === x && room.drone.y === y) return 'D';
      if (room.exit.x === x && room.exit.y === y) return room.cores.size === 0 ? 'E' : 'e';
      if (room.cores.has(key(x, y))) return room.revealed.has(key(x, y)) ? 'C' : '?';
      const sentry = room.sentries.find(s => s.x === x && s.y === y);
      if (sentry) return sentry.disabledTicks > 0 ? 's' : 'X';
      if (cell === '#') return '#';
      return room.revealed.has(key(x, y)) ? '.' : '?';
    })),
    lastEvent: room.lastEvent,
  };
}
