/**
 * Gravito - Core Game Logic (pure functions, no DOM)
 * Tiles: '#'=wall, '.'=empty, 'P'=player start, 'S'=spike, '*'=star, 'E'=exit
 * Gravity directions: 'down' | 'up' | 'left' | 'right'
 */

export const TILE = {
  WALL: '#',
  EMPTY: '.',
  PLAYER: 'P',
  SPIKE: 'S',
  STAR: '*',
  EXIT: 'E',
};

/**
 * Parse a level string into a structured object.
 * @param {string} levelStr - Multi-line string with tile chars
 * @returns {{ grid: string[][], playerStart: {r,c}, stars: {r,c}[], exit: {r,c} }}
 */
export function parseLevel(levelStr) {
  const rows = levelStr.trim().split('\n').map(row => row.split(''));
  const stars = [];
  let playerStart = null;
  let exit = null;

  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const tile = rows[r][c];
      if (tile === TILE.PLAYER) { playerStart = { r, c }; rows[r][c] = TILE.EMPTY; }
      else if (tile === TILE.STAR) { stars.push({ r, c }); }
      else if (tile === TILE.EXIT) { exit = { r, c }; }
    }
  }

  return { grid: rows, playerStart, stars, exit };
}

/**
 * Get the delta {dr, dc} for a gravity direction.
 */
export function gravityDelta(direction) {
  switch (direction) {
    case 'down':  return { dr: 1, dc: 0 };
    case 'up':    return { dr: -1, dc: 0 };
    case 'left':  return { dr: 0, dc: -1 };
    case 'right': return { dr: 0, dc: 1 };
    default: throw new Error(`Unknown direction: ${direction}`);
  }
}

/**
 * Slide a player in the gravity direction until hitting a wall or out-of-bounds.
 * Returns each position visited along the way (for animation), last = final resting pos.
 * @param {string[][]} grid
 * @param {{r,c}} pos - current position
 * @param {string} direction
 * @returns {{path: {r,c}[], finalPos: {r,c}, hitSomething: string}}
 *   hitSomething: 'wall' | 'spike' | 'exit' | 'star' | 'boundary'
 */
export function slidePlayer(grid, pos, direction) {
  const { dr, dc } = gravityDelta(direction);
  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];
  let r = pos.r;
  let c = pos.c;

  while (true) {
    const nr = r + dr;
    const nc = c + dc;

    // Out of bounds → stop here
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
      return { path, finalPos: { r, c }, hitSomething: 'boundary' };
    }

    const tile = grid[nr][nc];

    if (tile === TILE.WALL) {
      return { path, finalPos: { r, c }, hitSomething: 'wall' };
    }

    // Move to next cell
    r = nr;
    c = nc;
    path.push({ r, c });

    if (tile === TILE.SPIKE) {
      return { path, finalPos: { r, c }, hitSomething: 'spike' };
    }
    if (tile === TILE.STAR) {
      return { path, finalPos: { r, c }, hitSomething: 'star' };
    }
    if (tile === TILE.EXIT) {
      return { path, finalPos: { r, c }, hitSomething: 'exit' };
    }
  }
}

/**
 * Check if the level is complete.
 * @param {Set<string>} collectedStars - Set of "r,c" strings
 * @param {{r,c}[]} allStars
 * @param {{r,c}} playerPos
 * @param {{r,c}} exitPos
 */
export function isLevelComplete(collectedStars, allStars, playerPos, exitPos) {
  const allCollected = allStars.every(s => collectedStars.has(`${s.r},${s.c}`));
  const atExit = playerPos.r === exitPos.r && playerPos.c === exitPos.c;
  return allCollected && atExit;
}

/**
 * Opposite direction (for UI: can't flip 180°? actually allow it — design choice to allow)
 */
export function oppositeDirection(dir) {
  switch (dir) {
    case 'down':  return 'up';
    case 'up':    return 'down';
    case 'left':  return 'right';
    case 'right': return 'left';
  }
}
