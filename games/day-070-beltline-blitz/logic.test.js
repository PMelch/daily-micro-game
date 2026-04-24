import { describe, expect, test } from 'bun:test';
import {
  BOARD_SIZE,
  createGame,
  rotateDirection,
  applyTurn,
  computeWinners,
} from './logic.js';

describe('Beltline Blitz unit logic', () => {
  test('rotateDirection cycles clockwise through all arrows', () => {
    expect(rotateDirection('up')).toBe('right');
    expect(rotateDirection('right')).toBe('down');
    expect(rotateDirection('down')).toBe('left');
    expect(rotateDirection('left')).toBe('up');
  });

  test('createGame sets up players, board size, and starting lanes', () => {
    const game = createGame(['Ada', 'Bob', 'Carla', 'Dora'], 70);

    expect(game.board).toHaveLength(BOARD_SIZE);
    expect(game.players.map((player) => ({ name: player.name, pos: player.pos, goal: player.goal }))).toEqual([
      { name: 'Ada', pos: { x: 2, y: 4 }, goal: 'up' },
      { name: 'Bob', pos: { x: 2, y: 0 }, goal: 'down' },
      { name: 'Carla', pos: { x: 0, y: 2 }, goal: 'right' },
      { name: 'Dora', pos: { x: 4, y: 2 }, goal: 'left' },
    ]);
    expect(game.energy.length).toBe(3);
  });
});

describe('Beltline Blitz integrated turns', () => {
  test('applyTurn rotates a tile, moves every token, and awards energy', () => {
    const game = createGame(['Ada', 'Bob'], 70);
    game.board = [
      [{ dir: 'right' }, { dir: 'right' }, { dir: 'down' }, { dir: 'left' }, { dir: 'left' }],
      [{ dir: 'up' }, { dir: 'up' }, { dir: 'down' }, { dir: 'up' }, { dir: 'up' }],
      [{ dir: 'right' }, { dir: 'right' }, { dir: 'right' }, { dir: 'right' }, { dir: 'left' }],
      [{ dir: 'down' }, { dir: 'down' }, { dir: 'up' }, { dir: 'down' }, { dir: 'down' }],
      [{ dir: 'right' }, { dir: 'right' }, { dir: 'up' }, { dir: 'left' }, { dir: 'left' }],
    ];
    game.energy = [{ x: 2, y: 3 }];
    game.players[0].pos = { x: 2, y: 4 };
    game.players[1].pos = { x: 2, y: 0 };

    const result = applyTurn(game, 2, 4);

    expect(game.board[4][2].dir).toBe('right');
    expect(result.rotated).toEqual({ x: 2, y: 4, dir: 'right' });
    expect(game.players[0].pos).toEqual({ x: 3, y: 4 });
    expect(game.players[1].pos).toEqual({ x: 2, y: 1 });
    expect(game.players[0].score).toBe(0);
    expect(game.turn).toBe(2);
    expect(game.currentPlayerIndex).toBe(1);
  });

  test('tokens jam when they target the same destination cell', () => {
    const game = createGame(['Ada', 'Bob'], 70);
    game.board = [
      [{ dir: 'right' }, { dir: 'down' }, { dir: 'down' }, { dir: 'left' }, { dir: 'left' }],
      [{ dir: 'right' }, { dir: 'right' }, { dir: 'left' }, { dir: 'left' }, { dir: 'left' }],
      [{ dir: 'up' }, { dir: 'up' }, { dir: 'up' }, { dir: 'up' }, { dir: 'up' }],
      [{ dir: 'right' }, { dir: 'right' }, { dir: 'left' }, { dir: 'left' }, { dir: 'left' }],
      [{ dir: 'right' }, { dir: 'up' }, { dir: 'up' }, { dir: 'left' }, { dir: 'left' }],
    ];
    game.players[0].pos = { x: 1, y: 1 };
    game.players[1].pos = { x: 3, y: 1 };

    const result = applyTurn(game, 0, 0);

    expect(result.jams).toEqual([{ x: 2, y: 1, players: [0, 1] }]);
    expect(game.players[0].pos).toEqual({ x: 1, y: 1 });
    expect(game.players[1].pos).toEqual({ x: 3, y: 1 });
  });

  test('driving out through your own gate scores and respawns', () => {
    const game = createGame(['Ada', 'Bob'], 70);
    game.board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ({ dir: 'up' })));
    game.players[0].pos = { x: 2, y: 0 };
    game.players[1].pos = { x: 2, y: 2 };

    const result = applyTurn(game, 1, 1);

    expect(result.deliveries).toEqual([{ playerIndex: 0, score: 3 }]);
    expect(game.players[0].score).toBe(3);
    expect(game.players[0].pos).toEqual({ x: 2, y: 4 });
  });

  test('computeWinners sorts ties by shared top score and game finishes after max turns', () => {
    const game = createGame(['Ada', 'Bob', 'Carla'], 70);
    game.maxTurns = 1;
    game.players[0].score = 4;
    game.players[1].score = 7;
    game.players[2].score = 7;

    applyTurn(game, 0, 0);

    expect(game.status).toBe('finished');
    expect(computeWinners(game.players)).toEqual([
      { name: 'Bob', score: 7 },
      { name: 'Carla', score: 7 },
    ]);
  });
});
