// Flow Grid - Game Logic
// Core functions for the pipe-flow puzzle game

/**
 * Create an empty NxN grid filled with null
 */
export function createGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/**
 * Check if a cell coordinate is within bounds
 */
export function isValidCell(row, col, size) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

/**
 * Check if a path extension is valid
 * - Target cell must be within bounds
 * - Target must be adjacent (4-directional) to the last cell in the path
 * - Target must be empty OR be the endpoint dot of this color
 */
export function canExtendPath(grid, paths, color, targetRow, targetCol, size) {
  // Must be within bounds
  if (!isValidCell(targetRow, targetCol, size)) return false;

  const path = paths[color];
  if (!path || path.length === 0) return false;

  // Must be adjacent to the last cell in the path
  const [lastRow, lastCol] = path[path.length - 1];
  const dr = Math.abs(targetRow - lastRow);
  const dc = Math.abs(targetCol - lastCol);
  if (dr + dc !== 1) return false; // Must be exactly 1 step orthogonally

  // Target cell must be empty or be this color's endpoint dot
  const cell = grid[targetRow][targetCol];
  if (cell === null) return true;
  if (cell.color === color && cell.isDot) return true;
  
  return false;
}

/**
 * Check if the puzzle is solved:
 * 1. All color pairs are connected (path starts at one dot, ends at other)
 * 2. Every cell in the grid is filled
 */
export function checkWin(grid, paths, dotPairs, size) {
  // Check every cell is filled
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) return false;
    }
  }

  // Check all color pairs are connected
  for (const [color, start, end] of dotPairs) {
    const path = paths[color];
    if (!path || path.length < 2) return false;
    
    const pathStart = path[0];
    const pathEnd = path[path.length - 1];
    
    // Path must start at one dot and end at the other
    const startsCorrect =
      (pathStart[0] === start[0] && pathStart[1] === start[1] && pathEnd[0] === end[0] && pathEnd[1] === end[1]) ||
      (pathStart[0] === end[0] && pathStart[1] === end[1] && pathEnd[0] === start[0] && pathEnd[1] === start[1]);
    
    if (!startsCorrect) return false;
  }

  return true;
}

/**
 * Initialize a fresh paths object
 */
export function getPaths() {
  return {};
}

/**
 * Initialize a puzzle by index, returns { size, dotPairs }
 */
export function initPuzzle(index) {
  const puzzle = PUZZLES[index % PUZZLES.length];
  return {
    size: puzzle.size,
    dotPairs: puzzle.dotPairs.map(p => [...p])
  };
}

// Puzzle definitions
// Each dotPair: [colorName, [row, col], [row, col]]
// Colors use CSS color names / hex
export const PUZZLES = [
  // Puzzle 0: 5x5 - 4 colors (Easy)
  {
    size: 5,
    dotPairs: [
      ['#e74c3c', [0, 0], [4, 4]], // red
      ['#3498db', [0, 4], [4, 0]], // blue
      ['#2ecc71', [0, 2], [2, 4]], // green
      ['#f39c12', [2, 0], [4, 2]], // orange
    ]
  },
  // Puzzle 1: 5x5 - 4 colors (Medium)
  {
    size: 5,
    dotPairs: [
      ['#e74c3c', [0, 0], [3, 2]],
      ['#3498db', [0, 4], [2, 2]],
      ['#2ecc71', [1, 0], [4, 3]],
      ['#f39c12', [0, 2], [4, 0]],
      ['#9b59b6', [2, 4], [4, 4]],
    ]
  },
  // Puzzle 2: 6x6 - 5 colors (Medium)
  {
    size: 6,
    dotPairs: [
      ['#e74c3c', [0, 0], [5, 5]],
      ['#3498db', [0, 5], [5, 0]],
      ['#2ecc71', [0, 3], [3, 5]],
      ['#f39c12', [2, 0], [5, 3]],
      ['#9b59b6', [1, 2], [4, 4]],
    ]
  },
  // Puzzle 3: 6x6 - 5 colors (Hard)
  {
    size: 6,
    dotPairs: [
      ['#e74c3c', [0, 1], [5, 4]],
      ['#3498db', [0, 4], [5, 1]],
      ['#2ecc71', [0, 0], [3, 3]],
      ['#f39c12', [1, 5], [4, 2]],
      ['#9b59b6', [2, 1], [5, 5]],
      ['#1abc9c', [0, 3], [3, 0]],
    ]
  },
  // Puzzle 4: 7x7 - 6 colors (Hard)
  {
    size: 7,
    dotPairs: [
      ['#e74c3c', [0, 0], [6, 6]],
      ['#3498db', [0, 6], [6, 0]],
      ['#2ecc71', [0, 3], [6, 3]],
      ['#f39c12', [2, 0], [2, 6]],
      ['#9b59b6', [4, 0], [4, 6]],
      ['#1abc9c', [1, 2], [5, 4]],
    ]
  },
  // Puzzle 5: 7x7 - 6 colors (Expert)
  {
    size: 7,
    dotPairs: [
      ['#e74c3c', [0, 0], [4, 4]],
      ['#3498db', [0, 6], [3, 2]],
      ['#2ecc71', [1, 1], [6, 5]],
      ['#f39c12', [0, 3], [6, 0]],
      ['#9b59b6', [2, 5], [5, 1]],
      ['#1abc9c', [0, 5], [6, 3]],
      ['#e67e22', [3, 0], [6, 6]],
    ]
  },
  // Puzzle 6: 8x8 - 7 colors (Expert)
  {
    size: 8,
    dotPairs: [
      ['#e74c3c', [0, 0], [7, 7]],
      ['#3498db', [0, 7], [7, 0]],
      ['#2ecc71', [0, 4], [4, 7]],
      ['#f39c12', [3, 0], [7, 4]],
      ['#9b59b6', [1, 2], [6, 5]],
      ['#1abc9c', [0, 2], [2, 6]],
      ['#e67e22', [5, 1], [7, 6]],
    ]
  },
  // Puzzle 7: 8x8 - 7 colors (Expert)
  {
    size: 8,
    dotPairs: [
      ['#e74c3c', [0, 1], [7, 6]],
      ['#3498db', [0, 6], [7, 1]],
      ['#2ecc71', [0, 3], [5, 7]],
      ['#f39c12', [2, 0], [7, 3]],
      ['#9b59b6', [1, 4], [6, 2]],
      ['#1abc9c', [3, 7], [7, 5]],
      ['#e67e22', [0, 0], [4, 4]],
    ]
  }
];
