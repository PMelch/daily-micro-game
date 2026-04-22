import { describe, expect, test } from 'bun:test';
import {
  BOARD_SIZE,
  createGame,
  getSlideDestination,
  getValidMoves,
  applyMove,
  computeWinner,
} from './logic.js';

describe('Floe Showdown logic', () => {
  test('createGame creates players in unique corner starts', () => {
    const game = createGame(['Ada', 'Bob', 'Carla'], 68);

    expect(game.board.length).toBe(BOARD_SIZE);
    expect(game.players.map((player) => player.pos)).toEqual([
      { x: 0, y: 0 },
      { x: 6, y: 6 },
      { x: 6, y: 0 },
    ]);
    expect(game.board[0][0].fish).toBe(0);
    expect(game.board[6][6].fish).toBe(0);
  });

  test('getSlideDestination stops before sunk tiles', () => {
    const game = createGame(['Ada', 'Bob'], 68);
    game.board[0][4].sunk = true;
    const move = getSlideDestination(game, 0, 'right');

    expect(move.landing).toEqual({ x: 3, y: 0 });
    expect(move.path).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  test('getValidMoves includes fish totals for each direction', () => {
    const game = createGame(['Ada', 'Bob'], 68);
    game.board[0][1].fish = 2;
    game.board[0][2].fish = 3;
    game.board[0][3].fish = 1;

    const moves = getValidMoves(game, 0);
    const rightMove = moves.find((move) => move.direction === 'right');

    expect(rightMove.distance).toBe(6);
    expect(rightMove.fish).toBeGreaterThanOrEqual(6);
  });

  test('applyMove cracks the travelled trail, awards fish, and advances to next player', () => {
    const game = createGame(['Ada', 'Bob'], 68);
    game.board[0][1].fish = 2;
    game.board[0][2].fish = 1;
    game.board[0][3].fish = 1;
    game.board[0][4].fish = 0;
    game.board[0][5].fish = 3;
    game.board[0][6].fish = 2;

    const result = applyMove(game, 'right');

    expect(result).toEqual({ ok: true, gained: 9, landing: { x: 6, y: 0 } });
    expect(game.players[0].score).toBe(9);
    expect(game.players[0].pos).toEqual({ x: 6, y: 0 });
    expect(game.board[0][0].sunk).toBe(true);
    expect(game.board[0][5].sunk).toBe(true);
    expect(game.board[0][6].sunk).toBe(false);
    expect(game.currentPlayerIndex).toBe(1);
    expect(game.status).toBe('transition');
  });

  test('game finishes when everyone is trapped', () => {
    const game = createGame(['Ada', 'Bob'], 68);
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        game.board[y][x].sunk = true;
        game.board[y][x].fish = 0;
      }
    }
    game.board[0][0].sunk = false;
    game.board[6][6].sunk = false;
    game.players[0].score = 3;
    game.players[1].score = 7;

    const result = applyMove(game, 'right');

    expect(result).toEqual({ ok: false, reason: 'invalid-move' });
    expect(getValidMoves(game, 0)).toEqual([]);
    game.players[0].trapped = true;
    game.players[1].trapped = true;
    game.status = 'finished';
    game.winner = computeWinner(game.players);
    expect(game.winner[0]).toEqual({ name: 'Bob', score: 7 });
  });
});
