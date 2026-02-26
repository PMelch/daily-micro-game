/**
 * Laser Maze — Game Logic (pure functions, no DOM)
 * Suitable for Bun testing.
 */

export const DIR = { RIGHT: 'right', LEFT: 'left', UP: 'up', DOWN: 'down' };

/**
 * Reflect a laser direction off a mirror.
 * Mirror types: '/' or '\'
 */
export function reflect(dir, mirrorType) {
  if (mirrorType === '/') {
    const map = { right: 'up', left: 'down', up: 'right', down: 'left' };
    return map[dir];
  } else { // '\'
    const map = { right: 'down', left: 'up', up: 'left', down: 'right' };
    return map[dir];
  }
}

/**
 * Move one step in a direction.
 * Returns new {row, col}.
 */
export function step(row, col, dir) {
  if (dir === 'right') return { row, col: col + 1 };
  if (dir === 'left')  return { row, col: col - 1 };
  if (dir === 'up')    return { row: row - 1, col };
  if (dir === 'down')  return { row: row + 1, col };
  return { row, col };
}

/**
 * Trace the laser path through the grid.
 * @param {number} gridSize - N for NxN grid (rows 0..N-1, cols 0..N-1)
 * @param {{row:number,col:number,dir:string}} source - starting cell + direction
 * @param {Map<string,'/'|'\\'>} mirrors - "row,col" -> mirror type
 * @param {Set<string>} targets - Set of "row,col" target keys
 * @returns {{ path: {row,col}[], hitTargets: Set<string> }}
 */
export function traceLaser(gridSize, source, mirrors, targets) {
  const path = [];
  const hitTargets = new Set();
  const visited = new Set(); // prevent infinite loops

  let { row, col, dir } = source;

  for (let i = 0; i < 2000; i++) {
    // Out of bounds → stop
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) break;

    const stateKey = `${row},${col},${dir}`;
    if (visited.has(stateKey)) break;
    visited.add(stateKey);

    const cellKey = `${row},${col}`;
    path.push({ row, col });

    // Check if this cell is a target
    if (targets.has(cellKey)) hitTargets.add(cellKey);

    // Check if this cell has a mirror
    if (mirrors.has(cellKey)) {
      dir = reflect(dir, mirrors.get(cellKey));
    }

    // Advance
    const next = step(row, col, dir);
    row = next.row;
    col = next.col;
  }

  return { path, hitTargets };
}

/**
 * Check win condition: all targets hit.
 */
export function checkWin(hitTargets, targets) {
  if (targets.size === 0) return false;
  for (const t of targets) {
    if (!hitTargets.has(t)) return false;
  }
  return true;
}

/**
 * Convert "row,col" key to {row,col}.
 */
export function keyToCell(key) {
  const [r, c] = key.split(',').map(Number);
  return { row: r, col: c };
}

/**
 * Level definitions.
 * source: {row, col, dir} — where the laser enters the grid
 * targets: array of [row, col]
 * availableMirrors: how many mirrors the player can place
 * gridSize: N for NxN
 * walls: array of [row, col] — cells the laser cannot pass through (blocked)
 */
