import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createRoom, joinRoom, startGame, submitGuess,
  resolveRound, nextRound, leaveRoom, getRoomState,
  calculateTarget, GAME_STATES
} from '../game-logic.js';

// Reset module state between tests by creating isolated rooms
describe('calculateTarget', () => {
  it('returns 2/3 of average, rounded', () => {
    // avg(50,50,50) = 50, 2/3*50 = 33.33 -> 33
    expect(calculateTarget([50, 50, 50])).toBe(33);
  });

  it('handles single player', () => {
    // avg(60) = 60, 2/3*60 = 40
    expect(calculateTarget([60])).toBe(40);
  });

  it('returns 0 for all zeros', () => {
    expect(calculateTarget([0, 0, 0])).toBe(0);
  });

  it('handles 100s correctly', () => {
    // avg(100,100) = 100, 2/3*100 = 66.67 -> 67
    expect(calculateTarget([100, 100])).toBe(67);
  });

  it('handles empty array', () => {
    expect(calculateTarget([])).toBe(0);
  });

  it('classic convergence example: if everyone picks 67, target is 44', () => {
    // avg(67,67,67) = 67, 2/3*67 = 44.67 -> 45
    expect(calculateTarget([67, 67, 67])).toBe(45);
  });
});

describe('createRoom', () => {
  it('creates room with valid code and host', () => {
    const result = createRoom('Alice');
    expect(result.success).toBe(true);
    expect(result.code).toHaveLength(4);
    expect(result.room.host).toBe('Alice');
    expect(result.room.state).toBe(GAME_STATES.LOBBY);
    expect(result.room.players).toHaveLength(1);
    expect(result.room.players[0].name).toBe('Alice');
    expect(result.room.players[0].score).toBe(0);
  });
});

describe('joinRoom', () => {
  it('allows a second player to join', () => {
    const { code } = createRoom('Alice');
    const result = joinRoom(code, 'Bob');
    expect(result.success).toBe(true);
    expect(result.room.players).toHaveLength(2);
  });

  it('rejects joining non-existent room', () => {
    const result = joinRoom('ZZZZ', 'Bob');
    expect(result.success).toBe(false);
    expect(result.error).toBe('room_not_found');
  });

  it('rejects duplicate player name', () => {
    const { code } = createRoom('Alice');
    const result = joinRoom(code, 'Alice');
    expect(result.success).toBe(false);
    expect(result.error).toBe('name_taken');
  });

  it('rejects joining started game', () => {
    const { code } = createRoom('Alice');
    joinRoom(code, 'Bob');
    startGame(code, 'Alice');
    const result = joinRoom(code, 'Charlie');
    expect(result.success).toBe(false);
    expect(result.error).toBe('game_started');
  });

  it('rejects when room is full (6 players)', () => {
    const { code } = createRoom('P1');
    for (let i = 2; i <= 6; i++) joinRoom(code, `P${i}`);
    const result = joinRoom(code, 'P7');
    expect(result.success).toBe(false);
    expect(result.error).toBe('room_full');
  });
});

describe('startGame', () => {
  it('starts game with 2+ players', () => {
    const { code } = createRoom('Alice');
    joinRoom(code, 'Bob');
    const result = startGame(code, 'Alice');
    expect(result.success).toBe(true);
    expect(result.room.state).toBe(GAME_STATES.GUESSING);
    expect(result.room.currentRound).toBe(1);
  });

  it('rejects start by non-host', () => {
    const { code } = createRoom('Alice');
    joinRoom(code, 'Bob');
    const result = startGame(code, 'Bob');
    expect(result.success).toBe(false);
    expect(result.error).toBe('not_host');
  });

  it('rejects start with only 1 player', () => {
    const { code } = createRoom('Alice');
    const result = startGame(code, 'Alice');
    expect(result.success).toBe(false);
    expect(result.error).toBe('need_more_players');
  });
});

describe('submitGuess', () => {
  let code;
  beforeEach(() => {
    const r = createRoom('Alice');
    code = r.code;
    joinRoom(code, 'Bob');
    startGame(code, 'Alice');
  });

  it('accepts valid guess', () => {
    const result = submitGuess(code, 'Alice', 42);
    expect(result.success).toBe(true);
    expect(result.allGuessed).toBe(false);
  });

  it('accepts boundary values 0 and 100', () => {
    expect(submitGuess(code, 'Alice', 0).success).toBe(true);
    expect(submitGuess(code, 'Bob', 100).success).toBe(true);
  });

  it('rejects out-of-range guess', () => {
    expect(submitGuess(code, 'Alice', 101).success).toBe(false);
    expect(submitGuess(code, 'Alice', -1).success).toBe(false);
  });

  it('returns allGuessed=true when last player submits', () => {
    submitGuess(code, 'Alice', 50);
    const result = submitGuess(code, 'Bob', 50);
    expect(result.success).toBe(true);
    expect(result.allGuessed).toBe(true);
  });

  it('rejects double submission', () => {
    submitGuess(code, 'Alice', 30);
    const result = submitGuess(code, 'Alice', 40);
    expect(result.success).toBe(false);
    expect(result.error).toBe('already_guessed');
  });
});

