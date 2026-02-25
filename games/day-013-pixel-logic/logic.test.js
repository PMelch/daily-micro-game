// TDD: logic.test.js for Pixel Logic (Nonogram)
import { describe, it, expect } from 'bun:test';
import { computeClues, isSolved, countMistakes, validatePuzzle } from './logic.js';

describe('computeClues', () => {
  it('returns [0] for empty row', () => {
    expect(computeClues([false, false, false, false, false])).toEqual([0]);
  });

  it('returns [1] for single filled cell', () => {
    expect(computeClues([false, true, false, false, false])).toEqual([1]);
  });

  it('returns [3] for three consecutive cells', () => {
    expect(computeClues([true, true, true, false, false])).toEqual([3]);
  });

  it('returns [2, 2] for two groups of two', () => {
    expect(computeClues([true, true, false, true, true])).toEqual([2, 2]);
  });

  it('returns [1, 1, 1] for alternating cells', () => {
    expect(computeClues([true, false, true, false, true])).toEqual([1, 1, 1]);
  });

  it('returns [5] for fully filled row', () => {
    expect(computeClues([true, true, true, true, true])).toEqual([5]);
  });

  it('handles groups at start and end', () => {
    expect(computeClues([true, false, false, false, true])).toEqual([1, 1]);
  });

  it('handles single group in middle', () => {
    expect(computeClues([false, true, true, true, false])).toEqual([3]);
  });
});

describe('isSolved', () => {
  it('returns true when userGrid matches solution exactly', () => {
    const solution = [
      [true,  false, true],
      [false, true,  false],
      [true,  true,  true],
    ];
    const userGrid = [
      [true,  false, true],
      [false, true,  false],
      [true,  true,  true],
    ];
    expect(isSolved(userGrid, solution)).toBe(true);
  });

  it('returns false when one cell differs', () => {
    const solution = [
      [true,  false, true],
      [false, true,  false],
    ];
    const userGrid = [
      [true,  true, true], // wrong!
      [false, true,  false],
    ];
    expect(isSolved(userGrid, solution)).toBe(false);
  });

  it('returns false for empty grid', () => {
    const solution = [[true, true], [false, true]];
    const userGrid = [[false, false], [false, false]];
    expect(isSolved(userGrid, solution)).toBe(false);
  });
});

describe('countMistakes', () => {
  it('returns 0 for perfect match', () => {
    const solution = [[true, false], [false, true]];
    const userGrid = [[true, false], [false, true]];
    expect(countMistakes(userGrid, solution)).toBe(0);
  });

  it('counts cells filled that should be empty', () => {
    const solution = [[false, false], [false, false]];
    const userGrid = [[true, false], [false, true]];
    expect(countMistakes(userGrid, solution)).toBe(2);
  });

  it('does NOT count unfilled cells (solution has true, user has false)', () => {
    // User hasn't filled required cells yet — not a "mistake", just incomplete
    const solution = [[true, true], [true, true]];
    const userGrid = [[false, false], [false, false]];
    expect(countMistakes(userGrid, solution)).toBe(0);
  });

  it('counts only wrongly filled cells', () => {
    const solution = [[true, false, true], [false, true, false]];
    const userGrid  = [[true, true,  true], [true,  true, false]];
    // Wrong fills: [0][1]=true(wrong), [1][0]=true(wrong)
    expect(countMistakes(userGrid, solution)).toBe(2);
  });
});

describe('validatePuzzle', () => {
  it('validates a correct puzzle definition', () => {
    const puzzle = {
      id: 'test-1',
      name: 'Test',
      size: 5,
      solution: [
        [true, false, true, false, true],
        [false, true, false, true, false],
        [true, true, true, true, true],
        [false, false, true, false, false],
        [false, true, true, true, false],
      ]
    };
    expect(validatePuzzle(puzzle)).toBe(true);
  });

  it('rejects puzzle with wrong grid size', () => {
    const puzzle = {
      id: 'bad-1',
      size: 5,
      solution: [
        [true, false], // only 2 columns, not 5
        [false, true],
      ]
    };
    expect(validatePuzzle(puzzle)).toBe(false);
  });

  it('rejects puzzle with missing solution', () => {
    expect(validatePuzzle({ id: 'bad-2', size: 5 })).toBe(false);
  });
});
