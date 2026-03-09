import { describe, it, expect, beforeEach } from 'bun:test';
import { HexBridgeGame, EMPTY, BLUE, RED } from './game-logic.js';

// ──────────────────────────────────────────────────────────────────────────────
// [TESTABILITY ANALYSIS]
//
// Pure game-logic module — no DOM, no randomness, no external deps.
// Tests:
//   - Unit: board initialisation, placement rules, turn switching, win checks
//   - Integration: full short winning sequences on a 5×5 board
//   - Edge cases: out-of-bounds, double-placement, post-game placement
//
// Tool: bun test (run from game directory)
// ──────────────────────────────────────────────────────────────────────────────

describe('HexBridgeGame — initialisation', () => {
  it('creates an empty board of the given size', () => {
    const g = new HexBridgeGame(5);
    expect(g.size).toBe(5);
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        expect(g.board[r][c]).toBe(EMPTY);
  });

  it('default size is 9', () => {
    const g = new HexBridgeGame();
    expect(g.size).toBe(9);
    expect(g.board.length).toBe(9);
    expect(g.board[0].length).toBe(9);
  });

  it('starts with BLUE to move, no winner, zero moves', () => {
    const g = new HexBridgeGame(5);
    expect(g.currentPlayer).toBe(BLUE);
    expect(g.winner).toBeNull();
    expect(g.winPath).toBeNull();
    expect(g.moveCount).toBe(0);
  });
});

describe('HexBridgeGame — placement', () => {
  let g;
  beforeEach(() => { g = new HexBridgeGame(5); });

  it('accepts a valid move and returns true', () => {
    expect(g.place(0, 0)).toBe(true);
    expect(g.board[0][0]).toBe(BLUE);
    expect(g.moveCount).toBe(1);
  });

  it('rejects placement on an occupied cell', () => {
    g.place(0, 0);
    expect(g.place(0, 0)).toBe(false);
    expect(g.board[0][0]).toBe(BLUE); // still blue
  });

  it('rejects out-of-bounds row (negative)', () => {
    expect(g.place(-1, 0)).toBe(false);
  });

  it('rejects out-of-bounds col (≥ size)', () => {
    expect(g.place(0, 5)).toBe(false);
  });

  it('switches player after each legal move', () => {
    expect(g.currentPlayer).toBe(BLUE);
    g.place(0, 0);
    expect(g.currentPlayer).toBe(RED);
    g.place(1, 1);
    expect(g.currentPlayer).toBe(BLUE);
  });

  it('increments moveCount for each legal move only', () => {
    g.place(0, 0); // valid
    g.place(0, 0); // invalid (occupied)
    expect(g.moveCount).toBe(1);
  });
});

describe('HexBridgeGame — getNeighbors', () => {
  let g;
  beforeEach(() => { g = new HexBridgeGame(5); });

  it('interior cell has exactly 6 neighbours', () => {
    expect(g.getNeighbors(2, 2)).toHaveLength(6);
  });

  it('corner (0,0) has 2 neighbours', () => {
    expect(g.getNeighbors(0, 0)).toHaveLength(2);
  });

  it('corner (4,4) has 2 neighbours', () => {
    expect(g.getNeighbors(4, 4)).toHaveLength(2);
  });

  it('edge (non-corner) cell has 4 neighbours on top row', () => {
    expect(g.getNeighbors(0, 2)).toHaveLength(4);
  });

  it('contains correct neighbours for (2,2)', () => {
    const nbrs = g.getNeighbors(2, 2);
    expect(nbrs).toContainEqual([1, 2]);
    expect(nbrs).toContainEqual([1, 3]);
    expect(nbrs).toContainEqual([2, 1]);
    expect(nbrs).toContainEqual([2, 3]);
    expect(nbrs).toContainEqual([3, 1]);
    expect(nbrs).toContainEqual([3, 2]);
  });

  it('never returns out-of-bounds coords', () => {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        g.getNeighbors(r, c).forEach(([nr, nc]) => {
          expect(nr).toBeGreaterThanOrEqual(0);
          expect(nr).toBeLessThan(5);
          expect(nc).toBeGreaterThanOrEqual(0);
          expect(nc).toBeLessThan(5);
        });
  });
});

