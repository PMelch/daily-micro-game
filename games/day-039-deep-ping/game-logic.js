/**
 * Deep Ping - Game Logic
 * Pure functions, no DOM dependencies. Fully testable.
 */

export const CELL = {
  EMPTY: 0,
  WALL: 1,
  MINE: 2,
  TREASURE: 3,
  EXIT: 4
};

export function isWalkable(cell) {
  return cell !== CELL.WALL;
}

export function getCellsInRadius(cx, cy, radius, gridW, gridH) {
  const cells = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
          cells.push(`${nx},${ny}`);
        }
      }
    }
  }
  return cells;
}

/**
 * Create a fresh game state.
 * @param {number} gridW - Width of grid
 * @param {number} gridH - Height of grid
 * @param {number} mineCount - Number of mines to place
 * @param {number} treasureCount - Number of treasures to place
 * @param {number} pingCount - Starting sonar pings
 */
export function createGameState(gridW, gridH, mineCount, treasureCount, pingCount) {
  // Build grid of walls and empty passages using simple maze-like carving
  const grid = [];
  for (let y = 0; y < gridH; y++) {
    grid.push(new Array(gridW).fill(CELL.WALL));
  }

  // Carve open cells in a simple pattern (every odd position is potentially open)
  for (let y = 1; y < gridH - 1; y++) {
    for (let x = 1; x < gridW - 1; x++) {
      grid[y][x] = CELL.EMPTY;
    }
  }

  // Add some random interior walls for obstacle interest
  const rng = mulberry32(42); // deterministic for reproducibility in tests
  for (let y = 2; y < gridH - 2; y++) {
    for (let x = 2; x < gridW - 2; x++) {
      if (rng() < 0.2 && !(x === 1 && y === 1) && !(x === gridW - 2 && y === gridH - 2)) {
        grid[y][x] = CELL.WALL;
      }
    }
  }

  // Ensure start and exit corridors are clear
  grid[1][1] = CELL.EMPTY;
  grid[1][2] = CELL.EMPTY;
  grid[2][1] = CELL.EMPTY;
  grid[gridH - 2][gridW - 2] = CELL.EXIT;
  grid[gridH - 3][gridW - 2] = CELL.EMPTY;
  grid[gridH - 2][gridW - 3] = CELL.EMPTY;

  // Place mines
  const forbidden = new Set(['1,1', '1,2', '2,1', `${gridW-2},${gridH-2}`, `${gridW-3},${gridH-2}`, `${gridW-2},${gridH-3}`]);
  let placed = 0;
  const attempts = mineCount * 20;
  const mineRng = mulberry32(137);
  for (let i = 0; i < attempts && placed < mineCount; i++) {
    const x = 1 + Math.floor(mineRng() * (gridW - 2));
    const y = 1 + Math.floor(mineRng() * (gridH - 2));
    const key = `${x},${y}`;
    if (grid[y][x] === CELL.EMPTY && !forbidden.has(key)) {
      grid[y][x] = CELL.MINE;
      placed++;
    }
  }

  // Place treasures
  let tPlaced = 0;
  const treasureRng = mulberry32(77);
  for (let i = 0; i < attempts && tPlaced < treasureCount; i++) {
    const x = 1 + Math.floor(treasureRng() * (gridW - 2));
    const y = 1 + Math.floor(treasureRng() * (gridH - 2));
    const key = `${x},${y}`;
    if (grid[y][x] === CELL.EMPTY && !forbidden.has(key)) {
      grid[y][x] = CELL.TREASURE;
      tPlaced++;
    }
  }

  // Revealed set — start zone
  const revealed = new Set();
  const startCells = getCellsInRadius(1, 1, 1, gridW, gridH);
  for (const c of startCells) revealed.add(c);

  return {
    grid,
    sub: { x: 1, y: 1 },
    pings: pingCount,
    score: 0,
    revealed,
    gridW,
    gridH,
    alive: true,
    won: false,
    totalTreasures: tPlaced
  };
}

/**
 * Move submarine by (dx, dy). Returns new state.
 */
export function moveSubmarine(state, dx, dy) {
  const nx = state.sub.x + dx;
  const ny = state.sub.y + dy;

  // Boundary / wall check
  if (nx < 0 || nx >= state.gridW || ny < 0 || ny >= state.gridH) {
    return { ...state };
  }
  if (!isWalkable(state.grid[ny][nx])) {
    return { ...state };
  }

  const cell = state.grid[ny][nx];
  const newState = {
    ...state,
    sub: { x: nx, y: ny },
    grid: state.grid.map(row => [...row]),
    revealed: new Set(state.revealed),
    mine_hit: false,
    reached_exit: false
  };

  // Always reveal neighbors when moving
  const nearby = getCellsInRadius(nx, ny, 1, state.gridW, state.gridH);
  for (const c of nearby) newState.revealed.add(c);
  newState.revealed.add(`${nx},${ny}`);

  if (cell === CELL.MINE) {
    newState.mine_hit = true;
    newState.alive = false;
    return newState;
  }

  if (cell === CELL.EXIT) {
    newState.reached_exit = true;
    newState.won = true;
    return newState;
  }

  if (cell === CELL.TREASURE) {
    newState.score = state.score + 100;
    newState.grid[ny][nx] = CELL.EMPTY;
  }

  return newState;
}

/**
 * Emit a sonar ping at (cx, cy) with radius. Returns new state.
 */
export function emitPing(state, cx, cy) {
  if (state.pings <= 0) return { ...state };

  const PING_RADIUS = 4;
  const revealed = new Set(state.revealed);
  const cells = getCellsInRadius(cx, cy, PING_RADIUS, state.gridW, state.gridH);
  for (const c of cells) revealed.add(c);

  return {
    ...state,
    pings: state.pings - 1,
    revealed,
    lastPing: { x: cx, y: cy, radius: PING_RADIUS, time: Date.now() }
  };
}

/**
 * Collect a cell (utility helper used in tests)
 */
export function collectCell(state, x, y) {
  if (state.grid[y][x] === CELL.TREASURE) {
    const newGrid = state.grid.map(row => [...row]);
    newGrid[y][x] = CELL.EMPTY;
    return { ...state, grid: newGrid, score: state.score + 100 };
  }
  return state;
}

// Simple deterministic RNG (Mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
