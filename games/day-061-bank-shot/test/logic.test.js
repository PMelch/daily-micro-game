const { describe, test, expect } = require('bun:test');
const {
  createBoard,
  simulateShot,
  createMatchState,
  applyTurnResult,
} = require('../logic.js');

describe('Bank Shot logic', () => {
  test('createBoard is deterministic for a seed', () => {
    const a = createBoard(61);
    const b = createBoard(61);
    expect(a).toEqual(b);
    expect(a.gems.length).toBe(6);
    expect(a.bumpers.length).toBe(4);
  });

  test('a banked shot can collect gems on the seeded board', () => {
    const board = createBoard(61);
    const result = simulateShot(board, { x: 200, y: 220 });
    expect(result.score).toBeGreaterThan(0);
    expect(result.bankShots).toBeGreaterThanOrEqual(0);
    expect(result.collected.length).toBeGreaterThan(0);
  });

  test('applyTurnResult advances players and rounds, then ends match', () => {
    let state = createMatchState(['Ada', 'Bob'], 2);
    state = applyTurnResult(state, 12);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.round).toBe(1);
    expect(state.players[0].score).toBe(12);

    state = applyTurnResult(state, 7);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.round).toBe(2);
    expect(state.players[1].score).toBe(7);

    state = applyTurnResult(state, 5);
    state = applyTurnResult(state, 9);
    expect(state.gameOver).toBe(true);
  });
});
