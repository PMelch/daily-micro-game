/**
 * Signal Trace - game logic (pure functions, no DOM)
 *
 * Grid of nodes, each with connections (N/S/E/W).
 * Player rotates nodes (CW 90°) to connect source→sink.
 * Immutable state, TDD-friendly.
 */

// Node types: each has a set of ports
// 'I' = straight (connects 2 opposite sides)
// 'L' = elbow (connects 2 adjacent sides)
// 'T' = T-junction (connects 3 sides)
// 'X' = cross (connects all 4 sides)

export const NODE_TYPES = ['I', 'L', 'T', 'X'];

// For each type, define which ports are open at rotation=0
// Ports: 0=N, 1=E, 2=S, 3=W
export const BASE_PORTS = {
  'I': [0, 2],      // N-S straight
  'L': [0, 1],      // N-E elbow
  'T': [0, 1, 2],   // N-E-S T-junction (missing W)
  'X': [0, 1, 2, 3] // all sides
};

/**
 * Get open ports for a node at a given rotation (0-3, each = 90° CW)
 */
export function getPorts(type, rotation) {
  const base = BASE_PORTS[type] || [];
  return base.map(p => (p + rotation) % 4);
}

/**
 * Check if two adjacent nodes are connected
 * dir: 0=N,1=E,2=S,3=W; opposite: 2,3,0,1
 */
export function areConnected(nodeA, nodeB, dir) {
  const portsA = getPorts(nodeA.type, nodeA.rotation);
  const portsB = getPorts(nodeB.type, nodeB.rotation);
  const opposite = (dir + 2) % 4;
  return portsA.includes(dir) && portsB.includes(opposite);
}

/**
 * Get neighbor coordinates
 */
export function getNeighbor(r, c, dir) {
  if (dir === 0) return { r: r - 1, c };
  if (dir === 1) return { r, c: c + 1 };
  if (dir === 2) return { r: r + 1, c };
  if (dir === 3) return { r, c: c - 1 };
}

/**
 * BFS from source to check if all required nodes are connected
 * Returns set of connected cell keys "r,c"
 */
export function findConnectedFromSource(grid, rows, cols, sourceR, sourceC) {
  const visited = new Set();
  const queue = [{ r: sourceR, c: sourceC }];
  visited.add(`${sourceR},${sourceC}`);

  while (queue.length > 0) {
    const { r, c } = queue.shift();
    const node = grid[r][c];

    for (let dir = 0; dir < 4; dir++) {
      const nb = getNeighbor(r, c, dir);
      if (nb.r < 0 || nb.r >= rows || nb.c < 0 || nb.c >= cols) continue;
      const key = `${nb.r},${nb.c}`;
      if (visited.has(key)) continue;
      const nbNode = grid[nb.r][nb.c];
      if (areConnected(node, nbNode, dir)) {
        visited.add(key);
        queue.push({ r: nb.r, c: nb.c });
      }
    }
  }

  return visited;
}

/**
 * Check if puzzle is solved: source connected to sink
 */
export function isSolved(state) {
  const connected = findConnectedFromSource(
    state.grid, state.rows, state.cols,
    state.source.r, state.source.c
  );
  return connected.has(`${state.sink.r},${state.sink.c}`);
}

/**
 * Rotate a node clockwise by 90°
 */
export function rotateNode(state, r, c) {
  const newGrid = state.grid.map(row => row.map(node => ({ ...node })));
  newGrid[r][c] = {
    ...newGrid[r][c],
    rotation: (newGrid[r][c].rotation + 1) % 4
  };
  return { ...state, grid: newGrid, moves: state.moves + 1 };
}

// Level definitions: each level specifies grid size and node layout
// Levels get bigger and harder
const LEVEL_CONFIGS = [
  { rows: 3, cols: 3 },
  { rows: 4, cols: 4 },
  { rows: 4, cols: 5 },
  { rows: 5, cols: 5 },
  { rows: 5, cols: 6 },
  { rows: 6, cols: 6 },
];

/**
 * Generate a random level using a seeded-like approach
 * Creates a guaranteed-solvable puzzle by:
 * 1. Finding a random path from source to sink
 * 2. Placing appropriate pipe nodes along the path
 * 3. Filling rest with random nodes
 * 4. Randomizing all rotations (puzzle state)
 */
