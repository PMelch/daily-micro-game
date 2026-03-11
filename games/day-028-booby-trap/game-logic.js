/**
 * Booby Trap - Core Game Logic (Pure Functions)
 * Day 028 - Pass & Play
 */

/**
 * Creates a new grid of given dimensions.
 * @param {number} cols
 * @param {number} rows
 * @returns {object} grid
 */
export function createGrid(cols, rows) {
  const cells = [];
  for (let i = 0; i < rows * cols; i++) {
    cells.push({ type: 'empty', revealed: false });
  }
  return { cols, rows, cells };
}

/**
 * Returns the flat index for (x, y) in the grid.
 */
function cellIndex(grid, x, y) {
  return y * grid.cols + x;
}

/**
 * Checks whether a position is in bounds and unoccupied.
 * @param {object} grid
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function canPlace(grid, x, y) {
  if (x < 0 || x >= grid.cols) return false;
  if (y < 0 || y >= grid.rows) return false;
  const idx = cellIndex(grid, x, y);
  return grid.cells[idx].type === 'empty';
}

/**
 * Places an item ('trap' or 'treasure') at (x, y).
 * @param {object} grid
 * @param {number} x
 * @param {number} y
 * @param {'trap'|'treasure'} type
 * @returns {boolean} success
 */
export function placeItem(grid, x, y, type) {
  if (!canPlace(grid, x, y)) return false;
  const idx = cellIndex(grid, x, y);
  grid.cells[idx].type = type;
  return true;
}

/**
 * Probes a cell. Marks it as revealed and returns its type.
 * Returns null if already revealed or out of bounds.
 * @param {object} grid
 * @param {number} x
 * @param {number} y
 * @returns {'empty'|'trap'|'treasure'|null}
 */
export function probeCell(grid, x, y) {
  if (x < 0 || x >= grid.cols || y < 0 || y >= grid.rows) return null;
  const idx = cellIndex(grid, x, y);
  const cell = grid.cells[idx];
  if (cell.revealed) return null;
  cell.revealed = true;
  return cell.type;
}

/**
 * Counts items of a given type in the grid.
 * @param {object} grid
 * @param {'trap'|'treasure'|'empty'} type
 * @param {boolean} [revealedOnly=false] - only count revealed cells
 * @returns {number}
 */
export function countItems(grid, type, revealedOnly = false) {
  return grid.cells.filter(cell => {
    if (revealedOnly && !cell.revealed) return false;
    return cell.type === type;
  }).length;
}

/**
 * Returns the number of revealed cells.
 * @param {object} grid
 * @returns {number}
 */
export function getRevealedCount(grid) {
  return grid.cells.filter(c => c.revealed).length;
}

/**
 * Checks if the game is over.
 * @param {object} state - { players: [{name, lives, score}], grids: [grid, grid] }
 * @returns {null | {winner: number, loser: number, reason: string}}
 */
export function checkGameOver(state) {
  const { players, grids } = state;

  // Check if any player has lost all lives
  for (let i = 0; i < players.length; i++) {
    if (players[i].lives <= 0) {
      const winner = 1 - i; // other player
      return { winner, loser: i, reason: 'lives' };
    }
  }

  // Check if all treasures on any grid are found
  // grids[i] = the grid that OPPONENT is probing (player i's grid)
  for (let i = 0; i < grids.length; i++) {
    const total = countItems(grids[i], 'treasure');
    const found = countItems(grids[i], 'treasure', true);
    if (total > 0 && found >= total) {
      // Player i's grid had all treasures found -> opponent (1-i) wins by finding them all
      const winner = 1 - i;
      return { winner, loser: i, reason: 'treasures' };
    }
  }

  return null;
}