describe('resolveRound', () => {
  let code;
  beforeEach(() => {
    const r = createRoom('Alice');
    code = r.code;
    joinRoom(code, 'Bob');
    joinRoom(code, 'Charlie');
    startGame(code, 'Alice');
  });

  it('correctly identifies winner (closest to 2/3 average)', () => {
    // avg(10,20,60) = 30, target = round(2/3 * 30) = 20
    submitGuess(code, 'Alice', 10);
    submitGuess(code, 'Bob', 20);
    submitGuess(code, 'Charlie', 60);
    const result = resolveRound(code);
    expect(result.success).toBe(true);
    expect(result.roundResult.target).toBe(20);
    expect(result.roundResult.winners).toContain('Bob');
    expect(result.roundResult.winners).not.toContain('Alice');
  });

  it('handles tie — multiple winners each get 1 point', () => {
    // avg(30,30,30) = 30, target = 20
    // Alice=20, Bob=20 both win
    submitGuess(code, 'Alice', 20);
    submitGuess(code, 'Bob', 20);
    submitGuess(code, 'Charlie', 80);
    const result = resolveRound(code);
    expect(result.roundResult.winners).toContain('Alice');
    expect(result.roundResult.winners).toContain('Bob');
    const alice = getRoomState(code).players.find(p => p.name === 'Alice');
    const bob = getRoomState(code).players.find(p => p.name === 'Bob');
    expect(alice.score).toBe(1);
    expect(bob.score).toBe(1);
  });

  it('sole winner gets 3 points', () => {
    submitGuess(code, 'Alice', 33);
    submitGuess(code, 'Bob', 50);
    submitGuess(code, 'Charlie', 50);
    resolveRound(code);
    // avg(33,50,50)=44.33, target=round(2/3*44.33)=30
    // Alice(33) vs Bob/Charlie(50), |33-30|=3, |50-30|=20 -> Alice wins
    const alice = getRoomState(code).players.find(p => p.name === 'Alice');
    expect(alice.score).toBe(3);
  });

  it('transitions to REVEAL after non-final round', () => {
    submitGuess(code, 'Alice', 33);
    submitGuess(code, 'Bob', 50);
    submitGuess(code, 'Charlie', 50);
    const result = resolveRound(code);
    expect(result.isLastRound).toBe(false);
    expect(getRoomState(code).state).toBe(GAME_STATES.REVEAL);
  });

  it('transitions to FINISHED after final round', () => {
    // Need to advance to last round
    const room = getRoomState(code);
    room.currentRound = room.totalRounds; // hack to last round
    submitGuess(code, 'Alice', 33);
    submitGuess(code, 'Bob', 50);
    submitGuess(code, 'Charlie', 50);
    const result = resolveRound(code);
    expect(result.isLastRound).toBe(true);
    expect(getRoomState(code).state).toBe(GAME_STATES.FINISHED);
  });
});

describe('nextRound', () => {
  it('advances round and clears guesses', () => {
    const { code } = createRoom('Alice');
    joinRoom(code, 'Bob');
    startGame(code, 'Alice');
    submitGuess(code, 'Alice', 30);
    submitGuess(code, 'Bob', 60);
    resolveRound(code);
    const result = nextRound(code);
    expect(result.success).toBe(true);
    expect(result.room.currentRound).toBe(2);
    expect(result.room.state).toBe(GAME_STATES.GUESSING);
    expect(Object.keys(result.room.guesses)).toHaveLength(0);
  });
});

describe('leaveRoom', () => {
  it('marks player as disconnected', () => {
    const { code } = createRoom('Alice');
    joinRoom(code, 'Bob');
    leaveRoom(code, 'Bob');
    const room = getRoomState(code);
    const bob = room.players.find(p => p.name === 'Bob');
    expect(bob.connected).toBe(false);
  });

  it('deletes room when all players leave', () => {
    const { code } = createRoom('Alice');
    leaveRoom(code, 'Alice');
    expect(getRoomState(code)).toBeNull();
  });
});
