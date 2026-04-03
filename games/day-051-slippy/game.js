/**
 * Slippy! - Ice Slide Penguin Duel
 * Pure game logic module (no DOM dependencies)
 */

const CELL_EMPTY = 0;
const CELL_ICE = 1;
const CELL_ROCK = 2;
const CELL_FISH = 3;

const DIRS = {
  up:    { dx: 0,  dy: -1 },
  down:  { dx: 0,  dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx: 1,  dy:  0 },
};

function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(CELL_ICE));
}

function initGame(playerNames) {
  const ROWS = 8, COLS = 8;
  const grid = createGrid(ROWS, COLS);

  // Place rocks (icebergs) at fixed positions
  const rocks = [
    [2,2],[2,5],[5,2],[5,5],
    [1,4],[4,1],[3,6],[6,3],
    [0,3],[7,4],
  ];
  for (const [r,c] of rocks) {
    grid[r][c] = CELL_ROCK;
  }

  // Place fish at fixed positions  
  const fishPositions = [
    [0,1],[0,5],[1,2],[1,6],
    [2,0],[2,7],[3,3],[3,4],
    [4,3],[4,4],[5,0],[5,7],
    [6,1],[6,6],[7,2],[7,5],
  ];
  for (const [r,c] of fishPositions) {
    grid[r][c] = CELL_FISH;
  }

  // Player start corners
  const startPos = [
    { r: 0, c: 0 },
    { r: 7, c: 7 },
    { r: 7, c: 0 },
    { r: 0, c: 7 },
  ];

  const players = playerNames.slice(0, 4).map((name, i) => ({
    name,
    r: startPos[i].r,
    c: startPos[i].c,
    fish: 0,
    eliminated: false,
  }));

  return {
    grid,
    players,
    currentPlayer: 0,
    rows: ROWS,
    cols: COLS,
    totalFish: fishPositions.length,
    fishCollected: 0,
    gameOver: false,
    winner: null,
    lastMove: null,
  };
}

function getPlayerAt(state, r, c, excludeIndex = -1) {
  return state.players.findIndex((p, i) => i !== excludeIndex && !p.eliminated && p.r === r && p.c === c);
}

function slidePlayer(state, playerIndex, dir) {
  if (state.gameOver) return state;
  const { dx, dy } = DIRS[dir];
  const player = state.players[playerIndex];
  if (!player || player.eliminated) return state;

  // Deep clone state
  const newState = JSON.parse(JSON.stringify(state));
  const p = newState.players[playerIndex];
  
  let nr = p.r + dy;
  let nc = p.c + dx;
  let fishCollected = 0;
  let bumpedPlayer = null;
  let slideSteps = 0;

  while (nr >= 0 && nr < newState.rows && nc >= 0 && nc < newState.cols) {
    const cell = newState.grid[nr][nc];
    
    // Check if another player is there
    const otherIdx = getPlayerAt(newState, nr, nc, playerIndex);
    if (otherIdx !== -1) {
      // Bump: try to push that player one step in the same direction
      const other = newState.players[otherIdx];
      const pushR = other.r + dy;
      const pushC = other.c + dx;
      const canPush = pushR >= 0 && pushR < newState.rows && 
                      pushC >= 0 && pushC < newState.cols &&
                      newState.grid[pushR][pushC] !== CELL_ROCK &&
                      getPlayerAt(newState, pushR, pushC) === -1;
      if (canPush) {
        // Collect fish at push destination
        if (newState.grid[pushR][pushC] === CELL_FISH) {
          newState.grid[pushR][pushC] = CELL_ICE;
          other.fish += 1;
          newState.fishCollected += 1;
        }
        other.r = pushR;
        other.c = pushC;
        bumpedPlayer = otherIdx;
      }
      // Stop here regardless
      break;
    }
    
    // Check for rock
    if (cell === CELL_ROCK) break;
    
    // Move to this cell
    p.r = nr;
    p.c = nc;
    slideSteps++;
    
    // Collect fish
    if (cell === CELL_FISH) {
      newState.grid[nr][nc] = CELL_ICE;
      fishCollected++;
      newState.fishCollected++;
    }
    
    nr += dy;
    nc += dx;
  }

  p.fish += fishCollected;

  newState.lastMove = {
    playerIndex,
    dir,
    from: { r: state.players[playerIndex].r, c: state.players[playerIndex].c },
    to: { r: p.r, c: p.c },
    fishCollected,
    bumpedPlayer,
    slideSteps,
  };

  // Check if game over (all fish collected)
  if (newState.fishCollected >= newState.totalFish) {
    newState.gameOver = true;
    let maxFish = -1;
    newState.players.forEach((pl, i) => {
      if (pl.fish > maxFish) { maxFish = pl.fish; newState.winner = i; }
    });
    // Check for tie
    const winners = newState.players.filter(pl => pl.fish === maxFish);
    if (winners.length > 1) newState.winner = -1; // tie
  }

  // Advance turn
  const np = newState.players.length;
  let next = (playerIndex + 1) % np;
  newState.currentPlayer = next;

  return newState;
}

function isBlocked(state, r, c) {
  if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return true;
  if (state.grid[r][c] === CELL_ROCK) return true;
  if (getPlayerAt(state, r, c) !== -1) return true;
  return false;
}

function getValidMoves(state, playerIndex) {
  const p = state.players[playerIndex];
  const moves = [];
  for (const [dir, { dx, dy }] of Object.entries(DIRS)) {
    const nr = p.r + dy;
    const nc = p.c + dx;
    if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
      moves.push(dir);
    }
  }
  return moves;
}

module.exports = {
  CELL_EMPTY, CELL_ICE, CELL_ROCK, CELL_FISH,
  DIRS, createGrid, initGame, slidePlayer, getPlayerAt, isBlocked, getValidMoves,
};
