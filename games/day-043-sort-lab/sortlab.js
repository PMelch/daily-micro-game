// Sort Lab game logic module
// Exportable pure functions for testing

const TUBE_CAPACITY = 4;

/**
 * Returns the top color of a tube (last element), or null if empty.
 */
function topColor(tube) {
  if (!tube || tube.length === 0) return null;
  return tube[tube.length - 1];
}

/**
 * Returns how many contiguous balls of the top color are at the top.
 */
function topCount(tube) {
  if (!tube || tube.length === 0) return 0;
  const color = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === color) count++;
    else break;
  }
  return count;
}

/**
 * Returns true if a move from `from` to `to` is valid.
 * @param {string[][]} tubes
 * @param {number} fromIdx
 * @param {number} toIdx
 */
function canMove(tubes, fromIdx, toIdx) {
  if (fromIdx === toIdx) return false;
  const from = tubes[fromIdx];
  const to = tubes[toIdx];
  if (!from || from.length === 0) return false;          // source empty
  if (to.length >= TUBE_CAPACITY) return false;          // dest full
  // dest empty: always ok
  if (to.length === 0) return true;
  // top colors must match
  return topColor(from) === topColor(to);
}

/**
 * Performs a move (pours top contiguous block from->to), returns new tubes (immutable).
 * Throws if move invalid.
 */
function applyMove(tubes, fromIdx, toIdx) {
  if (!canMove(tubes, fromIdx, toIdx)) throw new Error('Invalid move');
  // Deep copy
  const next = tubes.map(t => [...t]);
  const from = next[fromIdx];
  const to = next[toIdx];
  const color = topColor(from);
  // Pour as many balls of top color as fit
  while (from.length > 0 && topColor(from) === color && to.length < TUBE_CAPACITY) {
    to.push(from.pop());
  }
  return next;
}

/**
 * Returns true if the puzzle is solved:
 * Each tube is either empty or contains exactly TUBE_CAPACITY balls of one color.
 */
function isSolved(tubes) {
  return tubes.every(tube => {
    if (tube.length === 0) return true;
    if (tube.length !== TUBE_CAPACITY) return false;
    return tube.every(c => c === tube[0]);
  });
}

/**
 * Returns true if no valid moves exist.
 */
function isStuck(tubes) {
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes.length; j++) {
      if (canMove(tubes, i, j)) return false;
    }
  }
  return true;
}

/**
 * Returns predefined puzzle levels.
 * Each level: array of tubes (arrays of color strings, bottom-first).
 * Empty tubes are the "spare" tubes needed to solve.
 * Colors: r(ed), g(reen), b(lue), y(ellow), p(urple), o(range), c(yan), m(agenta)
 */
function getLevel(n) {
  const levels = [
    // Level 1: 2 colors, easy
    [['r','g','r','g'], ['g','r','g','r'], [], []],

    // Level 2: 3 colors
    [['b','r','g','b'], ['g','b','r','r'], ['r','g','b','g'], [], []],

    // Level 3: 4 colors
    [['g','y','r','b'], ['r','b','g','y'], ['y','r','b','r'], ['b','g','y','g'], [], []],

    // Level 4: 4 colors, tight (only 1 spare)
    [['r','g','b','r'], ['b','y','r','g'], ['g','r','y','b'], ['y','b','g','y'], [], []],

    // Level 5: 5 colors
    [['r','g','b','y'], ['p','r','g','b'], ['y','p','r','g'], ['b','y','p','r'], ['g','b','y','p'], [], []],

    // Level 6: 5 colors, 1 spare
    [['r','p','b','g'], ['b','y','r','p'], ['g','r','y','b'], ['p','g','r','y'], ['y','b','g','p'], []],

    // Level 7: 6 colors
    [['r','g','o','b'], ['y','p','r','g'], ['b','o','y','p'], ['g','r','b','o'], ['p','y','g','r'], ['o','b','p','y'], [], []],

    // Level 8: 6 colors, 1 spare — extra tricky
    [['r','g','o','b'], ['y','p','r','g'], ['b','o','y','p'], ['g','r','b','o'], ['p','y','g','r'], ['o','b','p','y'], []],
  ];

  const idx = Math.min(Math.max(n - 1, 0), levels.length - 1);
  // Deep copy
  return levels[idx].map(t => [...t]);
}

/**
 * Count total balls in all tubes (useful for validation).
 */
function totalBalls(tubes) {
  return tubes.reduce((sum, t) => sum + t.length, 0);
}

// Export for Node/Bun test environment
if (typeof module !== 'undefined') {
  module.exports = { topColor, topCount, canMove, applyMove, isSolved, isStuck, getLevel, totalBalls, TUBE_CAPACITY };
}
