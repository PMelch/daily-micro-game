/**
 * 5 Stroke – game logic unit tests
 * Run: bun test games/day-021-5stroke/game.test.js
 */
import { describe, test, expect } from 'bun:test';
import { FiveStrokesGame, checkGuess, calculatePoints, selectWords, normalizeWord, WORD_PAIRS } from './game.js';

// ─── normalizeWord ──────────────────────────────────────────────────────────
describe('normalizeWord', () => {
  test('lowercases', () => {
    expect(normalizeWord('HUND')).toBe('hund');
  });
  test('trims whitespace', () => {
    expect(normalizeWord('  dog  ')).toBe('dog');
  });
  test('removes accents', () => {
    expect(normalizeWord('Étoile')).toBe('etoile');
    expect(normalizeWord('Cœur')).toBe('coeur'); // œ ligature → oe
  });
  test('empty string stays empty', () => {
    expect(normalizeWord('')).toBe('');
  });
});

// ─── checkGuess ─────────────────────────────────────────────────────────────
describe('checkGuess', () => {
  test('exact match succeeds', () => {
    expect(checkGuess('Hund', 'Hund')).toBe(true);
  });
  test('case-insensitive', () => {
    expect(checkGuess('hund', 'Hund')).toBe(true);
    expect(checkGuess('HUND', 'hund')).toBe(true);
  });
  test('accent-insensitive', () => {
    expect(checkGuess('etoile', 'Étoile')).toBe(true);
    // Cœur: œ is a ligature → normalizes to "oe" so "Coeur" == "Cœur"
    expect(checkGuess('Coeur', 'Cœur')).toBe(true);
    expect(checkGuess('Coeur', 'Coeur')).toBe(true);
  });
  test('partial match: guess subset of answer', () => {
    expect(checkGuess('ice', 'Ice cream')).toBe(true);
  });
  test('partial match: answer subset of guess', () => {
    expect(checkGuess('Ice cream cone', 'Ice cream')).toBe(true);
  });
  test('wrong guess returns false', () => {
    expect(checkGuess('Katze', 'Hund')).toBe(false);
  });
  test('empty guess returns false', () => {
    expect(checkGuess('', 'Hund')).toBe(false);
  });
  test('whitespace-only guess returns false', () => {
    expect(checkGuess('   ', 'Hund')).toBe(false);
  });
});

// ─── calculatePoints ────────────────────────────────────────────────────────
describe('calculatePoints', () => {
  test('attempt 1 → guesser:3, drawer:2', () => {
    expect(calculatePoints(1)).toEqual({ guesser: 3, drawer: 2 });
  });
  test('attempt 2 → guesser:2, drawer:2', () => {
    expect(calculatePoints(2)).toEqual({ guesser: 2, drawer: 2 });
  });
  test('attempt 3 → guesser:1, drawer:2', () => {
    expect(calculatePoints(3)).toEqual({ guesser: 1, drawer: 2 });
  });
  test('attempt 0 (failed) → guesser:0, drawer:0', () => {
    expect(calculatePoints(0)).toEqual({ guesser: 0, drawer: 0 });
  });
  test('invalid attempt → 0 points', () => {
    expect(calculatePoints(99)).toEqual({ guesser: 0, drawer: 0 });
  });
});

// ─── selectWords ────────────────────────────────────────────────────────────
describe('selectWords', () => {
  test('returns requested count', () => {
    const result = selectWords(WORD_PAIRS, 5);
    expect(result).toHaveLength(5);
  });
  test('no duplicates', () => {
    const result = selectWords(WORD_PAIRS, 10);
    const ids = result.map(w => w.de);
    expect(new Set(ids).size).toBe(ids.length);
  });
  test('returns all if count >= list length', () => {
    const small = [{ de: 'a' }, { de: 'b' }];
    expect(selectWords(small, 100)).toHaveLength(2);
  });
  test('count 0 returns empty array', () => {
    expect(selectWords(WORD_PAIRS, 0)).toHaveLength(0);
  });
});

