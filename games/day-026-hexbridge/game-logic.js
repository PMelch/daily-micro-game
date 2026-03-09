/**
 * HexBridge — game logic (pure, testable)
 * Pass & Play connection strategy on a hexagonal grid.
 *
 * Player 1 (BLUE)  : connects TOP edge ↔ BOTTOM edge
 * Player 2 (RED)   : connects LEFT edge ↔ RIGHT edge
 *
 * Win condition: BFS from your start-edge to your end-edge
 * through your own connected pieces.
 *
 * Neighbor directions in "offset row" hex grid (pointy-top):
 *   [-1, 0], [-1, +1], [0, -1], [0, +1], [+1, -1], [+1, 0]
 */

export const EMPTY  = 0;
export const BLUE   = 1; // Player 1 — TOP → BOTTOM
export const RED    = 2; // Player 2 — LEFT → RIGHT

export class HexBridgeGame {
  /**
   * @param {number} size - board size (default 9)
   */
  constructor(size = 9) {
    this.size = size;
    // board[row][col]: 0=empty, 1=blue, 2=red
    this.board = Array.from({ length: size }, () => new Array(size).fill(EMPTY));
    this.currentPlayer = BLUE;
    this.winner = null;   // null | BLUE | RED
    this.winPath = null;  // array of [row,col] or null
    this.moveCount = 0;
  }

  /**
   * Place a stone for the current player at (row, col).
   * @returns {boolean} true if move was accepted
   */
  place(row, col) {
    if (this.winner !== null) return false;
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return false;
    if (this.board[row][col] !== EMPTY) return false;

    this.board[row][col] = this.currentPlayer;
    this.moveCount++;

    const path = this.getWinningPath(this.currentPlayer);
    if (path) {
      this.winner   = this.currentPlayer;
      this.winPath  = path;
    } else {
      this.currentPlayer = this.currentPlayer === BLUE ? RED : BLUE;
    }
    return true;
  }

  /**
   * Return the six hex-grid neighbours of (row, col), filtered to valid coords.
   */
  getNeighbors(row, col) {
    const DIRS = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]];
    return DIRS
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(([r, c]) => r >= 0 && r < this.size && c >= 0 && c < this.size);
  }

  /**
   * BFS win-check for `player`.
   * BLUE wins: any cell in row 0 → any cell in row (size-1)
   * RED  wins: any cell in col 0 → any cell in col (size-1)
   * @returns {boolean}
   */
  checkWin(player) {
    return this.getWinningPath(player) !== null;
  }

  /**
   * BFS that returns the winning path as [[row,col],...] or null if no path.
   */
  getWinningPath(player) {
    const parent = new Map();
    const queue  = [];

    const isStart = (r, c) => player === BLUE ? r === 0           : c === 0;
    const isEnd   = (r, c) => player === BLUE ? r === this.size-1 : c === this.size-1;

    // Seed with all start-edge cells owned by player
    for (let i = 0; i < this.size; i++) {
      const [r, c] = player === BLUE ? [0, i] : [i, 0];
      if (this.board[r][c] === player) {
        const key = `${r},${c}`;
        parent.set(key, null);
        queue.push([r, c]);
      }
    }

    while (queue.length) {
      const [r, c] = queue.shift();
      if (isEnd(r, c)) {
        return this._reconstructPath(parent, `${r},${c}`);
      }
      for (const [nr, nc] of this.getNeighbors(r, c)) {
        const key = `${nr},${nc}`;
        if (!parent.has(key) && this.board[nr][nc] === player) {
          parent.set(key, `${r},${c}`);
          queue.push([nr, nc]);
        }
      }
    }
    return null;
  }

  _reconstructPath(parent, endKey) {
    const path = [];
    let cur = endKey;
    while (cur !== null) {
      path.push(cur.split(',').map(Number));
      cur = parent.get(cur);
    }
    return path;
  }

  /**
   * Serialize state (for simple undo / save)
   */
  serialize() {
    return {
      size:          this.size,
      board:         this.board.map(row => [...row]),
      currentPlayer: this.currentPlayer,
      winner:        this.winner,
      winPath:       this.winPath,
      moveCount:     this.moveCount,
    };
  }

  /** Reset to fresh game (same size) */
  reset() {
    this.board         = Array.from({ length: this.size }, () => new Array(this.size).fill(EMPTY));
    this.currentPlayer = BLUE;
    this.winner        = null;
    this.winPath       = null;
    this.moveCount     = 0;
  }
}
