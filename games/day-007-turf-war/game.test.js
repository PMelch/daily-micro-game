import { describe, test, expect } from 'bun:test';
import { TurfWarGame } from './game.js';

describe('TurfWarGame', () => {
  test('initializes with player names and defaults', () => {
    const g = new TurfWarGame(['Alice', 'Bob']);
    expect(g.players).toHaveLength(2);
    expect(g.players[0].name).toBe('Alice');
    expect(g.players[1].name).toBe('Bob');
    expect(g.players[0].score).toBe(0);
    expect(g.currentPlayerIndex).toBe(0);
    expect(g.gameOver).toBe(false);
  });

  test('default names are Spieler 1, Spieler 2', () => {
    const g = new TurfWarGame();
    expect(g.players[0].name).toBe('Spieler 1');
    expect(g.players[1].name).toBe('Spieler 2');
  });

  test('grid is 7x7', () => {
    const g = new TurfWarGame();
    expect(g.grid).toHaveLength(7);
    expect(g.grid[0]).toHaveLength(7);
  });

  test('claiming a cell gives points and switches turn', () => {
    const g = new TurfWarGame(['A', 'B']);
    expect(g.currentPlayerIndex).toBe(0);
    const result = g.claimCell(0, 0);
    expect(result.success).toBe(true);
    expect(result.points).toBeGreaterThanOrEqual(1);
    expect(g.currentPlayerIndex).toBe(1);
  });

  test('cannot claim already claimed cell', () => {
    const g = new TurfWarGame(['A', 'B']);
    g.claimCell(0, 0);
    const result = g.claimCell(0, 0);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('Cell already claimed');
  });

  test('out of bounds returns failure', () => {
    const g = new TurfWarGame();
    expect(g.claimCell(-1, 0).success).toBe(false);
    expect(g.claimCell(0, 99).success).toBe(false);
  });

  test('adjacency bonus works', () => {
    const g = new TurfWarGame(['A', 'B']);
    // Player A claims (3,3)
    g.claimCell(3, 3);
    // Player B claims somewhere else
    g.claimCell(0, 0);
    // Player A claims (3,4) - adjacent to (3,3)
    const result = g.claimCell(3, 4);
    expect(result.adjacencyBonus).toBe(1);
  });

  test('getNeighbors returns valid neighbors', () => {
    const g = new TurfWarGame();
    const n = g.getNeighbors(0, 0);
    // corner: should have 3 neighbors (right, down, diagonal)
    expect(n).toHaveLength(3);
    const center = g.getNeighbors(3, 3);
    expect(center).toHaveLength(8);
  });

  test('game ends when all cells claimed', () => {
    const g = new TurfWarGame(['A', 'B']);
    let lastResult;
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        lastResult = g.claimCell(r, c);
    expect(g.gameOver).toBe(true);
    expect(lastResult.gameOver).toBe(true);
  });

  test('cannot claim after game over', () => {
    const g = new TurfWarGame(['A', 'B']);
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        g.claimCell(r, c);
    expect(g.claimCell(0, 0).success).toBe(false);
  });

  test('supports 3-4 players', () => {
    const g = new TurfWarGame(['A', 'B', 'C', 'D']);
    expect(g.players).toHaveLength(4);
    g.claimCell(0, 0); // A
    g.claimCell(0, 1); // B
    g.claimCell(0, 2); // C
    expect(g.currentPlayerIndex).toBe(3); // D's turn
    g.claimCell(0, 3); // D
    expect(g.currentPlayerIndex).toBe(0); // back to A
  });

  test('getScores returns all players', () => {
    const g = new TurfWarGame(['A', 'B']);
    g.claimCell(0, 0);
    const scores = g.getScores();
    expect(scores).toHaveLength(2);
    expect(scores[0].name).toBe('A');
    expect(scores[0].score).toBeGreaterThanOrEqual(1);
  });

  test('getWinner returns player with highest score', () => {
    const g = new TurfWarGame(['A', 'B']);
    // Fill entire board
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        g.claimCell(r, c);
    const winner = g.getWinner();
    // Winner should be a player object or null (tie)
    if (winner) {
      expect(winner.name).toBeDefined();
      expect(winner.score).toBeGreaterThan(0);
    }
  });
});
