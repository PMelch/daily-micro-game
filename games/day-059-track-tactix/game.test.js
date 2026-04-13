import { describe, test, expect } from 'bun:test';
import {
  BOARD_SIZE,
  COMMANDS,
  createGameState,
  queueCommand,
  allCommandsQueued,
  resolveRound,
  getWinners,
  createRoundPickups,
  movePosition,
  turnLeft,
  turnRight,
} from './game.js';

describe('Track Tactix setup', () => {
  test('creates players with names and starting corners', () => {
    const state = createGameState(['Spieler 1', 'Anna', 'Bob']);
    expect(state.players).toHaveLength(3);
    expect(state.players[0].name).toBe('Spieler 1');
    expect(state.players[0].position).toEqual({ x: 0, y: 0 });
    expect(state.players[1].position).toEqual({ x: BOARD_SIZE - 1, y: 0 });
    expect(state.players[2].position).toEqual({ x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 });
    expect(state.round).toBe(1);
  });

  test('creates three pickups away from player spawns', () => {
    const pickups = createRoundPickups(4, 2);
    expect(pickups).toHaveLength(3);
    expect(new Set(pickups.map(p => `${p.x},${p.y}`)).size).toBe(3);
  });
});

describe('command helpers', () => {
  test('turnLeft and turnRight rotate correctly', () => {
    expect(turnLeft('N')).toBe('W');
    expect(turnLeft('W')).toBe('S');
    expect(turnRight('N')).toBe('E');
    expect(turnRight('E')).toBe('S');
  });

  test('movePosition respects board edges', () => {
    expect(movePosition({ x: 0, y: 0 }, 'W')).toEqual({ x: 0, y: 0 });
    expect(movePosition({ x: 0, y: 0 }, 'N')).toEqual({ x: 0, y: 0 });
    expect(movePosition({ x: 2, y: 2 }, 'E')).toEqual({ x: 3, y: 2 });
  });
});

describe('queueing', () => {
  test('queues up to three commands per player', () => {
    let state = createGameState(['A', 'B']);
    state = queueCommand(state, 0, COMMANDS.FORWARD);
    state = queueCommand(state, 0, COMMANDS.LEFT);
    state = queueCommand(state, 0, COMMANDS.RIGHT);
    expect(state.players[0].queue).toEqual(['forward', 'left', 'right']);
  });

  test('allCommandsQueued returns true only when everybody has three commands', () => {
    let state = createGameState(['A', 'B']);
    for (let i = 0; i < 3; i += 1) state = queueCommand(state, 0, COMMANDS.FORWARD);
    expect(allCommandsQueued(state)).toBe(false);
    for (let i = 0; i < 3; i += 1) state = queueCommand(state, 1, COMMANDS.FORWARD);
    expect(allCommandsQueued(state)).toBe(true);
  });
});

describe('resolveRound', () => {
  test('forward moves all players simultaneously', () => {
    let state = createGameState(['A', 'B']);
    state.players[0].facing = 'E';
    state.players[1].facing = 'W';
    state.players[0].queue = ['forward', 'wait', 'wait'];
    state.players[1].queue = ['forward', 'wait', 'wait'];

    const result = resolveRound(state);
    expect(result.players[0].position).toEqual({ x: 1, y: 0 });
    expect(result.players[1].position).toEqual({ x: BOARD_SIZE - 2, y: 0 });
  });

  test('left and right change facing without moving', () => {
    let state = createGameState(['A', 'B']);
    state.players[0].queue = ['left', 'right', 'wait'];
    state.players[1].queue = ['wait', 'wait', 'wait'];

    const result = resolveRound(state);
    expect(result.players[0].position).toEqual({ x: 0, y: 0 });
    expect(result.players[0].facing).toBe('E');
  });

  test('collision on same tile stuns both and cancels movement', () => {
    let state = createGameState(['A', 'B']);
    state.players[0].position = { x: 1, y: 1 };
    state.players[0].facing = 'E';
    state.players[1].position = { x: 3, y: 1 };
    state.players[1].facing = 'W';
    state.players[0].queue = ['forward', 'wait', 'wait'];
    state.players[1].queue = ['forward', 'wait', 'wait'];

    const result = resolveRound(state);
    expect(result.players[0].position).toEqual({ x: 1, y: 1 });
    expect(result.players[1].position).toEqual({ x: 3, y: 1 });
    expect(result.players[0].stunned).toBe(1);
    expect(result.players[1].stunned).toBe(1);
  });

  test('pickup awards a point and removes the pickup', () => {
    let state = createGameState(['A', 'B']);
    state.pickups = [{ x: 1, y: 0, value: 1 }];
    state.players[0].facing = 'E';
    state.players[0].queue = ['forward', 'wait', 'wait'];
    state.players[1].queue = ['wait', 'wait', 'wait'];

    const result = resolveRound(state);
    expect(result.players[0].score).toBe(1);
    expect(result.pickups).toHaveLength(0);
  });

  test('round increments and queues reset after resolve', () => {
    let state = createGameState(['A', 'B']);
    state.players[0].queue = ['wait', 'wait', 'wait'];
    state.players[1].queue = ['wait', 'wait', 'wait'];
    const result = resolveRound(state);
    expect(result.round).toBe(2);
    expect(result.players[0].queue).toEqual([]);
    expect(result.players[1].queue).toEqual([]);
  });
});

describe('winners', () => {
  test('returns highest scoring player', () => {
    const state = createGameState(['A', 'B', 'C']);
    state.players[0].score = 1;
    state.players[1].score = 4;
    state.players[2].score = 2;
    expect(getWinners(state).map(p => p.name)).toEqual(['B']);
  });

  test('returns tied winners together', () => {
    const state = createGameState(['A', 'B', 'C']);
    state.players[0].score = 4;
    state.players[1].score = 4;
    state.players[2].score = 2;
    expect(getWinners(state).map(p => p.name)).toEqual(['A', 'B']);
  });
});
