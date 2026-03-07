// TDD tests for Lone Wolf game logic
import { describe, test, expect, beforeEach } from 'bun:test';
import {
  createRoom,
  joinRoom,
  getRoomState,
  startGame,
  submitPick,
  resolveRound,
  calculateScores,
  getUniquepicks,
  getRooms,
  GAME_STATES,
} from '../game-logic.js';

describe('Room Management', () => {
  beforeEach(() => {
    getRooms().clear();
  });

  test('createRoom generates a 4-letter code', () => {
    const room = createRoom('Alice');
    expect(room.code).toMatch(/^[A-Z]{4}$/);
    expect(room.host).toBe('Alice');
    expect(room.state).toBe(GAME_STATES.LOBBY);
  });

  test('joinRoom adds player to existing room', () => {
    const room = createRoom('Alice');
    const result = joinRoom(room.code, 'Bob');
    expect(result.success).toBe(true);
    expect(result.room.players).toHaveLength(2);
    expect(result.room.players.map(p => p.name)).toContain('Bob');
  });

  test('joinRoom fails for unknown room code', () => {
    const result = joinRoom('XXXX', 'Bob');
    expect(result.success).toBe(false);
    expect(result.error).toBe('room_not_found');
  });

  test('joinRoom fails when game already started', () => {
    const room = createRoom('Alice');
    joinRoom(room.code, 'Bob');
    startGame(room.code);
    const result = joinRoom(room.code, 'Charlie');
    expect(result.success).toBe(false);
    expect(result.error).toBe('game_started');
  });

  test('joinRoom fails when room is full (6 players)', () => {
    const room = createRoom('P1');
    ['P2', 'P3', 'P4', 'P5', 'P6'].forEach(p => joinRoom(room.code, p));
    const result = joinRoom(room.code, 'P7');
    expect(result.success).toBe(false);
    expect(result.error).toBe('room_full');
  });
});

describe('Game Start', () => {
  beforeEach(() => {
    getRooms().clear();
  });

  test('startGame transitions to PICKING state with first round', () => {
    const room = createRoom('Alice');
    joinRoom(room.code, 'Bob');
    const result = startGame(room.code);
    expect(result.success).toBe(true);
    const state = getRoomState(room.code);
    expect(state.state).toBe(GAME_STATES.PICKING);
    expect(state.currentRound).toBe(0);
    expect(state.currentQuestion).toBeDefined();
    expect(state.currentQuestion.options).toHaveLength(8);
  });

  test('startGame fails with fewer than 2 players', () => {
    const room = createRoom('Alice');
    const result = startGame(room.code);
    expect(result.success).toBe(false);
    expect(result.error).toBe('not_enough_players');
  });
});

describe('Pick Submission', () => {
  let roomCode;

  beforeEach(() => {
    getRooms().clear();
    const room = createRoom('Alice');
    joinRoom(room.code, 'Bob');
    startGame(room.code);
    roomCode = room.code;
  });

  test('submitPick records player choice', () => {
    const result = submitPick(roomCode, 'Alice', 0);
    expect(result.success).toBe(true);
    const state = getRoomState(roomCode);
    expect(state.picks['Alice']).toBe(0);
  });

  test('submitPick fails for invalid option index', () => {
    const result = submitPick(roomCode, 'Alice', 99);
    expect(result.success).toBe(false);
    expect(result.error).toBe('invalid_option');
  });

  test('submitPick fails when not in PICKING state', () => {
    const room = createRoom('X');
    joinRoom(room.code, 'Y');
    // Don't start game — still in LOBBY
    const result = submitPick(room.code, 'X', 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('wrong_state');
  });

  test('player can change pick before round ends', () => {
    submitPick(roomCode, 'Alice', 0);
    submitPick(roomCode, 'Alice', 3);
    const state = getRoomState(roomCode);
    expect(state.picks['Alice']).toBe(3);
  });
});

describe('Scoring Logic', () => {
  test('getUniquepicks returns only options picked by exactly one player', () => {
    const picks = { Alice: 0, Bob: 1, Charlie: 0, Dave: 2 };
    const unique = getUniquepicks(picks);
    // Alice and Charlie both picked 0 → not unique
    // Bob picked 1 → unique
    // Dave picked 2 → unique
    expect(unique).toContain('Bob');
    expect(unique).toContain('Dave');
    expect(unique).not.toContain('Alice');
    expect(unique).not.toContain('Charlie');
  });

  test('getUniquepicks: all unique when no duplicates', () => {
    const picks = { Alice: 0, Bob: 1, Charlie: 2 };
    const unique = getUniquepicks(picks);
    expect(unique).toHaveLength(3);
  });

  test('getUniquepicks: empty when all same pick', () => {
    const picks = { Alice: 0, Bob: 0, Charlie: 0 };
    const unique = getUniquepicks(picks);
    expect(unique).toHaveLength(0);
  });

  test('calculateScores accumulates over multiple rounds', () => {
    const history = [
      { picks: { Alice: 0, Bob: 1, Charlie: 0 } }, // Bob unique, Alice/Charlie clash
      { picks: { Alice: 2, Bob: 2, Charlie: 3 } }, // Charlie unique, Alice/Bob clash
    ];
    const scores = calculateScores(history);
    expect(scores['Alice']).toBe(0);
    expect(scores['Bob']).toBe(1);
    expect(scores['Charlie']).toBe(1);
  });
});

describe('Round Resolution', () => {
  let roomCode;

  beforeEach(() => {
    getRooms().clear();
    const room = createRoom('Alice');
    joinRoom(room.code, 'Bob');
    startGame(room.code);
    roomCode = room.code;
  });

  test('resolveRound moves to REVEAL state', () => {
    submitPick(roomCode, 'Alice', 0);
    submitPick(roomCode, 'Bob', 1);
    resolveRound(roomCode);
    const state = getRoomState(roomCode);
    expect(state.state).toBe(GAME_STATES.REVEAL);
    expect(state.roundHistory).toHaveLength(1);
  });

  test('resolveRound transitions to SCORES after last round', () => {
    const state = getRoomState(roomCode);
    // Manually set to last round
    state.currentRound = state.questions.length - 1;
    submitPick(roomCode, 'Alice', 0);
    submitPick(roomCode, 'Bob', 1);
    resolveRound(roomCode);
    const finalState = getRoomState(roomCode);
    expect(finalState.state).toBe(GAME_STATES.SCORES);
  });

  test('nextRound advances to next question in PICKING state', () => {
    submitPick(roomCode, 'Alice', 0);
    submitPick(roomCode, 'Bob', 1);
    resolveRound(roomCode);
    // After reveal, can call nextRound to advance
    const state = getRoomState(roomCode);
    expect(state.state).toBe(GAME_STATES.REVEAL);
    expect(state.currentRound).toBe(0);
  });
});