describe('HexBridgeGame — win detection (checkWin)', () => {
  let g;
  beforeEach(() => { g = new HexBridgeGame(5); });

  it('BLUE wins with a straight left-column path (top→bottom)', () => {
    [0,1,2,3,4].forEach(r => { g.board[r][0] = BLUE; });
    expect(g.checkWin(BLUE)).toBe(true);
  });

  it('BLUE wins with a diagonal path', () => {
    // (0,2)→(1,2)→(2,1)→(3,1)→(4,1) — each pair is a valid hex neighbour
    // (0,2)↔(1,2): dir [+1,0] ✓  (1,2)↔(2,1): dir [+1,-1] ✓
    // (2,1)↔(3,1): dir [+1,0] ✓  (3,1)↔(4,1): dir [+1,0] ✓
    g.board[0][2] = BLUE;
    g.board[1][2] = BLUE;
    g.board[2][1] = BLUE;
    g.board[3][1] = BLUE;
    g.board[4][1] = BLUE;
    expect(g.checkWin(BLUE)).toBe(true);
  });

  it('BLUE does NOT win with a gap in the column', () => {
    [0,1,3,4].forEach(r => { g.board[r][0] = BLUE; });
    expect(g.checkWin(BLUE)).toBe(false);
  });

  it('RED wins with a straight top-row path (left→right)', () => {
    [0,1,2,3,4].forEach(c => { g.board[0][c] = RED; });
    expect(g.checkWin(RED)).toBe(true);
  });

  it('RED wins with a zig-zag row path', () => {
    g.board[0][0] = RED;
    g.board[0][1] = RED;
    g.board[1][1] = RED;
    g.board[1][2] = RED;
    g.board[0][3] = RED;
    g.board[0][4] = RED;
    expect(g.checkWin(RED)).toBe(true);
  });

  it('RED does NOT win with only isolated pieces', () => {
    g.board[0][0] = RED;
    g.board[0][2] = RED;
    g.board[0][4] = RED;
    expect(g.checkWin(RED)).toBe(false);
  });

  it('no false positive: BLUE pieces do not count for RED', () => {
    [0,1,2,3,4].forEach(c => { g.board[0][c] = BLUE; });
    expect(g.checkWin(RED)).toBe(false);
  });
});

describe('HexBridgeGame — winner via place()', () => {
  let g;
  beforeEach(() => { g = new HexBridgeGame(5); });

  it('sets winner when BLUE completes a path', () => {
    // Build 4 BLUE cells manually, then place the last via place()
    g.board[0][0] = BLUE;
    g.board[1][0] = BLUE;
    g.board[2][0] = BLUE;
    g.board[3][0] = BLUE;
    g.currentPlayer = BLUE;
    g.place(4, 0);
    expect(g.winner).toBe(BLUE);
    expect(g.winPath).not.toBeNull();
  });

  it('sets winner when RED completes a path', () => {
    g.board[0][0] = RED;
    g.board[0][1] = RED;
    g.board[0][2] = RED;
    g.board[0][3] = RED;
    g.currentPlayer = RED;
    g.place(0, 4);
    expect(g.winner).toBe(RED);
    expect(g.winPath).not.toBeNull();
  });

  it('rejects any move after the game is over', () => {
    g.winner = BLUE;
    expect(g.place(0, 0)).toBe(false);
  });

  it('does not switch player after winning move', () => {
    g.board[0][0] = BLUE;
    g.board[1][0] = BLUE;
    g.board[2][0] = BLUE;
    g.board[3][0] = BLUE;
    g.currentPlayer = BLUE;
    g.place(4, 0);
    // winner found → currentPlayer should still be BLUE (not switched)
    expect(g.currentPlayer).toBe(BLUE);
  });
});

