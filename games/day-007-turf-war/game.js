// Turf War - Pass & Play Territory Game

export class TurfWarGame {
  constructor(playerNames = ['Spieler 1', 'Spieler 2']) {
    this.players = playerNames.map((name, i) => ({
      name,
      index: i,
      score: 0,
      color: TurfWarGame.COLORS[i]
    }));
    this.gridSize = 7;
    this.grid = this.createGrid();
    this.currentPlayerIndex = 0;
    this.turnsLeft = this.countFreeCells();
    this.gameOver = false;
  }

  static COLORS = ['#ff4466', '#4488ff', '#44cc88', '#ffaa22'];

  createGrid() {
    const grid = [];
    for (let r = 0; r < this.gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < this.gridSize; c++) {
        grid[r][c] = { owner: null, bonus: this.randomBonus() };
      }
    }
    return grid;
  }

  randomBonus() {
    const roll = Math.random();
    if (roll < 0.08) return 3;  // gold cell
    if (roll < 0.25) return 2;  // silver cell
    return 1;
  }

  countFreeCells() {
    let count = 0;
    for (let r = 0; r < this.gridSize; r++)
      for (let c = 0; c < this.gridSize; c++)
        if (this.grid[r][c].owner === null) count++;
    return count;
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getNeighbors(r, c) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    return dirs
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize);
  }

  adjacencyBonus(r, c, playerIndex) {
    let bonus = 0;
    for (const [nr, nc] of this.getNeighbors(r, c)) {
      if (this.grid[nr][nc].owner === playerIndex) bonus++;
    }
    return bonus;
  }

  claimCell(r, c) {
    if (this.gameOver) return { success: false, reason: 'Game is over' };
    if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize)
      return { success: false, reason: 'Out of bounds' };
    if (this.grid[r][c].owner !== null)
      return { success: false, reason: 'Cell already claimed' };

    const cell = this.grid[r][c];
    const adj = this.adjacencyBonus(r, c, this.currentPlayerIndex);
    const points = cell.bonus + adj;

    cell.owner = this.currentPlayerIndex;
    this.currentPlayer.score += points;
    this.turnsLeft--;

    const result = {
      success: true,
      player: this.currentPlayer,
      points,
      cellBonus: cell.bonus,
      adjacencyBonus: adj
    };

    if (this.turnsLeft <= 0) {
      this.gameOver = true;
      result.gameOver = true;
      result.winner = this.getWinner();
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    return result;
  }

  getWinner() {
    let maxScore = -1;
    let winners = [];
    for (const p of this.players) {
      if (p.score > maxScore) {
        maxScore = p.score;
        winners = [p];
      } else if (p.score === maxScore) {
        winners.push(p);
      }
    }
    return winners.length === 1 ? winners[0] : null; // null = tie
  }

  getScores() {
    return this.players.map(p => ({ name: p.name, score: p.score, color: p.color }));
  }
}
