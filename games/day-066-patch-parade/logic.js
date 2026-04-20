(function(global){
const BOARD_SIZE = 6;
const COLORS = ['gold', 'mint', 'violet', 'coral'];
const SHAPES = [
  [[0,0],[1,0],[0,1]],
  [[0,0],[1,0],[2,0]],
  [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[1,1],[2,1]],
  [[0,0],[1,0],[2,0],[1,1]],
  [[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[0,1]],
];

function createRng(seed = Date.now()) {
  let state = seed >>> 0;
  return function rand() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function createStars(rand) {
  const taken = new Set();
  const stars = [];
  while (stars.length < 4) {
    const x = Math.floor(rand() * BOARD_SIZE);
    const y = Math.floor(rand() * BOARD_SIZE);
    const key = `${x},${y}`;
    if (taken.has(key)) continue;
    taken.add(key);
    stars.push({ x, y });
  }
  return stars;
}

function createGame(names, seed = 1) {
  const rand = createRng(seed);
  return {
    round: 1,
    maxRounds: 7,
    players: names.map((name, index) => ({
      id: index,
      name,
      board: emptyBoard(),
      score: 0,
      stars: createStars(rand),
      placements: 0,
    })),
  };
}

function normalizeCells(cells) {
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells.map(([x, y]) => [x - minX, y - minY]);
}

function rotateCells(cells, turns = 0) {
  let rotated = cells.map(([x, y]) => [x, y]);
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) {
    rotated = normalizeCells(rotated.map(([x, y]) => [-y, x]));
  }
  return rotated;
}

function canPlacePatch(board, patch, originX, originY) {
  return patch.cells.every(([dx, dy]) => {
    const x = originX + dx;
    const y = originY + dy;
    return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE && board[y][x] === null;
  });
}

function scoreAdjacency(board, color, x, y) {
  let score = 0;
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    if (board[y + dy]?.[x + dx] === color) score += 1;
  }
  return score;
}

function scoreCompletedLines(board, touchedRows, touchedCols) {
  let score = 0;
  touchedRows.forEach((row) => {
    if (board[row].every(Boolean)) score += 2;
  });
  touchedCols.forEach((col) => {
    if (board.every((row) => row[col])) score += 2;
  });
  return score;
}

function placePatch(game, playerIndex, patch, originX, originY) {
  const player = game.players[playerIndex];
  if (!canPlacePatch(player.board, patch, originX, originY)) {
    return { placed: false, scoreDelta: 0 };
  }
  let score = 0;
  const touchedRows = new Set();
  const touchedCols = new Set();
  patch.cells.forEach(([dx, dy]) => {
    const x = originX + dx;
    const y = originY + dy;
    player.board[y][x] = patch.color;
    touchedRows.add(y);
    touchedCols.add(x);
    score += 1;
    score += scoreAdjacency(player.board, patch.color, x, y);
    const starIndex = player.stars.findIndex((star) => star.x === x && star.y === y);
    if (starIndex >= 0) {
      score += 2;
      player.stars.splice(starIndex, 1);
    }
  });
  score += scoreCompletedLines(player.board, touchedRows, touchedCols);
  player.score += score;
  player.placements += 1;
  return { placed: true, scoreDelta: score };
}

function largestRegion(board, color) {
  const seen = new Set();
  let best = 0;
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const key = `${x},${y}`;
      if (board[y][x] !== color || seen.has(key)) continue;
      let size = 0;
      const stack = [[x, y]];
      seen.add(key);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        size += 1;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          const nextKey = `${nx},${ny}`;
          if (board[ny]?.[nx] === color && !seen.has(nextKey)) {
            seen.add(nextKey);
            stack.push([nx, ny]);
          }
        }
      }
      best = Math.max(best, size);
    }
  }
  return best;
}

function getScores(game) {
  return game.players.map((player) => {
    const bonus = Math.max(...COLORS.map((color) => largestRegion(player.board, color)), 0);
    return { name: player.name, score: player.score + bonus, bonus };
  }).sort((a, b) => b.score - a.score);
}

function createRoundOffer(round, seed = 1) {
  const rand = createRng(seed + round * 999);
  return Array.from({ length: 3 }, (_, index) => ({
    id: `patch-${round}-${index}`,
    color: COLORS[Math.floor(rand() * COLORS.length)],
    cells: rotateCells(SHAPES[Math.floor(rand() * SHAPES.length)], Math.floor(rand() * 4)),
  }));
}

const api = { BOARD_SIZE, COLORS, createGame, rotateCells, canPlacePatch, placePatch, getScores, createRoundOffer };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
Object.assign(global, api);
})(typeof window !== 'undefined' ? window : globalThis);
