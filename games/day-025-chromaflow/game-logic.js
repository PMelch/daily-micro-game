/**
 * Chromaflow — game logic (pure, testable)
 * Daily color-flood puzzle. Start top-left, pick colors to flood outward.
 * Goal: cover the entire grid in minimum moves.
 */

export const GRID_SIZE = 12;
export const NUM_COLORS = 6;
export const PAR_MOVES = 26;

/**
 * Mulberry32 PRNG — fast, deterministic, seeded.
 * @param {number} seed
 * @returns {() => number} function returning [0,1)
 */
export function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate the grid for a given seed (date as YYYYMMDD integer).
 * @param {number} seed
 * @returns {number[][]} GRID_SIZE×GRID_SIZE grid of color indices [0, NUM_COLORS)
 */
export function generateGrid(seed) {
  const rng = mulberry32(seed);
  const grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(Math.floor(rng() * NUM_COLORS));
    }
    grid.push(row);
  }
  return grid;
}

/**
 * BFS from (0,0) to find all cells with the same color as top-left (the player's territory).
 * @param {number[][]} grid
 * @returns {Set<string>} set of "r,c" strings
 */
export function getTerritory(grid) {
  const origin = grid[0][0];
  const visited = new Set();
  const queue = [[0, 0]];
  visited.add('0,0');

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (
        nr >= 0 && nr < grid.length &&
        nc >= 0 && nc < grid[0].length &&
        !visited.has(key) &&
        grid[nr][nc] === origin
      ) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return visited;
}

/**
 * Apply a color move to the grid.
 * All territory cells change to the chosen color,
 * then the territory expands by absorbing adjacent cells of the new color.
 * Returns a new grid (immutable).
 * @param {number[][]} grid
 * @param {number} color — the chosen color index
 * @returns {number[][]} new grid
 */
export function applyMove(grid, color) {
  // Deep-clone the grid
  const next = grid.map(row => [...row]);

  // Get current territory
  const territory = getTerritory(next);

  // No-op if picking same color
  const currentColor = next[0][0];
  if (color === currentColor) return next;

  // Paint territory with new color
  for (const key of territory) {
    const [r, c] = key.split(',').map(Number);
    next[r][c] = color;
  }

  // Expand territory: absorb adjacent cells of the new color via BFS
  const expanded = new Set(territory);
  const bfsQueue = [...territory].map(k => k.split(',').map(Number));

  while (bfsQueue.length > 0) {
    const [r, c] = bfsQueue.shift();
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (
        nr >= 0 && nr < next.length &&
        nc >= 0 && nc < next[0].length &&
        !expanded.has(key) &&
        next[nr][nc] === color
      ) {
        expanded.add(key);
        next[nr][nc] = color;
        bfsQueue.push([nr, nc]);
      }
    }
  }

  return next;
}

/**
 * Check if the entire grid is a single color (win condition).
 * @param {number[][]} grid
 * @returns {boolean}
 */
export function isWon(grid) {
  const target = grid[0][0];
  return grid.every(row => row.every(cell => cell === target));
}

/**
 * Calculate star rating based on moves used vs par.
 * @param {number} moves
 * @returns {1|2|3}
 */
export function getStarRating(moves) {
  if (moves <= PAR_MOVES) return 3;
  if (moves <= Math.floor(PAR_MOVES * 1.3)) return 2;
  return 1;
}