export function generateLevel(levelIndex, seed) {
  const config = LEVEL_CONFIGS[Math.min(levelIndex, LEVEL_CONFIGS.length - 1)];
  const { rows, cols } = config;

  // Simple seeded RNG
  let rng = seed || (levelIndex * 7919 + 1234567);
  function rand() {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return (rng >>> 0) / 0xffffffff;
  }
  function randInt(n) { return Math.floor(rand() * n); }

  // Source is top-left area, sink is bottom-right area
  const sourceR = randInt(Math.ceil(rows / 3));
  const sourceC = randInt(Math.ceil(cols / 3));
  const sinkR = rows - 1 - randInt(Math.ceil(rows / 3));
  const sinkC = cols - 1 - randInt(Math.ceil(cols / 3));

  // Generate a random path from source to sink using random walk
  function generatePath() {
    const path = [{ r: sourceR, c: sourceC }];
    const visited = new Set([`${sourceR},${sourceC}`]);
    let cur = { r: sourceR, c: sourceC };
    let maxSteps = rows * cols * 3;

    while ((cur.r !== sinkR || cur.c !== sinkC) && maxSteps-- > 0) {
      // Bias toward sink
      const dirs = [];
      if (cur.r > sinkR && cur.r > 0) dirs.push(0, 0); // N (biased)
      if (cur.c < sinkC && cur.c < cols - 1) dirs.push(1, 1); // E (biased)
      if (cur.r < sinkR && cur.r < rows - 1) dirs.push(2, 2); // S (biased)
      if (cur.c > sinkC && cur.c > 0) dirs.push(3, 3); // W (biased)
      // Add unbiased
      if (cur.r > 0) dirs.push(0);
      if (cur.c < cols - 1) dirs.push(1);
      if (cur.r < rows - 1) dirs.push(2);
      if (cur.c > 0) dirs.push(3);

      let found = false;
      const shuffled = dirs.sort(() => rand() - 0.5);
      for (const dir of shuffled) {
        const nb = getNeighbor(cur.r, cur.c, dir);
        if (nb.r < 0 || nb.r >= rows || nb.c < 0 || nb.c >= cols) continue;
        const key = `${nb.r},${nb.c}`;
        if (visited.has(key) && (nb.r !== sinkR || nb.c !== sinkC)) continue;
        cur = nb;
        if (!visited.has(key)) {
          visited.add(key);
          path.push({ ...cur });
        }
        found = true;
        break;
      }
      if (!found) break;
      if (cur.r === sinkR && cur.c === sinkC) break;
    }

    return path;
  }

  const path = generatePath();

  // Build solution grid: figure out required connections for each path node
  const solutionGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: 'I', rotation: 0 }))
  );

  // For each path cell, determine which directions connect to path neighbors
  const pathSet = new Set(path.map(p => `${p.r},${p.c}`));

  for (let i = 0; i < path.length; i++) {
    const { r, c } = path[i];
    const connDirs = [];

    for (let dir = 0; dir < 4; dir++) {
      const nb = getNeighbor(r, c, dir);
      if (nb.r < 0 || nb.r >= rows || nb.c < 0 || nb.c >= cols) continue;
      const key = `${nb.r},${nb.c}`;
      // Check if this neighbor is adjacent in path
      const isPathNeighbor = pathSet.has(key) && (
        (i > 0 && path[i-1].r === nb.r && path[i-1].c === nb.c) ||
        (i < path.length-1 && path[i+1].r === nb.r && path[i+1].c === nb.c)
      );
      if (isPathNeighbor) connDirs.push(dir);
    }

    // Choose node type and rotation that matches connDirs
    const { type, rotation } = findNodeForDirs(connDirs, rand);
    solutionGrid[r][c] = { type, rotation };
  }

  // Fill non-path cells with random nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!pathSet.has(`${r},${c}`)) {
        const types = ['I', 'L', 'T', 'X'];
        solutionGrid[r][c] = {
          type: types[randInt(types.length)],
          rotation: randInt(4)
        };
      }
    }
  }

  // Now scramble: randomize rotations for puzzle state
  const puzzleGrid = solutionGrid.map(row =>
    row.map(node => ({ ...node, rotation: randInt(4) }))
  );

  return {
    rows,
    cols,
    grid: puzzleGrid,
    solutionGrid,
    source: { r: sourceR, c: sourceC },
    sink: { r: sinkR, c: sinkC },
    moves: 0,
    solved: false,
    levelIndex,
    path: path.length,
  };
}

/**
 * Find a node type and rotation that provides exactly the given connection directions
 */
function findNodeForDirs(dirs, rand) {
  const count = dirs.length;

  if (count === 0) {
    // Dead node - use random
    return { type: 'I', rotation: 0 };
  }

  if (count === 1) {
    // Dead end - not really solvable, use L
    // Just pick something
    return { type: 'L', rotation: dirs[0] === 0 ? 3 : dirs[0] - 1 };
  }

  if (count === 2) {
    const [a, b] = dirs.sort((x, y) => x - y);
    // Check if straight
    if ((a + 2) % 4 === b) {
      // Opposite = straight 'I'
      return { type: 'I', rotation: a === 0 ? 0 : 1 }; // N-S=0, E-W=1
    } else {
      // Adjacent = elbow 'L'
      // L at rot=0: N(0) and E(1)
      // L at rot=1: E(1) and S(2)
      // L at rot=2: S(2) and W(3)
      // L at rot=3: W(3) and N(0)
      if (a === 0 && b === 1) return { type: 'L', rotation: 0 };
      if (a === 1 && b === 2) return { type: 'L', rotation: 1 };
      if (a === 2 && b === 3) return { type: 'L', rotation: 2 };
      if (a === 0 && b === 3) return { type: 'L', rotation: 3 };
    }
  }

  if (count === 3) {
    // T-junction - missing one direction
    const all = [0, 1, 2, 3];
    const missing = all.find(d => !dirs.includes(d));
    // T at rot=0: N,E,S (missing W=3) → missing=3 → rot=0
    // T at rot=1: E,S,W (missing N=0) → missing=0 → rot=1
    // T at rot=2: S,W,N (missing E=1) → missing=1 → rot=2
    // T at rot=3: W,N,E (missing S=2) → missing=2 → rot=3
    const rotMap = { 3: 0, 0: 1, 1: 2, 2: 3 };
    return { type: 'T', rotation: rotMap[missing] };
  }

  if (count === 4) {
    return { type: 'X', rotation: 0 };
  }

  return { type: 'I', rotation: 0 };
}

/**
 * Initialize game state for a given level
 */
export function initGame(levelIndex = 0, seed = null) {
  const levelState = generateLevel(levelIndex, seed);
  return {
    ...levelState,
    solved: false,
    moves: 0,
    startTime: Date.now(),
  };
}