export const LEVELS = [
  {
    // Level 1: 5×5, simple intro
    gridSize: 5,
    source: { row: 2, col: 0, dir: 'right' },
    targets: [[0, 4]],
    availableMirrors: 1,
    walls: [],
    // Solution: '/' at (2,4)
  },
  {
    // Level 2: 6×6, two targets
    // Laser enters top-left going down.
    // '\' at (2,0) → right, '\' at (2,5) → down to (5,5)
    // Targets: (2,3) and (5,5)
    gridSize: 6,
    source: { row: 0, col: 0, dir: 'down' },
    targets: [[2, 3], [5, 5]],
    availableMirrors: 3,
    walls: [],
    // Solution: '\' at (2,0), '\' at (2,5)
  },
  {
    // Level 3: 7×7 — needs 2 mirrors, 3 available
    // Source top col 0 going down
    // '\' at (3,0) → right → '\' at (3,6) → down → hits (6,6)
    // Targets: (3,4) [in row 3 path] and (6,6)
    gridSize: 7,
    source: { row: 0, col: 0, dir: 'down' },
    targets: [[3, 4], [6, 6]],
    availableMirrors: 3,
    walls: [],
    // Solution: '\' at (3,0), '\' at (3,6)
  },
  {
    // Level 4: 8×8 — needs 3 mirrors, 4 available
    // Source: bottom col 0 going up
    // '/' at (5,0) → right → '/' at (5,6) → up → '\' at (0,6) → left
    // Targets: (5,3), (2,6), (0,4)
    gridSize: 8,
    source: { row: 7, col: 0, dir: 'up' },
    targets: [[5, 3], [2, 6], [0, 4]],
    availableMirrors: 4,
    walls: [],
    // Solution: '/' at (5,0), '/' at (5,6), '\' at (0,6)
  },
  {
    // Level 5: 8×8 — needs 4 mirrors, 5 available
    // Source: right edge row 7, going left
    // '/' at (7,5) → up → '\' at (3,5) → right → '/' at (3,7)... off edge
    // Let's build a verified path:
    // Source: top col 7 going down
    // '\' at (0,7) → right exits... bad.
    // Source: left edge row 6, going right
    // '\' at (6,2) → down → exits (8×8: rows 0-7)
    // Let me define carefully:
    // Source: (0, 0) going right
    // '\' at (0,3) → down
    // '\' at (4,3) → right
    // '/' at (4,6) → up
    // '\' at (1,6) → left... wait '\' up→left
    // Actually '/' up→right. '\' up→left.
    // '/': right→up, left→down, up→right, down→left
    // '\': right→down, left→up, up→left, down→right
    // So: '/' at (4,6): laser going right → up. Goes up col 6: (3,6),(2,6),(1,6),(0,6)
    // Targets: (0,5)[in initial path 0,0→right], (4,4)[in row 4 path], (1,6)[in col 6 up path]
    // Trace:
    //  Laser row 0 right: (0,0),(0,1),(0,2),(0,3) → '\' at (0,3): right→down
    //  Col 3 down: (1,3),(2,3),(3,3),(4,3) → '\' at (4,3): down→right
    //  Row 4 right: (4,4)[T2 ✓],(4,5),(4,6) → '/' at (4,6): right→up
    //  Col 6 up: (3,6),(2,6),(1,6)[T3 ✓],(0,6),(−1..exit)
    // Missing T1: (0,5) — but (0,5) is not in any of these paths.
    // Let me change T1 to (0,2): (0,0),(0,1),(0,2)[T1 ✓],(0,3)→deflect down
    gridSize: 8,
    source: { row: 0, col: 0, dir: 'right' },
    targets: [[0, 2], [4, 4], [1, 6]],
    availableMirrors: 5,
    walls: [],
    // Solution: '\' at (0,3), '\' at (4,3), '/' at (4,6)
    // Only 3 mirrors needed! But 5 available. Player may use decoys.
    // Actually let me make 4 required:
    // Add target (6,2): after '/' at (4,6) we go up, done. Need to also hit (6,2).
    // From initial path going right, add mirror before (0,3):
    // This approach: add 4th target and 4th mirror.
  },
];

// Fix level 5 to require 4 mirrors with a verified 4-target solution:
LEVELS[4] = {
  gridSize: 8,
  source: { row: 0, col: 0, dir: 'right' },
  targets: [[0, 2], [4, 4], [1, 6], [7, 3]],
  availableMirrors: 5,
  walls: [],
  // Solution:
  // '\' at (0,3): right→down → col 3 down
  // '\' at (4,3): down→right → row 4 right, hits (4,4)[T2]
  // '/' at (4,6): right→up → col 6 up, hits (1,6)[T3]
  // '/' at (1,3)... wait let me re-trace for (7,3):
  //   Col 3 going down: (1,3),(2,3),(3,3),(4,3)→'\':right
  //   So col 3 is traversed from (1,3)...(4,3). (7,3) is below (4,3).
  //   If instead of '\' at (4,3) we have mirror lower... but we need row 4 path for (4,4).
  //   To hit (7,3), the beam would need to go down to row 7 in col 3.
  //   That means no mirror at (4,3) to deflect right.
  //   Conflict: can't both deflect right at row 4 AND continue to row 7 in col 3.
  // Let me drop the 4th target constraint and just make it 3 targets, 4 mirrors available.
  // That's fine - not every available mirror needs to be used.
};

// Revert to a clean level 5
LEVELS[4] = {
  gridSize: 8,
  source: { row: 0, col: 0, dir: 'right' },
  targets: [[0, 2], [4, 4], [1, 6]],
  availableMirrors: 5,
  walls: [],
  // Verified solution:
  // (0,2) is hit directly going right (in path)
  // '\' at (0,3): right→down → col 3 down: (1,3)...(4,3)
  // '\' at (4,3): down→right → row 4 right: (4,4)[TARGET ✓]...(4,6)
  // '/' at (4,6): right→up → col 6 up: (3,6),(2,6),(1,6)[TARGET ✓]
  // 3 mirrors needed, 5 available
};
