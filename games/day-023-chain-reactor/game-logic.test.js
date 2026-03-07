/**
 * Chain Reactor - TDD Tests
 * Run with: bun test
 */

const {
  createGrid,
  criticalMass,
  getNeighbors,
  canPlace,
  cloneGrid,
  placeAtom,
  processExplosions,
  countAtomsPerPlayer,
  getWinner,
} = require('./game-logic');

// ─── createGrid ───────────────────────────────────────────────────────────────

describe('createGrid', () => {
  test('creates a grid with correct dimensions', () => {
    const grid = createGrid(5, 6);
    expect(grid.length).toBe(5);
    expect(grid[0].length).toBe(6);
  });

  test('all cells start empty (atoms=0, player=-1)', () => {
    const grid = createGrid(3, 3);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.atoms).toBe(0);
        expect(cell.player).toBe(-1);
      }
    }
  });

  test('cells are independent objects (no shared references)', () => {
    const grid = createGrid(3, 3);
    grid[0][0].atoms = 99;
    expect(grid[1][1].atoms).toBe(0);
  });
});

// ─── criticalMass ─────────────────────────────────────────────────────────────

describe('criticalMass', () => {
  const ROWS = 5, COLS = 5;

  test('corner cells have critical mass 2', () => {
    expect(criticalMass(0, 0, ROWS, COLS)).toBe(2);
    expect(criticalMass(0, 4, ROWS, COLS)).toBe(2);
    expect(criticalMass(4, 0, ROWS, COLS)).toBe(2);
    expect(criticalMass(4, 4, ROWS, COLS)).toBe(2);
  });

  test('edge (non-corner) cells have critical mass 3', () => {
    expect(criticalMass(0, 2, ROWS, COLS)).toBe(3); // top edge
    expect(criticalMass(4, 2, ROWS, COLS)).toBe(3); // bottom edge
    expect(criticalMass(2, 0, ROWS, COLS)).toBe(3); // left edge
    expect(criticalMass(2, 4, ROWS, COLS)).toBe(3); // right edge
  });

  test('center cells have critical mass 4', () => {
    expect(criticalMass(2, 2, ROWS, COLS)).toBe(4);
    expect(criticalMass(1, 1, ROWS, COLS)).toBe(4);
    expect(criticalMass(3, 3, ROWS, COLS)).toBe(4);
  });
});

// ─── getNeighbors ─────────────────────────────────────────────────────────────

describe('getNeighbors', () => {
  test('center cell has 4 neighbors', () => {
    const n = getNeighbors(2, 2, 5, 5);
    expect(n.length).toBe(4);
  });

  test('corner cell has 2 neighbors', () => {
    const n = getNeighbors(0, 0, 5, 5);
    expect(n.length).toBe(2);
    expect(n).toContainEqual([1, 0]);
    expect(n).toContainEqual([0, 1]);
  });

  test('edge cell has 3 neighbors', () => {
    const n = getNeighbors(0, 2, 5, 5);
    expect(n.length).toBe(3);
  });
});

// ─── canPlace ─────────────────────────────────────────────────────────────────

describe('canPlace', () => {
  test('can place on empty cell', () => {
    const grid = createGrid(3, 3);
    expect(canPlace(grid, 1, 1, 0)).toBe(true);
  });

  test('can place on own cell', () => {
    let grid = createGrid(3, 3);
    grid = placeAtom(grid, 1, 1, 0);
    expect(canPlace(grid, 1, 1, 0)).toBe(true);
  });

  test('cannot place on opponent cell', () => {
    let grid = createGrid(3, 3);
    grid = placeAtom(grid, 1, 1, 1);
    expect(canPlace(grid, 1, 1, 0)).toBe(false);
  });
});

// ─── placeAtom ────────────────────────────────────────────────────────────────

describe('placeAtom', () => {
  test('adds one atom to empty cell', () => {
    const grid = createGrid(3, 3);
    const newGrid = placeAtom(grid, 1, 1, 0);
    expect(newGrid[1][1].atoms).toBe(1);
    expect(newGrid[1][1].player).toBe(0);
  });

  test('increments atoms on own cell', () => {
    let grid = createGrid(3, 3);
    grid = placeAtom(grid, 1, 1, 0);
    grid = placeAtom(grid, 1, 1, 0);
    expect(grid[1][1].atoms).toBe(2);
    expect(grid[1][1].player).toBe(0);
  });

  test('does not mutate original grid', () => {
    const grid = createGrid(3, 3);
    const newGrid = placeAtom(grid, 1, 1, 0);
    expect(grid[1][1].atoms).toBe(0);
    expect(newGrid[1][1].atoms).toBe(1);
  });
});

