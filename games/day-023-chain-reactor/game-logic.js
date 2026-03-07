/**
 * Chain Reactor - Core Game Logic
 * Pure functions for testability.
 */

/**
 * Create an empty grid.
 * Each cell: { atoms: 0, player: -1 }
 */
function createGrid(rows, cols) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({ atoms: 0, player: -1 });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Get the critical mass for a cell (number of orthogonal neighbors).
 * Corner: 2, Edge: 3, Center: 4
 */
function criticalMass(r, c, rows, cols) {
  let mass = 4;
  if (r === 0 || r === rows - 1) mass--;
  if (c === 0 || c === cols - 1) mass--;
  return mass;
}

/**
 * Get orthogonal neighbors of a cell.
 */
function getNeighbors(r, c, rows, cols) {
  const neighbors = [];
  if (r > 0) neighbors.push([r - 1, c]);
  if (r < rows - 1) neighbors.push([r + 1, c]);
  if (c > 0) neighbors.push([r, c - 1]);
  if (c < cols - 1) neighbors.push([r, c + 1]);
  return neighbors;
}

/**
 * Check if a player can place an atom on a cell.
 * Can place if cell is empty (player === -1) or belongs to this player.
 */
function canPlace(grid, r, c, playerIndex) {
  const cell = grid[r][c];
  return cell.player === -1 || cell.player === playerIndex;
}

/**
 * Deep clone a grid.
 */
function cloneGrid(grid) {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

/**
 * Place an atom on a cell for a given player.
 * Returns new grid state.
 */
function placeAtom(grid, r, c, playerIndex) {
  const newGrid = cloneGrid(grid);
  const cell = newGrid[r][c];
  cell.atoms++;
  cell.player = playerIndex;
  return newGrid;
}

/**
 * Process all chain reactions until stable.
 * Returns { grid, explodedCells: [[r,c],...] }
 */
function processExplosions(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let current = cloneGrid(grid);
  const explodedCells = [];
  
  let hasExplosion = true;
  let iterations = 0;
  const MAX_ITERATIONS = rows * cols * 10; // Safety limit
  
  while (hasExplosion && iterations < MAX_ITERATIONS) {
    hasExplosion = false;
    iterations++;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = current[r][c];
        const cm = criticalMass(r, c, rows, cols);
        
        if (cell.atoms >= cm) {
          hasExplosion = true;
          explodedCells.push([r, c]);
          
          // Remove atoms from this cell
          const explodingPlayer = cell.player;
          cell.atoms -= cm;
          if (cell.atoms === 0) cell.player = -1;
          
          // Spread to neighbors
          const neighbors = getNeighbors(r, c, rows, cols);
          for (const [nr, nc] of neighbors) {
            current[nr][nc].atoms++;
            current[nr][nc].player = explodingPlayer; // Convert to this player's color
          }
          
          // Process only one explosion per pass to handle properly
          break;
        }
      }
      if (hasExplosion) break;
    }
  }
  
  return { grid: current, explodedCells };
}

/**
 * Count atoms per player.
 */
function countAtomsPerPlayer(grid, playerCount) {
  const counts = new Array(playerCount).fill(0);
  for (const row of grid) {
    for (const cell of row) {
      if (cell.player >= 0 && cell.player < playerCount) {
        counts[cell.player] += cell.atoms;
      }
    }
  }
  return counts;
}

/**
 * Get winner if game is over (only one player has atoms, and at least one full round played).
 * Returns player index or -1 if game continues.
 * turnCount: total turns played so far (used to ensure game started)
 */
function getWinner(grid, playerCount, turnCount) {
  if (turnCount < playerCount) return -1; // Not enough turns played
  
  const counts = countAtomsPerPlayer(grid, playerCount);
  const activePlayers = counts.filter(c => c > 0).length;
  
  if (activePlayers <= 1) {
    return counts.findIndex(c => c > 0);
  }
  return -1;
}

// Export for testing (Node.js / Bun)
if (typeof module !== 'undefined') {
  module.exports = {
    createGrid,
    criticalMass,
    getNeighbors,
    canPlace,
    cloneGrid,
    placeAtom,
    processExplosions,
    countAtomsPerPlayer,
    getWinner,
  };
}
