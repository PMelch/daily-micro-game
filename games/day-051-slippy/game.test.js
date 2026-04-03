/**
 * TDD tests for Slippy! game logic
 */
import { describe, test, expect } from 'bun:test';
import {
  CELL_ICE, CELL_ROCK, CELL_FISH,
  createGrid, initGame, slidePlayer, getPlayerAt, getValidMoves,
} from './game.js';

describe('createGrid', () => {
  test('creates a grid of correct dimensions', () => {
    const g = createGrid(4, 5);
    expect(g.length).toBe(4);
    expect(g[0].length).toBe(5);
  });

  test('all cells start as ICE', () => {
    const g = createGrid(3, 3);
    for (const row of g) for (const cell of row) {
      expect(cell).toBe(CELL_ICE);
    }
  });
});

describe('initGame', () => {
  test('creates correct number of players', () => {
    const s = initGame(['Alice', 'Bob']);
    expect(s.players.length).toBe(2);
  });

  test('players start at correct corners', () => {
    const s = initGame(['A', 'B', 'C', 'D']);
    expect(s.players[0]).toMatchObject({ r: 0, c: 0 });
    expect(s.players[1]).toMatchObject({ r: 7, c: 7 });
    expect(s.players[2]).toMatchObject({ r: 7, c: 0 });
    expect(s.players[3]).toMatchObject({ r: 0, c: 7 });
  });

  test('players start with 0 fish', () => {
    const s = initGame(['A', 'B']);
    expect(s.players[0].fish).toBe(0);
    expect(s.players[1].fish).toBe(0);
  });

  test('grid has rocks placed', () => {
    const s = initGame(['A', 'B']);
    expect(s.grid[2][2]).toBe(CELL_ROCK);
    expect(s.grid[5][5]).toBe(CELL_ROCK);
  });

  test('grid has fish placed', () => {
    const s = initGame(['A', 'B']);
    // Fish at [0][1]
    expect(s.grid[0][1]).toBe(CELL_FISH);
  });

  test('8x8 grid', () => {
    const s = initGame(['A', 'B']);
    expect(s.rows).toBe(8);
    expect(s.cols).toBe(8);
  });

  test('gameOver starts false', () => {
    const s = initGame(['A', 'B']);
    expect(s.gameOver).toBe(false);
  });
});

describe('slidePlayer - basic movement', () => {
  test('player slides right until hitting wall', () => {
    const s = initGame(['A', 'B']);
    // Player 0 starts at (0,0), slides right
    // Grid[0]: ICE@1(fish), ICE@2, ICE@3(rock?-no), check path...
    // rocks at [0][3] per game.js
    const s2 = slidePlayer(s, 0, 'right');
    // Should slide right until rock at [0][3], stopping at [0][2]
    expect(s2.players[0].r).toBe(0);
    expect(s2.players[0].c).toBe(2); // stops before rock at [0][3]
  });

  test('player slides down until hitting wall', () => {
    const s = initGame(['A', 'B']);
    // Player 0 at (0,0), slides down
    // Check column 0: fish at [2][0], [5][0]; rocks... check
    const s2 = slidePlayer(s, 0, 'down');
    // should move at least 1 step
    expect(s2.players[0].r).toBeGreaterThan(0);
  });

  test('player does not move if blocked immediately by wall', () => {
    const s = initGame(['A', 'B']);
    // Player 0 at (0,0) - up and left are walls
    const s2 = slidePlayer(s, 0, 'up');
    expect(s2.players[0]).toMatchObject({ r: 0, c: 0 });

    const s3 = slidePlayer(s, 0, 'left');
    expect(s3.players[0]).toMatchObject({ r: 0, c: 0 });
  });

  test('player stops before rock', () => {
    const s = initGame(['A', 'B']);
    // Player 0 at (0,0), rock at [2][2], [1][4], [0][3]
    // Slide right: should stop at [0][2] (rock at [0][3])
    const s2 = slidePlayer(s, 0, 'right');
    expect(s2.grid[s2.players[0].r][s2.players[0].c]).not.toBe(CELL_ROCK);
  });
});