// ─── processExplosions ────────────────────────────────────────────────────────

describe('processExplosions', () => {
  test('no explosion when below critical mass', () => {
    let grid = createGrid(5, 5);
    // Corner cell: critical mass = 2; with 1 atom no explosion
    grid = placeAtom(grid, 0, 0, 0);
    const { grid: result } = processExplosions(grid);
    expect(result[0][0].atoms).toBe(1);
  });

  test('corner cell explodes at critical mass 2', () => {
    let grid = createGrid(5, 5);
    grid[0][0] = { atoms: 2, player: 0 };
    const { grid: result } = processExplosions(grid);
    // Corner (0,0) explodes: sends to (1,0) and (0,1)
    expect(result[0][0].atoms).toBe(0);
    expect(result[1][0].atoms).toBe(1);
    expect(result[0][1].atoms).toBe(1);
  });

  test('explosion converts opponent atoms', () => {
    let grid = createGrid(5, 5);
    // Player 0 places at corner, player 1 at adjacent cell
    grid[0][0] = { atoms: 2, player: 0 }; // will explode
    grid[0][1] = { atoms: 1, player: 1 }; // will be converted
    const { grid: result } = processExplosions(grid);
    // (0,1) should now belong to player 0
    expect(result[0][1].player).toBe(0);
  });

  test('chain reactions trigger correctly', () => {
    // Set up a chain: corner(0,0) has 2 atoms (player 0)
    // After explosion, neighbor (0,1) might also explode if it was near mass
    let grid = createGrid(5, 5);
    grid[0][0] = { atoms: 2, player: 0 };
    // (0,1) is edge cell, critical mass = 3. Give it 2 atoms
    grid[0][1] = { atoms: 2, player: 0 };
    // After (0,0) explodes, (0,1) gets +1 → 3 atoms → should also explode
    const { grid: result } = processExplosions(grid);
    // (0,1) had 2, receives 1 from (0,0) explosion → now 3 = critical mass → explodes
    // After chain, atoms spread further
    expect(result[0][1].atoms).toBe(0); // Should have exploded
  });

  test('explodedCells list is populated', () => {
    let grid = createGrid(5, 5);
    grid[0][0] = { atoms: 2, player: 0 };
    const { explodedCells } = processExplosions(grid);
    expect(explodedCells.length).toBeGreaterThan(0);
    expect(explodedCells[0]).toEqual([0, 0]);
  });
});

// ─── countAtomsPerPlayer ──────────────────────────────────────────────────────

describe('countAtomsPerPlayer', () => {
  test('counts atoms correctly for each player', () => {
    let grid = createGrid(3, 3);
    grid[0][0] = { atoms: 2, player: 0 };
    grid[1][1] = { atoms: 3, player: 1 };
    grid[2][2] = { atoms: 1, player: 0 };
    const counts = countAtomsPerPlayer(grid, 2);
    expect(counts[0]).toBe(3); // 2+1
    expect(counts[1]).toBe(3);
  });

  test('returns zeros for empty grid', () => {
    const grid = createGrid(3, 3);
    const counts = countAtomsPerPlayer(grid, 2);
    expect(counts).toEqual([0, 0]);
  });
});

// ─── getWinner ────────────────────────────────────────────────────────────────

describe('getWinner', () => {
  test('returns -1 before enough turns', () => {
    let grid = createGrid(3, 3);
    grid[0][0] = { atoms: 5, player: 0 };
    // Only 1 turn played for 2 players - not enough
    expect(getWinner(grid, 2, 1)).toBe(-1);
  });

  test('returns -1 when multiple players have atoms', () => {
    let grid = createGrid(3, 3);
    grid[0][0] = { atoms: 1, player: 0 };
    grid[1][1] = { atoms: 1, player: 1 };
    expect(getWinner(grid, 2, 4)).toBe(-1);
  });

  test('returns winner when only one player has atoms', () => {
    let grid = createGrid(3, 3);
    grid[0][0] = { atoms: 1, player: 0 };
    grid[1][1] = { atoms: 2, player: 0 };
    // player 1 has 0 atoms
    expect(getWinner(grid, 2, 4)).toBe(0);
  });

  test('returns -1 when no players have atoms (impossible but safe)', () => {
    const grid = createGrid(3, 3);
    expect(getWinner(grid, 2, 4)).toBe(-1);
  });
});
