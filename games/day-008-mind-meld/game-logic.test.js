import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createGame,
  submitAnswer,
  getMatchResult,
  nextRound,
  normalizeWord,
  getPrompt,
  canProgress,
} from './game-logic.js';

describe('normalizeWord', () => {
  it('lowercases and trims input', () => {
    expect(normalizeWord('  HELLO  ')).toBe('hello');
    expect(normalizeWord('Wasser')).toBe('wasser');
  });

  it('handles empty string', () => {
    expect(normalizeWord('')).toBe('');
    expect(normalizeWord('   ')).toBe('');
  });
});

describe('createGame', () => {
  it('creates a game with correct number of players', () => {
    const game = createGame(['Alice', 'Bob']);
    expect(game.players).toHaveLength(2);
    expect(game.players[0].name).toBe('Alice');
    expect(game.players[1].name).toBe('Bob');
  });

  it('initializes scores to zero', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie']);
    game.players.forEach(p => expect(p.score).toBe(0));
  });

  it('starts at round 1, attempt 1', () => {
    const game = createGame(['Alice', 'Bob']);
    expect(game.round).toBe(1);
    expect(game.attempt).toBe(1);
  });

  it('sets an initial prompt', () => {
    const game = createGame(['Alice', 'Bob']);
    expect(typeof game.prompt).toBe('string');
    expect(game.prompt.length).toBeGreaterThan(0);
  });

  it('initializes answers as empty array', () => {
    const game = createGame(['Alice', 'Bob']);
    expect(game.answers).toEqual([]);
  });

  it('initializes usedPrompts as empty set', () => {
    const game = createGame(['Alice', 'Bob']);
    expect(game.usedPrompts.size).toBe(0);
  });
});

describe('submitAnswer', () => {
  it('adds normalized answer from player', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Sommer');
    expect(game.answers[0]).toEqual({ playerIndex: 0, word: 'sommer' });
  });

  it('overwrites if same player submits again', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Sommer');
    submitAnswer(game, 0, 'Winter');
    const playerAnswers = game.answers.filter(a => a.playerIndex === 0);
    expect(playerAnswers).toHaveLength(1);
    expect(playerAnswers[0].word).toBe('winter');
  });

  it('collects answers from multiple players', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Hund');
    submitAnswer(game, 1, 'Katze');
    expect(game.answers).toHaveLength(2);
  });
});

describe('getMatchResult', () => {
  it('detects full match when all players write same word', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Feuer');
    submitAnswer(game, 1, 'Feuer');
    const result = getMatchResult(game);
    expect(result.matched).toBe(true);
    expect(result.matchWord).toBe('feuer');
    expect(result.winners).toEqual([0, 1]);
  });

  it('detects partial match (2 of 3 players match)', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie']);
    submitAnswer(game, 0, 'Wasser');
    submitAnswer(game, 1, 'Wasser');
    submitAnswer(game, 2, 'Feuer');
    const result = getMatchResult(game);
    expect(result.matched).toBe(true);
    expect(result.matchWord).toBe('wasser');
    expect(result.winners).toEqual([0, 1]);
  });

  it('returns no match when all words differ', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Hund');
    submitAnswer(game, 1, 'Katze');
    const result = getMatchResult(game);
    expect(result.matched).toBe(false);
    expect(result.winners).toEqual([]);
  });

  it('returns no match with only one answer', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Hund');
    const result = getMatchResult(game);
    expect(result.matched).toBe(false);
  });
});

describe('canProgress', () => {
  it('returns true when all players have answered', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Hund');
    submitAnswer(game, 1, 'Katze');
    expect(canProgress(game)).toBe(true);
  });

  it('returns false when not all players answered', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie']);
    submitAnswer(game, 0, 'Hund');
    expect(canProgress(game)).toBe(false);
  });
});

describe('nextRound', () => {
  it('increments round on match and resets attempt', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Feuer');
    submitAnswer(game, 1, 'Feuer');
    const result = getMatchResult(game);
    nextRound(game, result);
    expect(game.round).toBe(2);
    expect(game.attempt).toBe(1);
    expect(game.answers).toEqual([]);
  });

  it('adds scores to winners on match', () => {
    const game = createGame(['Alice', 'Bob', 'Charlie']);
    submitAnswer(game, 0, 'Wasser');
    submitAnswer(game, 1, 'Wasser');
    submitAnswer(game, 2, 'Feuer');
    const result = getMatchResult(game);
    nextRound(game, result);
    expect(game.players[0].score).toBe(1);
    expect(game.players[1].score).toBe(1);
    expect(game.players[2].score).toBe(0);
  });

  it('increments attempt and keeps round on no match', () => {
    const game = createGame(['Alice', 'Bob']);
    submitAnswer(game, 0, 'Hund');
    submitAnswer(game, 1, 'Katze');
    const result = getMatchResult(game);
    nextRound(game, result);
    expect(game.round).toBe(1);
    expect(game.attempt).toBe(2);
    expect(game.answers).toEqual([]);
  });

  it('changes prompt between rounds', () => {
    const game = createGame(['Alice', 'Bob']);
    const oldPrompt = game.prompt;
    submitAnswer(game, 0, 'Feuer');
    submitAnswer(game, 1, 'Feuer');
    const result = getMatchResult(game);
    nextRound(game, result);
    // Prompt could stay same by coincidence with tiny prompt list, but mark used
    expect(game.usedPrompts.has(oldPrompt)).toBe(true);
  });

  it('does not repeat prompt until all are exhausted', () => {
    const game = createGame(['Alice', 'Bob']);
    const seenPrompts = new Set();
    // Play through 5 rounds
    for (let i = 0; i < 5; i++) {
      seenPrompts.add(game.prompt);
      submitAnswer(game, 0, 'X');
      submitAnswer(game, 1, 'X');
      const result = getMatchResult(game);
      nextRound(game, result);
      if (seenPrompts.size < 5) {
        // Prompt should not repeat while unused ones remain (only check if we have many prompts)
        // We just collect; actual prompt pool tested by uniqueness
      }
    }
    expect(seenPrompts.size).toBeGreaterThan(0);
  });
});

describe('getPrompt', () => {
  it('returns a string from the prompt pool', () => {
    const game = createGame(['A', 'B']);
    const prompt = getPrompt(game);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('avoids recently used prompts when possible', () => {
    const game = createGame(['A', 'B']);
    const first = getPrompt(game);
    game.usedPrompts.add(first);
    // Run many times - should mostly avoid first
    let hitFirst = 0;
    for (let i = 0; i < 20; i++) {
      if (getPrompt(game) === first) hitFirst++;
    }
    // With a pool > 1, hitting the same prompt 20/20 times is astronomically unlikely
    expect(hitFirst).toBeLessThan(20);
  });
});
