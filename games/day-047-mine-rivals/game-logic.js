/**
 * Mine Rivals - Game Logic
 * Pass & Play: 2 players share a minesweeper grid, take turns revealing cells.
 * Hitting mines costs HP. Points for safe reveals and correct flags.
 */

export const CELL_STATE = {
  HIDDEN: 'hidden',
  REVEALED: 'revealed',
  FLAGGED: 'flagged',
  MINE_HIT: 'mine_hit',
};

export const GAME_STATE = {
  PLAYING: 'playing',
  OVER: 'over',
};

/**
 * Create a new game board.
 * @param {number} rows
 * @param {number} cols
 * @param {number} mineCount
 * @returns {object} board
 */
export function createBoard(rows, cols, mineCount) {
  // Initialize cells
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      isMine: false,
      state: CELL_STATE.HIDDEN,
      adjacentMines: 0,
    }))
  );

  // Place mines randomly
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!cells[r][c].isMine) {
      cells[r][c].isMine = true;
      placed++;
    }
  }

  // Precompute adjacent mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!cells[r][c].isMine) {
        cells[r][c].adjacentMines = _countAdjacent(cells, rows, cols, r, c);
      }
    }
  }

  return {
    rows,
    cols,
    mineCount,
    cells,
    currentPlayer: 0,
    gameState: GAME_STATE.PLAYING,
    players: [
      { hp: 3, score: 0, name: 'Spieler 1' },
      { hp: 3, score: 0, name: 'Spieler 2' },
    ],
  };
}

function _countAdjacent(cells, rows, cols, r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc].isMine) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Get adjacent mine count for a cell (post-creation, for tests).
 */
export function getAdjacentCount(board, r, c) {
  return _countAdjacent(board.cells, board.rows, board.cols, r, c);
}

/**
 * Reveal a cell. Returns result object or null if invalid.
 * @returns {object|null} { hit, damage, revealedCells }
 */
export function revealCell(board, r, c) {
  const cell = board.cells[r][c];
  if (cell.state !== CELL_STATE.HIDDEN) return null;
  if (board.gameState !== GAME_STATE.PLAYING) return null;

  const player = board.currentPlayer;

  if (cell.isMine) {
    cell.state = CELL_STATE.MINE_HIT;
    board.players[player].hp -= 1;
    // Advance turn to other player
    board.currentPlayer = 1 - player;
    return { hit: true, damage: 1, revealedCells: [{ r, c }] };
  }

  // Safe reveal — flood fill zeros
  const revealed = [];
  _floodReveal(board, r, c, revealed);
  
  // Score: 1 point per safe cell revealed
  board.players[player].score += revealed.length;
  
  // Advance turn
  board.currentPlayer = 1 - player;

  return { hit: false, damage: 0, revealedCells: revealed };
}

function _floodReveal(board, r, c, revealed) {
  const cell = board.cells[r][c];
  if (cell.state !== CELL_STATE.HIDDEN) return;
  if (cell.isMine) return;

  cell.state = CELL_STATE.REVEALED;
  revealed.push({ r, c });

  // If no adjacent mines, expand
  if (cell.adjacentMines === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < board.rows && nc >= 0 && nc < board.cols) {
          _floodReveal(board, nr, nc, revealed);
        }
      }
    }
  }
}

/**
 * Flag or unflag a cell.
 * Correctly flagging a mine earns 2 points; unflagging removes them.
 */
export function flagCell(board, r, c) {
  const cell = board.cells[r][c];
  if (cell.state === CELL_STATE.REVEALED) return;
  if (board.gameState !== GAME_STATE.PLAYING) return;

  const player = board.currentPlayer;

  if (cell.state === CELL_STATE.FLAGGED) {
    // Unflag
    cell.state = CELL_STATE.HIDDEN;
    if (cell.isMine) {
      board.players[player].score = Math.max(0, board.players[player].score - 2);
    }
  } else {
    // Flag
    cell.state = CELL_STATE.FLAGGED;
    if (cell.isMine) {
      board.players[player].score += 2;
    }
  }

  // Advance turn
  board.currentPlayer = 1 - player;
}

/**
 * Check if game is over.
 * @returns {{ over: boolean, winner: number|null, reason: string }}
 */
export function checkGameOver(board) {
  // Check if any player has 0 HP
  for (let i = 0; i < board.players.length; i++) {
    if (board.players[i].hp <= 0) {
      const winner = 1 - i;
      return { over: true, winner, reason: 'hp' };
    }
  }

  // Check if all safe cells revealed
  let unrevealedSafe = 0;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      if (!cell.isMine && cell.state !== CELL_STATE.REVEALED) {
        unrevealedSafe++;
      }
    }
  }

  if (unrevealedSafe === 0) {
    // Find winner by score
    const p0 = board.players[0].score;
    const p1 = board.players[1].score;
    const winner = p0 >= p1 ? 0 : 1;
    return { over: true, winner, reason: 'cleared' };
  }

  return { over: false, winner: null, reason: null };
}

/**
 * Get HP for a player.
 */
export function getPlayerHP(board, playerIndex) {
  return board.players[playerIndex].hp;
}