describe('slidePlayer - fish collection', () => {
  test('player collects fish when sliding through them', () => {
    const s = initGame(['A', 'B']);
    // Player 0 at (0,0), fish at (0,1)
    const s2 = slidePlayer(s, 0, 'right');
    expect(s2.players[0].fish).toBeGreaterThan(0);
  });

  test('fish disappears from grid after collection', () => {
    const s = initGame(['A', 'B']);
    const fishR = 0, fishC = 1;
    expect(s.grid[fishR][fishC]).toBe(CELL_FISH);
    const s2 = slidePlayer(s, 0, 'right'); // passes through (0,1)
    expect(s2.grid[fishR][fishC]).toBe(CELL_ICE);
  });

  test('fishCollected counter increments', () => {
    const s = initGame(['A', 'B']);
    const s2 = slidePlayer(s, 0, 'right');
    expect(s2.fishCollected).toBeGreaterThan(s.fishCollected);
  });
});

describe('slidePlayer - turn advancement', () => {
  test('currentPlayer advances after move', () => {
    const s = initGame(['A', 'B']);
    expect(s.currentPlayer).toBe(0);
    const s2 = slidePlayer(s, 0, 'right');
    expect(s2.currentPlayer).toBe(1);
  });

  test('currentPlayer wraps around', () => {
    const s = initGame(['A', 'B']);
    const s2 = slidePlayer(s, 0, 'right');
    const s3 = slidePlayer(s2, 1, 'left');
    expect(s3.currentPlayer).toBe(0);
  });
});

describe('slidePlayer - lastMove', () => {
  test('records lastMove info', () => {
    const s = initGame(['A', 'B']);
    const s2 = slidePlayer(s, 0, 'right');
    expect(s2.lastMove).toBeTruthy();
    expect(s2.lastMove.playerIndex).toBe(0);
    expect(s2.lastMove.dir).toBe('right');
    expect(s2.lastMove.from).toMatchObject({ r: 0, c: 0 });
  });
});

describe('slidePlayer - game over', () => {
  test('game is not over with fish remaining', () => {
    const s = initGame(['A', 'B']);
    const s2 = slidePlayer(s, 0, 'right');
    expect(s2.gameOver).toBe(false);
  });
});

describe('getPlayerAt', () => {
  test('returns -1 when no player at cell', () => {
    const s = initGame(['A', 'B']);
    expect(getPlayerAt(s, 3, 3)).toBe(-1);
  });

  test('returns player index when player at cell', () => {
    const s = initGame(['A', 'B']);
    // Player 0 at (0,0)
    expect(getPlayerAt(s, 0, 0)).toBe(0);
    // Player 1 at (7,7)
    expect(getPlayerAt(s, 7, 7)).toBe(1);
  });
});

describe('getValidMoves', () => {
  test('player at corner has 2 valid move directions', () => {
    const s = initGame(['A', 'B']);
    // Player 0 at (0,0) - up and left go off grid, down and right stay on grid
    const moves = getValidMoves(s, 0);
    expect(moves).toContain('right');
    expect(moves).toContain('down');
    expect(moves).not.toContain('up');
    expect(moves).not.toContain('left');
  });

  test('player in middle has 4 valid moves', () => {
    const s = initGame(['A', 'B']);
    // Move player to middle
    const s2 = JSON.parse(JSON.stringify(s));
    s2.players[0].r = 4;
    s2.players[0].c = 4;
    const moves = getValidMoves(s2, 0);
    expect(moves.length).toBe(4);
  });
});

describe('state immutability', () => {
  test('slidePlayer does not mutate original state', () => {
    const s = initGame(['A', 'B']);
    const origPos = { r: s.players[0].r, c: s.players[0].c };
    slidePlayer(s, 0, 'right');
    expect(s.players[0].r).toBe(origPos.r);
    expect(s.players[0].c).toBe(origPos.c);
  });
});
