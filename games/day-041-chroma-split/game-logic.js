/**
 * Chroma Split — Game Logic Module
 * Color-mixing light beam puzzle
 */

// Color constants (bitmask)
const COLOR = {
  NONE: 0,
  RED: 1,
  GREEN: 2,
  BLUE: 4,
  YELLOW: 3,    // R+G
  MAGENTA: 5,   // R+B
  CYAN: 6,      // G+B
  WHITE: 7,     // R+G+B
};

const COLOR_HEX = {
  [COLOR.NONE]: 'transparent',
  [COLOR.RED]: '#ff3333',
  [COLOR.GREEN]: '#33ff66',
  [COLOR.BLUE]: '#3399ff',
  [COLOR.YELLOW]: '#ffee00',
  [COLOR.MAGENTA]: '#ff33ff',
  [COLOR.CYAN]: '#00ffee',
  [COLOR.WHITE]: '#ffffff',
};

const COLOR_NAME = {
  [COLOR.NONE]: 'none',
  [COLOR.RED]: 'red',
  [COLOR.GREEN]: 'green',
  [COLOR.BLUE]: 'blue',
  [COLOR.YELLOW]: 'yellow',
  [COLOR.MAGENTA]: 'magenta',
  [COLOR.CYAN]: 'cyan',
  [COLOR.WHITE]: 'white',
};

// Directions: 0=right, 1=down, 2=left, 3=up
const DIR = { RIGHT: 0, DOWN: 1, LEFT: 2, UP: 3 };
const DIR_DELTA = [
  [0, 1],   // RIGHT: row+0, col+1
  [1, 0],   // DOWN: row+1, col+0
  [0, -1],  // LEFT: row+0, col-1
  [-1, 0],  // UP: row-1, col+0
];

// Mirror types:
// '/'  : reflects RIGHT->UP, UP->RIGHT, LEFT->DOWN, DOWN->LEFT
// '\\' : reflects RIGHT->DOWN, DOWN->RIGHT, LEFT->UP, UP->LEFT
// '-'  : horizontal filter: passes LEFT/RIGHT, absorbs UP/DOWN
// '|'  : vertical filter: passes UP/DOWN, absorbs LEFT/RIGHT
// 'S'  : splitter: splits into two perpendicular beams

function reflectDir(dir, mirror) {
  if (mirror === '/') {
    const map = [DIR.UP, DIR.LEFT, DIR.DOWN, DIR.RIGHT];
    return map[dir];
  }
  if (mirror === '\\') {
    const map = [DIR.DOWN, DIR.RIGHT, DIR.UP, DIR.LEFT];
    return map[dir];
  }
  if (mirror === '-') {
    // passes horizontal, absorbs vertical
    if (dir === DIR.LEFT || dir === DIR.RIGHT) return dir;
    return null; // absorbed
  }
  if (mirror === '|') {
    // passes vertical, absorbs horizontal
    if (dir === DIR.UP || dir === DIR.DOWN) return dir;
    return null; // absorbed
  }
  return dir; // no mirror, passes through
}

function getSplitDirs(dir) {
  // Splitter 'S': original beam continues, plus perpendicular
  const perp = [
    [DIR.UP, DIR.DOWN],   // RIGHT splits to UP+DOWN
    [DIR.LEFT, DIR.RIGHT], // DOWN splits to LEFT+RIGHT
    [DIR.UP, DIR.DOWN],   // LEFT splits to UP+DOWN
    [DIR.LEFT, DIR.RIGHT], // UP splits to LEFT+RIGHT
  ];
  return [dir, ...perp[dir]];
}

/**
 * Propagate all beams through the grid.
 * Returns a 2D array of color bitmasks for each cell.
 * 
 * @param {Object} levelState - {rows, cols, emitters, mirrors, walls}
 * @returns {number[][]} colorGrid
 */
function propagateBeams(levelState) {
  const { rows, cols, emitters, mirrors, walls = [] } = levelState;
  
  // colorGrid[r][c] = bitmask of colors passing through
  const colorGrid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  
  // wallSet for O(1) lookup
  const wallSet = new Set(walls.map(([r, c]) => `${r},${c}`));
  
  // BFS/queue of beam segments: {r, c, dir, color}
  // Track visited to prevent infinite loops: key = "r,c,dir,color"
  const visited = new Set();
  const queue = [];
  
  for (const e of emitters) {
    queue.push({ r: e.row, c: e.col, dir: e.dir, color: e.color });
  }
  
  while (queue.length > 0) {
    const { r, c, dir, color } = queue.shift();
    
    // Out of bounds
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    // Wall
    if (wallSet.has(`${r},${c}`)) continue;
    
    const key = `${r},${c},${dir},${color}`;
    if (visited.has(key)) continue;
    visited.add(key);
    
    // Paint this cell
    colorGrid[r][c] |= color;
    
    // Check for mirror/splitter at this cell
    const mirror = mirrors[`${r},${c}`];
    
    if (mirror === 'S') {
      // Splitter: continue in original + perpendiculars
      const dirs = getSplitDirs(dir);
      for (const nextDir of dirs) {
        const [dr, dc] = DIR_DELTA[nextDir];
        queue.push({ r: r + dr, c: c + dc, dir: nextDir, color });
      }
    } else {
      const nextDir = reflectDir(dir, mirror);
      if (nextDir !== null) {
        const [dr, dc] = DIR_DELTA[nextDir];
        queue.push({ r: r + dr, c: c + dc, dir: nextDir, color });
      }
    }
  }
  
  return colorGrid;
}

/**
 * Check if all targets are satisfied.
 * @param {Object} levelState
 * @param {number[][]} colorGrid
 * @returns {boolean}
 */
function checkWin(levelState, colorGrid) {
  for (const target of levelState.targets) {
    const actual = colorGrid[target.row][target.col];
    if (actual !== target.color) return false;
  }
  return true;
}

/**
 * Count how many mirrors have been placed (excluding fixed ones).
 */
function countPlacedMirrors(mirrors, fixedPositions) {
  const fixed = new Set(fixedPositions.map(([r, c]) => `${r},${c}`));
  return Object.keys(mirrors).filter(k => !fixed.has(k)).length;
}

// Export for Node.js (tests) and browser (game)
if (typeof module !== 'undefined') {
  module.exports = {
    COLOR, COLOR_HEX, COLOR_NAME, DIR, DIR_DELTA,
    reflectDir, getSplitDirs, propagateBeams, checkWin, countPlacedMirrors
  };
}
