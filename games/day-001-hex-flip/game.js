// Hex Flip - Game Logic
// Axial coordinate hex grid with lights-out mechanics

export function createGrid(radius) {
  const cells = {};
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) <= radius) {
        cells[`${q},${r}`] = 0; // 0 = off, 1 = on
      }
    }
  }
  return cells;
}

export function getNeighbors(q, r) {
  return [
    [q + 1, r], [q - 1, r],
    [q, r + 1], [q, r - 1],
    [q + 1, r - 1], [q - 1, r + 1]
  ];
}

export function toggle(grid, q, r) {
  const key = `${q},${r}`;
  if (!(key in grid)) return grid;
  const next = { ...grid };
  // Toggle clicked cell and neighbors
  const targets = [[q, r], ...getNeighbors(q, r)];
  for (const [tq, tr] of targets) {
    const tk = `${tq},${tr}`;
    if (tk in next) {
      next[tk] = next[tk] === 0 ? 1 : 0;
    }
  }
  return next;
}

export function isWin(grid) {
  const values = Object.values(grid);
  return values.every(v => v === 0) || values.every(v => v === 1);
}

export function generatePuzzle(radius, moves) {
  let grid = createGrid(radius);
  const keys = Object.keys(grid);
  const applied = [];
  for (let i = 0; i < moves; i++) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    const [q, r] = key.split(',').map(Number);
    grid = toggle(grid, q, r);
    applied.push([q, r]);
  }
  // Make sure it's not already solved
  if (isWin(grid)) {
    const key = keys[0];
    const [q, r] = key.split(',').map(Number);
    grid = toggle(grid, q, r);
  }
  return grid;
}
