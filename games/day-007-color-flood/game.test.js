import { describe, test, expect } from 'bun:test';
import { createBoard, flood, countFilled, COLORS } from './game-logic.js';

describe('Color Flood', () => {
  test('createBoard returns grid of correct size', () => {
    const board = createBoard(6, 5);
    expect(board.length).toBe(6);
    expect(board[0].length).toBe(6);
    board.flat().forEach(c => expect(COLORS).toContain(c));
  });

  test('createBoard with seed is deterministic', () => {
    const a = createBoard(6, 42);
    const b = createBoard(6, 42);
    expect(a).toEqual(b);
  });

  test('flood fills connected region from top-left', () => {
    const board = [
      [0, 0, 1],
      [0, 1, 1],
      [2, 2, 1],
    ];
    flood(board, 1); // change top-left region (color 0) to color 1
    expect(board[0][0]).toBe(1);
    expect(board[0][1]).toBe(1);
    expect(board[1][0]).toBe(1);
    // Should now connect to adjacent 1s
    expect(board[0][2]).toBe(1);
    expect(board[1][1]).toBe(1);
    expect(board[1][2]).toBe(1);
    expect(board[2][2]).toBe(1);
    // Bottom-left stays 2
    expect(board[2][0]).toBe(2);
    expect(board[2][1]).toBe(2);
  });

  test('flood does nothing if same color chosen', () => {
    const board = [[0, 1], [1, 1]];
    const before = JSON.parse(JSON.stringify(board));
    flood(board, 0);
    expect(board).toEqual(before);
  });

  test('countFilled counts connected region from top-left', () => {
    const board = [
      [1, 1, 2],
      [1, 2, 2],
      [0, 0, 2],
    ];
    expect(countFilled(board)).toBe(3);
  });

  test('full board means countFilled equals total cells', () => {
    const board = [[3, 3], [3, 3]];
    expect(countFilled(board)).toBe(4);
  });
});
