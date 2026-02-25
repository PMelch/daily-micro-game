/**
 * Pixel Logic — Core game logic (pure functions, fully testable)
 */

/**
 * Given a row/column of boolean cells, compute the nonogram clue groups.
 * e.g. [true, true, false, true] → [2, 1]
 * An empty row returns [0]
 */
export function computeClues(line) {
  const groups = [];
  let count = 0;
  for (const cell of line) {
    if (cell) {
      count++;
    } else if (count > 0) {
      groups.push(count);
      count = 0;
    }
  }
  if (count > 0) groups.push(count);
  return groups.length === 0 ? [0] : groups;
}

/**
 * Derive all row and column clues from a solution grid.
 * Returns { rowClues: number[][], colClues: number[][] }
 */
export function deriveClues(solution) {
  const rows = solution.length;
  const cols = solution[0].length;
  const rowClues = solution.map(row => computeClues(row));
  const colClues = [];
  for (let c = 0; c < cols; c++) {
    const col = solution.map(row => row[c]);
    colClues.push(computeClues(col));
  }
  return { rowClues, colClues };
}

/**
 * Check if the userGrid exactly matches the solution.
 * Only filled (true) cells in solution must match filled cells in userGrid.
 * This checks for exact equality.
 */
export function isSolved(userGrid, solution) {
  const rows = solution.length;
  const cols = solution[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((userGrid[r][c] === true) !== (solution[r][c] === true)) return false;
    }
  }
  return true;
}

/**
 * Count mistake cells: cells the user has filled (true) that should be empty (false).
 * Does NOT count unfilled required cells — those are just "incomplete", not mistakes.
 */
export function countMistakes(userGrid, solution) {
  let mistakes = 0;
  const rows = solution.length;
  const cols = solution[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (userGrid[r][c] === true && solution[r][c] === false) {
        mistakes++;
      }
    }
  }
  return mistakes;
}

/**
 * Validate a puzzle definition for correctness.
 * Returns true if the puzzle has a valid id, size, and solution grid of matching dimensions.
 */
export function validatePuzzle(puzzle) {
  if (!puzzle || !puzzle.id || !puzzle.size || !puzzle.solution) return false;
  const { size, solution } = puzzle;
  if (!Array.isArray(solution)) return false;
  if (solution.length !== size) return false;
  for (const row of solution) {
    if (!Array.isArray(row) || row.length !== size) return false;
  }
  return true;
}
