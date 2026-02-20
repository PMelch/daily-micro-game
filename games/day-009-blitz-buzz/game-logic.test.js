import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createRoom,
  joinRoom,
  canStartGame,
  startGame,
  buzz,
  submitAnswer,
  nextQuestion,
  getRoomState,
  isGameOver,
  getFinalScores,
  QUESTIONS,
} from './game-logic.js';

// ─── Room creation ─────────────────────────────────────────────────────────

describe('createRoom', () => {
  it('returns a room with a 4-char uppercase code', () => {
    const room = createRoom('Alice');
    expect(room.code).toMatch(/^[A-Z0-9]{4}$/);
  });

  it('has the host as first player', () => {
    const room = createRoom('Alice');
    expect(room.players).toHaveLength(1);
    expect(room.players[0].name).toBe('Alice');
    expect(room.players[0].isHost).toBe(true);
  });

  it('starts in lobby phase', () => {
    const room = createRoom('Alice');
    expect(room.phase).toBe('lobby');
  });

  it('initializes scores to 0', () => {
    const room = createRoom('Alice');
    expect(room.players[0].score).toBe(0);
  });
});

// ─── joinRoom ──────────────────────────────────────────────────────────────

describe('joinRoom', () => {
  it('adds a player to an existing room', () => {
    const room = createRoom('Alice');
    const result = joinRoom(room, 'Bob');
    expect(result.ok).toBe(true);
    expect(room.players).toHaveLength(2);
    expect(room.players[1].name).toBe('Bob');
  });

  it('rejects if room is full (6 players max)', () => {
    const room = createRoom('P1');
    ['P2','P3','P4','P5','P6'].forEach(n => joinRoom(room, n));
    const result = joinRoom(room, 'P7');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/full/i);
  });

  it('rejects if game already started', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    const result = joinRoom(room, 'Charlie');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/started/i);
  });

  it('new player starts with score 0', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    expect(room.players[1].score).toBe(0);
  });
});

// ─── canStartGame ──────────────────────────────────────────────────────────

describe('canStartGame', () => {
  it('returns false with only 1 player', () => {
    const room = createRoom('Alice');
    expect(canStartGame(room)).toBe(false);
  });

  it('returns true with 2+ players', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    expect(canStartGame(room)).toBe(true);
  });
});

// ─── startGame ─────────────────────────────────────────────────────────────

describe('startGame', () => {
  it('transitions to question phase', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    expect(room.phase).toBe('question');
  });

  it('sets questionIndex to 0', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    expect(room.questionIndex).toBe(0);
  });

  it('picks a shuffled subset of questions', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    expect(room.questionSet).toBeDefined();
    expect(room.questionSet.length).toBe(10);
  });

  it('sets buzzedBy to null', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    expect(room.buzzedBy).toBeNull();
  });
});

// ─── buzz ──────────────────────────────────────────────────────────────────

describe('buzz', () => {
  let room;
  beforeEach(() => {
    room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
  });

  it('records the first buzzer', () => {
    const result = buzz(room, 'Alice');
    expect(result.ok).toBe(true);
    expect(room.buzzedBy).toBe('Alice');
    expect(room.phase).toBe('answering');
  });

  it('rejects a second buzz while someone is answering', () => {
    buzz(room, 'Alice');
    const result = buzz(room, 'Bob');
    expect(result.ok).toBe(false);
  });

  it('rejects buzz outside question phase', () => {
    room.phase = 'lobby';
    const result = buzz(room, 'Alice');
    expect(result.ok).toBe(false);
  });
});

// ─── submitAnswer ──────────────────────────────────────────────────────────

describe('submitAnswer', () => {
  let room;
  beforeEach(() => {
    room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    buzz(room, 'Alice');
  });

  it('gives +3 points for correct answer', () => {
    const q = room.questionSet[room.questionIndex];
    const result = submitAnswer(room, 'Alice', q.correct);
    expect(result.correct).toBe(true);
    expect(room.players.find(p => p.name === 'Alice').score).toBe(3);
  });

  it('gives -1 point for wrong answer', () => {
    const q = room.questionSet[room.questionIndex];
    const wrongAnswer = (q.correct + 1) % 4;
    const result = submitAnswer(room, 'Alice', wrongAnswer);
    expect(result.correct).toBe(false);
    expect(room.players.find(p => p.name === 'Alice').score).toBe(-1);
  });

  it('rejects answer from wrong player', () => {
    const q = room.questionSet[room.questionIndex];
    const result = submitAnswer(room, 'Bob', q.correct);
    expect(result.ok).toBe(false);
  });

  it('transitions back to question phase after answer', () => {
    const q = room.questionSet[room.questionIndex];
    submitAnswer(room, 'Alice', q.correct);
    expect(room.phase).toBe('reveal');
  });
});

// ─── nextQuestion ──────────────────────────────────────────────────────────

describe('nextQuestion', () => {
  let room;
  beforeEach(() => {
    room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
  });

  it('increments questionIndex', () => {
    buzz(room, 'Alice');
    const q = room.questionSet[room.questionIndex];
    submitAnswer(room, 'Alice', q.correct);
    nextQuestion(room);
    expect(room.questionIndex).toBe(1);
  });

  it('resets buzzedBy to null', () => {
    buzz(room, 'Alice');
    const q = room.questionSet[room.questionIndex];
    submitAnswer(room, 'Alice', q.correct);
    nextQuestion(room);
    expect(room.buzzedBy).toBeNull();
  });

  it('transitions to gameover when all questions done', () => {
    room.questionIndex = 9;
    room.phase = 'reveal';
    nextQuestion(room);
    expect(room.phase).toBe('gameover');
  });
});

// ─── isGameOver / getFinalScores ───────────────────────────────────────────

describe('isGameOver', () => {
  it('returns false during game', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    expect(isGameOver(room)).toBe(false);
  });

  it('returns true in gameover phase', () => {
    const room = createRoom('Alice');
    room.phase = 'gameover';
    expect(isGameOver(room)).toBe(true);
  });
});

describe('getFinalScores', () => {
  it('returns players sorted by score desc', () => {
    const room = createRoom('Alice');
    joinRoom(room, 'Bob');
    startGame(room);
    room.players[0].score = 9;
    room.players[1].score = 3;
    const scores = getFinalScores(room);
    expect(scores[0].name).toBe('Alice');
    expect(scores[0].score).toBe(9);
  });
});

// ─── QUESTIONS ─────────────────────────────────────────────────────────────

describe('QUESTIONS', () => {
  it('has at least 20 questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(20);
  });

  it('each question has text, options (4), correct index', () => {
    QUESTIONS.forEach((q, i) => {
      expect(typeof q.text).toBe('string');
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options).toHaveLength(4);
      expect(typeof q.correct).toBe('number');
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
    });
  });
});
