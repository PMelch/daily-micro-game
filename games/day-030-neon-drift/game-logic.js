// game-logic.js — Pure game logic for Neon Drift (importable + testable)

export const GRID_SIZE = 25;

export const DIRS = {
  UP:    { dx: 0,  dy: -1, name: 'UP'    },
  DOWN:  { dx: 0,  dy:  1, name: 'DOWN'  },
  LEFT:  { dx: -1, dy:  0, name: 'LEFT'  },
  RIGHT: { dx:  1, dy:  0, name: 'RIGHT' },
};

const OPPOSITES = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

// ── Helpers ────────────────────────────────────────────────────────────────

export function isOppositeDirection(dir, current) {
  return OPPOSITES[dir] === current;
}

export function isValidDirection(dir, currentDir = null) {
  if (!dir || !DIRS[dir]) return false;
  if (currentDir && isOppositeDirection(dir, currentDir)) return false;
  return true;
}

export function checkCollision(x, y, allTrails) {
  // Wall collision
  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return true;
  // Trail collision (any player's trail)
  for (const trail of allTrails) {
    for (const cell of trail) {
      if (cell.x === x && cell.y === y) return true;
    }
  }
  return false;
}

// ── State Factory ──────────────────────────────────────────────────────────

export function createGameState() {
  const midY = Math.floor(GRID_SIZE / 2);
  const p1StartX = Math.floor(GRID_SIZE * 0.2);
  const p2StartX = Math.floor(GRID_SIZE * 0.8);

  const players = [
    {
      id: 0,
      x: p1StartX,
      y: midY,
      dir: 'RIGHT',
      trail: [{ x: p1StartX, y: midY }],
      score: 0,
      color: '#00ffff',       // cyan
      shadowColor: '#006666',
    },
    {
      id: 1,
      x: p2StartX,
      y: midY,
      dir: 'LEFT',
      trail: [{ x: p2StartX, y: midY }],
      score: 0,
      color: '#ff00ff',       // magenta
      shadowColor: '#660066',
    },
  ];

  return {
    players,
    running: true,
    winner: null,
    tick: 0,
  };
}

// ── Move Resolution ────────────────────────────────────────────────────────

/**
 * Apply simultaneous moves for both players.
 * Returns { state, crash: number[] } where crash contains player ids that crashed.
 */
export function applyMoves(state, dir0, dir1) {
  const dirs = [dir0, dir1];

  // Deep-clone players (trails are arrays of plain objects)
  const newPlayers = state.players.map(p => ({
    ...p,
    trail: p.trail.map(c => ({ ...c })),
  }));

  // Resolve effective directions (reject U-turns)
  const effectiveDirs = newPlayers.map((p, i) => {
    const requested = dirs[i];
    if (!isValidDirection(requested, p.dir)) return p.dir; // keep current
    return requested;
  });

  // Compute next positions
  const nextPositions = newPlayers.map((p, i) => {
    const d = DIRS[effectiveDirs[i]];
    return { x: p.x + d.dx, y: p.y + d.dy };
  });

  // Update directions
  newPlayers.forEach((p, i) => { p.dir = effectiveDirs[i]; });

  // Build all trails BEFORE moving (for collision checks)
  const allTrails = newPlayers.map(p => p.trail);

  // Check head-on collision: both moving to each other's current position
  const headOn =
    nextPositions[0].x === state.players[1].x &&
    nextPositions[0].y === state.players[1].y &&
    nextPositions[1].x === state.players[0].x &&
    nextPositions[1].y === state.players[0].y;

  // Check same-cell collision (both targeting same cell)
  const sameCellCollision =
    nextPositions[0].x === nextPositions[1].x &&
    nextPositions[0].y === nextPositions[1].y;

  const crash = [];

  if (headOn || sameCellCollision) {
    crash.push(0, 1);
  } else {
    // Move players into next positions and extend trails
    newPlayers.forEach((p, i) => {
      const np = nextPositions[i];
      // Check wall + all existing trails (not including the new position)
      const hit = checkCollision(np.x, np.y, allTrails);
      if (hit) {
        crash.push(i);
      } else {
        p.trail.push({ x: np.x, y: np.y });
        p.x = np.x;
        p.y = np.y;
      }
    });
  }

  const newState = {
    ...state,
    players: newPlayers,
    tick: state.tick + 1,
    running: crash.length === 0,
  };

  return { state: newState, crash };
}

// ── Round Reset ────────────────────────────────────────────────────────────

export function resetRound(state) {
  const fresh = createGameState();
  return {
    ...fresh,
    players: fresh.players.map((p, i) => ({
      ...p,
      score: state.players[i].score,
    })),
  };
}
