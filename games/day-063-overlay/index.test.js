import { describe, expect, test } from 'bun:test';
import {
  rotateStamp,
  placeStamp,
  scoreBoard,
  createRoundSet,
} from './logic.js';

describe('Overlay logic', () => {
  test('rotateStamp rotates cells clockwise inside a 3x3 box', () => {
    const stamp = {
      size: 3,
      cells: [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
    };

    expect(rotateStamp(stamp).cells).toEqual([
      [2, 0],
      [2, 1],
      [1, 1],
    ]);
  });

  test('placeStamp paints board cells with spill tracking', () => {
    const board = { size: 5, target: ['2,2', '3,2'] };
    const stamp = { size: 2, cells: [[0, 0], [1, 0], [0, 1]] };
    const placed = placeStamp(board, stamp, 2, 2);

    expect(placed.covered).toEqual(['2,2', '2,3', '3,2']);
    expect(placed.spill).toBe(1);
    expect(placed.hits).toBe(2);
  });

  test('scoreBoard rewards hits, penalizes spill, and grants perfect bonus', () => {
    const result = scoreBoard({
      target: ['1,1', '2,1', '1,2'],
      covered: ['1,1', '2,1', '1,2'],
    });

    expect(result).toEqual({
      hits: 3,
      spill: 0,
      missed: 0,
      perfect: true,
      score: 11,
    });
  });

  test('createRoundSet returns deterministic rounds', () => {
    const first = createRoundSet(1337).map((round) => round.id);
    const second = createRoundSet(1337).map((round) => round.id);
    expect(first).toEqual(second);
    expect(first.length).toBe(3);
  });
});