describe('HexBridgeGame — getWinningPath', () => {
  let g;
  beforeEach(() => { g = new HexBridgeGame(5); });

  it('returns null when no winning path for BLUE', () => {
    g.board[0][0] = BLUE;
    expect(g.getWinningPath(BLUE)).toBeNull();
  });

  it('returns null when no winning path for RED', () => {
    g.board[0][0] = RED;
    expect(g.getWinningPath(RED)).toBeNull();
  });

  it('returns an array of cells forming BLUE path', () => {
    [0,1,2,3,4].forEach(r => { g.board[r][0] = BLUE; });
    const path = g.getWinningPath(BLUE);
    expect(Array.isArray(path)).toBe(true);
    expect(path.length).toBeGreaterThan(0);
    expect(path.some(([r]) => r === 0)).toBe(true);
    expect(path.some(([r]) => r === 4)).toBe(true);
  });

  it('returns an array of cells forming RED path', () => {
    [0,1,2,3,4].forEach(c => { g.board[0][c] = RED; });
    const path = g.getWinningPath(RED);
    expect(Array.isArray(path)).toBe(true);
    expect(path.some(([,c]) => c === 0)).toBe(true);
    expect(path.some(([,c]) => c === 4)).toBe(true);
  });

  it('all cells in winning path belong to the correct player', () => {
    [0,1,2,3,4].forEach(r => { g.board[r][0] = BLUE; });
    const path = g.getWinningPath(BLUE);
    path.forEach(([r, c]) => {
      expect(g.board[r][c]).toBe(BLUE);
    });
  });
});

describe('HexBridgeGame — reset & serialize', () => {
  it('reset restores initial state', () => {
    const g = new HexBridgeGame(5);
    g.place(0, 0); g.place(1, 1);
    g.reset();
    expect(g.currentPlayer).toBe(BLUE);
    expect(g.winner).toBeNull();
    expect(g.moveCount).toBe(0);
    expect(g.board[0][0]).toBe(EMPTY);
  });

  it('serialize returns a plain object snapshot', () => {
    const g = new HexBridgeGame(5);
    g.place(0, 0);
    const s = g.serialize();
    expect(s.size).toBe(5);
    expect(s.board[0][0]).toBe(BLUE);
    expect(s.currentPlayer).toBe(RED);
    expect(s.moveCount).toBe(1);
  });

  it('serialize snapshot does not mutate on further moves', () => {
    const g = new HexBridgeGame(5);
    const s = g.serialize();
    g.place(0, 0);
    expect(s.board[0][0]).toBe(EMPTY); // snapshot is a copy
  });
});

describe('HexBridgeGame — full 5×5 game (integration)', () => {
  it('plays a complete game: BLUE wins top-to-bottom via left column', () => {
    const g = new HexBridgeGame(5);
    // BLUE occupies col 0 fully, RED plays elsewhere
    g.place(0, 0); // BLUE
    g.place(0, 4); // RED
    g.place(1, 0); // BLUE
    g.place(1, 4); // RED
    g.place(2, 0); // BLUE
    g.place(2, 4); // RED
    g.place(3, 0); // BLUE
    g.place(3, 4); // RED
    g.place(4, 0); // BLUE — should win

    expect(g.winner).toBe(BLUE);
    expect(g.winPath).not.toBeNull();
  });

  it('plays a complete game: RED wins left-to-right via top row', () => {
    const g = new HexBridgeGame(5);
    // Interleaved moves, RED fills row 0
    g.place(4, 0); // BLUE
    g.place(0, 0); // RED
    g.place(4, 1); // BLUE
    g.place(0, 1); // RED
    g.place(4, 2); // BLUE
    g.place(0, 2); // RED
    g.place(4, 3); // BLUE
    g.place(0, 3); // RED
    g.place(4, 4); // BLUE
    g.place(0, 4); // RED — should win

    expect(g.winner).toBe(RED);
  });
});
