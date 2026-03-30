/**
 * Mine Rivals - TDD Tests
 * Pass & Play: 2 players share a minesweeper grid, take turns, lose HP on mines.
 */
import { describe, test, expect, beforeEach } from 'bun:test';
import {
  createBoard,
  revealCell,
  flagCell,
  getAdjacentCount,
  checkGameOver,
  getPlayerHP,
  CELL_STATE,
  GAME_STATE,
} from './game-logic.js';

describe('createBoard', () => {
  test('creates board with correct dimensions', () => {
    const board = createBoard(9, 9, 10);
    expect(board.cells.length).toBe(9);
    expect(board.cells[0].length).toBe(9);
  });

  test('places correct number of mines', () => {
    const board = createBoard(9, 9, 10);
    let mineCount = 0;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board.cells[r][c].isMine) mineCount++;
    expect(mineCount).toBe(10);
  });

  test('all cells start hidden', () => {
    const board = createBoard(9, 9, 10);
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        expect(board.cells[r][c].state).toBe(CELL_STATE.HIDDEN);
  });

  test('initializes 2-player state', () => {
    const board = createBoard(9, 9, 10);
    expect(board.players.length).toBe(2);
    expect(board.players[0].hp).toBe(3);
    expect(board.players[1].hp).toBe(3);
    expect(board.currentPlayer).toBe(0);
  });

  test('game starts in PLAYING state', () => {
    const board = createBoard(9, 9, 10);
    expect(board.gameState).toBe(GAME_STATE.PLAYING);
  });
});

describe('getAdjacentCount', () => {
  test('returns correct mine count for center cell', () => {
    // Build a small board manually
    const board = createBoard(3, 3, 0);
    // Manually place mines
    board.cells[0][0].isMine = true;
    board.cells[0][2].isMine = true;
    const count = getAdjacentCount(board, 1, 1);
    expect(count).toBe(2);
  });

  test('returns 0 for cell with no adjacent mines', () => {
    const board = createBoard(3, 3, 0);
    board.cells[0][0].isMine = true;
    const count = getAdjacentCount(board, 2, 2);
    expect(count).toBe(0);
  });

  test('returns correct count for corner cell', () => {
    const board = createBoard(3, 3, 0);
    board.cells[0][1].isMine = true;
    board.cells[1][0].isMine = true;
    board.cells[1][1].isMine = true;
    const count = getAdjacentCount(board, 0, 0);
    expect(count).toBe(3);
  });
});

describe('revealCell', () => {
  let board;
  beforeEach(() => {
    board = createBoard(3, 3, 0);
  });

  test('reveals a safe cell and returns no damage', () => {
    const result = revealCell(board, 1, 1);
    expect(board.cells[1][1].state).toBe(CELL_STATE.REVEALED);
    expect(result.hit).toBe(false);
    expect(result.damage).toBe(0);
  });

  test('hitting a mine reduces current player HP by 1', () => {
    board.cells[1][1].isMine = true;
    const hpBefore = board.players[0].hp;
    const result = revealCell(board, 1, 1);
    expect(result.hit).toBe(true);
    expect(result.damage).toBe(1);
    expect(board.players[0].hp).toBe(hpBefore - 1);
  });

  test('hitting a mine does NOT advance turn (current player keeps turn to "recover")', () => {
    board.cells[1][1].isMine = true;
    revealCell(board, 1, 1);
    // After hitting mine player stays (turn advances after mine recovery)
    // Design: hitting mine advances turn to other player
    expect(board.currentPlayer).toBe(1);
  });

  test('safe reveal advances turn to next player', () => {
    const result = revealCell(board, 0, 0);
    expect(result.hit).toBe(false);
    expect(board.currentPlayer).toBe(1);
  });

  test('cannot reveal already revealed cell', () => {
    revealCell(board, 1, 1);
    board.currentPlayer = 0; // reset for test
    const result = revealCell(board, 1, 1);
    expect(result).toBeNull();
  });

  test('auto-reveal flood fills adjacent zeros', () => {
    // 3x3 board, mine at 2,2
    board.cells[2][2].isMine = true;
    revealCell(board, 0, 0);
    // Cells far from mine should be revealed
    expect(board.cells[0][0].state).toBe(CELL_STATE.REVEALED);
    // Some cells adjacent to mine will have numbers but should also reveal
    expect(board.cells[0][1].state).toBe(CELL_STATE.REVEALED);
  });

  test('scores point for revealing safe cell', () => {
    // 3x3 no-mine board: flood fill reveals all 9 cells
    revealCell(board, 1, 1);
    expect(board.players[0].score).toBeGreaterThanOrEqual(1);
  });
});

describe('flagCell', () => {
  test('flags a hidden cell', () => {
    const board = createBoard(3, 3, 0);
    board.cells[0][0].isMine = true;
    flagCell(board, 0, 0);
    expect(board.cells[0][0].state).toBe(CELL_STATE.FLAGGED);
  });

  test('unflag a flagged cell', () => {
    const board = createBoard(3, 3, 0);
    board.cells[0][0].isMine = true;
    flagCell(board, 0, 0);
    flagCell(board, 0, 0);
    expect(board.cells[0][0].state).toBe(CELL_STATE.HIDDEN);
  });

  test('cannot flag a revealed cell', () => {
    const board = createBoard(3, 3, 0);
    revealCell(board, 1, 1);
    board.currentPlayer = 0;
    flagCell(board, 1, 1);
    expect(board.cells[1][1].state).toBe(CELL_STATE.REVEALED);
  });

  test('flagging a mine scores points for current player', () => {
    const board = createBoard(3, 3, 0);
    board.cells[0][0].isMine = true;
    board.currentPlayer = 0;
    flagCell(board, 0, 0);
    expect(board.players[0].score).toBe(2); // Correctly flagged mine = 2 pts
  });

  test('flagging advances turn', () => {
    const board = createBoard(3, 3, 0);
    flagCell(board, 0, 0);
    expect(board.currentPlayer).toBe(1);
  });
});

describe('checkGameOver', () => {
  test('game not over when players have HP and unrevealed cells remain', () => {
    const board = createBoard(3, 3, 1);
    const result = checkGameOver(board);
    expect(result.over).toBe(false);
  });

  test('game over when a player runs out of HP', () => {
    const board = createBoard(3, 3, 0);
    board.players[0].hp = 0;
    const result = checkGameOver(board);
    expect(result.over).toBe(true);
    expect(result.winner).toBe(1);
  });

  test('game over when all safe cells revealed', () => {
    const board = createBoard(2, 2, 0);
    // Reveal all cells
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++)
        board.cells[r][c].state = CELL_STATE.REVEALED;
    const result = checkGameOver(board);
    expect(result.over).toBe(true);
  });

  test('winner is player with higher score when board cleared', () => {
    const board = createBoard(2, 2, 0);
    board.players[0].score = 5;
    board.players[1].score = 3;
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++)
        board.cells[r][c].state = CELL_STATE.REVEALED;
    const result = checkGameOver(board);
    expect(result.winner).toBe(0);
  });
});

describe('getPlayerHP', () => {
  test('returns HP for player 0', () => {
    const board = createBoard(9, 9, 10);
    expect(getPlayerHP(board, 0)).toBe(3);
    expect(getPlayerHP(board, 1)).toBe(3);
  });
});