// ─── FiveStrokesGame constructor ─────────────────────────────────────────────
describe('FiveStrokesGame – constructor', () => {
  test('2 players: 8 total rounds', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    expect(game.totalRounds).toBe(8);
    expect(game.scores).toEqual([0, 0]);
    expect(game.isOver).toBe(false);
  });
  test('3 players: 9 total rounds', () => {
    const game = new FiveStrokesGame(['A', 'B', 'C']);
    expect(game.totalRounds).toBe(9);
  });
  test('4 players: 8 total rounds', () => {
    const game = new FiveStrokesGame(['A', 'B', 'C', 'D']);
    expect(game.totalRounds).toBe(8);
  });
  test('throws on 1 player', () => {
    expect(() => new FiveStrokesGame(['Solo'])).toThrow();
  });
  test('throws on 5 players', () => {
    expect(() => new FiveStrokesGame(['A','B','C','D','E'])).toThrow();
  });
});

// ─── FiveStrokesGame – turn rotation ────────────────────────────────────────
describe('FiveStrokesGame – turn rotation', () => {
  test('2 players: drawer alternates 0→1→0…', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    expect(game.drawerIndex).toBe(0);
    expect(game.guesserIndex).toBe(1);
    game.nextRound();
    expect(game.drawerIndex).toBe(1);
    expect(game.guesserIndex).toBe(0);
    game.nextRound();
    expect(game.drawerIndex).toBe(0);
  });
  test('3 players: drawer cycles 0→1→2→0…', () => {
    const game = new FiveStrokesGame(['A', 'B', 'C']);
    expect(game.drawerIndex).toBe(0);
    game.nextRound();
    expect(game.drawerIndex).toBe(1);
    game.nextRound();
    expect(game.drawerIndex).toBe(2);
    game.nextRound();
    expect(game.drawerIndex).toBe(0);
  });
  test('guesser is always drawerIndex + 1 mod n', () => {
    const game = new FiveStrokesGame(['A', 'B', 'C']);
    for (let i = 0; i < 9; i++) {
      expect(game.guesserIndex).toBe((game.drawerIndex + 1) % 3);
      game.nextRound();
    }
  });
});

// ─── FiveStrokesGame – scoring ───────────────────────────────────────────────
describe('FiveStrokesGame – scoring', () => {
  test('awardPoints adds to correct player scores', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    // Round 0: drawer=Alice(0), guesser=Bob(1)
    game.awardPoints(3, 2);
    expect(game.scores[0]).toBe(2); // Alice (drawer)
    expect(game.scores[1]).toBe(3); // Bob   (guesser)
  });
  test('multiple rounds accumulate correctly', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    game.awardPoints(3, 2); // R0: Alice+2, Bob+3
    game.nextRound();
    game.awardPoints(2, 2); // R1: Bob+2, Alice+2  (roles swapped)
    expect(game.scores[0]).toBe(4); // Alice: 2+2
    expect(game.scores[1]).toBe(5); // Bob:   3+2
  });
  test('failed round awards 0 to both', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    game.awardPoints(0, 0);
    expect(game.scores[0]).toBe(0);
    expect(game.scores[1]).toBe(0);
  });
});

// ─── FiveStrokesGame – game over ─────────────────────────────────────────────
describe('FiveStrokesGame – game over', () => {
  test('not over at start', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    expect(game.isOver).toBe(false);
  });
  test('over after totalRounds nextRound calls', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    for (let i = 0; i < 8; i++) game.nextRound();
    expect(game.isOver).toBe(true);
  });
});

// ─── FiveStrokesGame – ranking & winner ──────────────────────────────────────
describe('FiveStrokesGame – ranking', () => {
  test('getRanking sorts descending', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    game.scores = [5, 10];
    const ranking = game.getRanking();
    expect(ranking[0]).toEqual({ name: 'Bob', score: 10 });
    expect(ranking[1]).toEqual({ name: 'Alice', score: 5 });
  });
  test('getWinner returns correct winner', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    game.scores = [5, 10];
    const { winners, maxScore } = game.getWinner();
    expect(winners).toEqual(['Bob']);
    expect(maxScore).toBe(10);
  });
  test('getWinner handles tie', () => {
    const game = new FiveStrokesGame(['Alice', 'Bob']);
    game.scores = [7, 7];
    const { winners } = game.getWinner();
    expect(winners).toHaveLength(2);
  });
});

// ─── Word pair integrity ─────────────────────────────────────────────────────
describe('WORD_PAIRS data integrity', () => {
  const LANGS = ['de', 'en', 'fr', 'it', 'es'];
  test('all pairs have all 5 languages', () => {
    for (const pair of WORD_PAIRS) {
      for (const lang of LANGS) {
        expect(pair[lang]).toBeTruthy();
      }
    }
  });
  test('at least 30 word pairs available', () => {
    expect(WORD_PAIRS.length).toBeGreaterThanOrEqual(30);
  });
});
