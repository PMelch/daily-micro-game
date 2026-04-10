import { describe, test, expect } from 'bun:test';
import {
  turnLeft, turnRight, moveForward, simulateStep,
  simulateProgram, createState, LEVELS
} from './game.js';

describe('Clockwork Courier logic', () => {
  test('turnLeft and turnRight rotate cardinal directions', () => {
    expect(turnLeft('N')).toBe('W');
    expect(turnLeft('W')).toBe('S');
    expect(turnRight('N')).toBe('E');
    expect(turnRight('E')).toBe('S');
  });

  test('moveForward advances by facing direction', () => {
    expect(moveForward({ x: 2, y: 2, dir: 'N' })).toEqual({ x: 2, y: 1, dir: 'N' });
    expect(moveForward({ x: 2, y: 2, dir: 'E' })).toEqual({ x: 3, y: 2, dir: 'E' });
    expect(moveForward({ x: 2, y: 2, dir: 'S' })).toEqual({ x: 2, y: 3, dir: 'S' });
    expect(moveForward({ x: 2, y: 2, dir: 'W' })).toEqual({ x: 1, y: 2, dir: 'W' });
  });

  test('collects parcel when robot enters parcel tile', () => {
    const level = {
      cols: 3, rows: 3,
      start: { x: 0, y: 1, dir: 'E' },
      exit: { x: 2, y: 1 },
      walls: [],
      parcels: [{ x: 1, y: 1 }],
      patrols: [],
      programLength: 2,
      maxSteps: 8,
    };
    const state = createState(level, ['F', 'W']);
    const next = simulateStep(state);
    expect(next.collected.size).toBe(1);
    expect(next.robot.x).toBe(1);
    expect(next.status).toBe('running');
  });

  test('hits wall and fails when moving into wall', () => {
    const level = {
      cols: 3, rows: 3,
      start: { x: 0, y: 1, dir: 'E' },
      exit: { x: 2, y: 1 },
      walls: [{ x: 1, y: 1 }],
      parcels: [],
      patrols: [],
      programLength: 1,
      maxSteps: 8,
    };
    const state = createState(level, ['F']);
    const next = simulateStep(state);
    expect(next.status).toBe('crashed');
    expect(next.failReason).toBe('wall');
  });

  test('loops program commands', () => {
    const level = {
      cols: 4, rows: 4,
      start: { x: 0, y: 1, dir: 'E' },
      exit: { x: 3, y: 3 },
      walls: [],
      parcels: [],
      patrols: [],
      programLength: 2,
      maxSteps: 8,
    };
    // Seq: F, R, F, R
    // Step 1 (cmd F): robot becomes 1,1 E
    // Step 2 (cmd R): robot becomes 1,1 S
    // Step 3 (cmd F): robot becomes 1,2 S
    // Step 4 (cmd R): robot becomes 1,2 W
    const result = simulateProgram(level, ['F', 'R'], 4);
    expect(result.robot).toEqual({ x: 1, y: 2, dir: 'W' });
  });

  test('patrol collision causes failure', () => {
    const level = {
      cols: 3, rows: 3,
      start: { x: 0, y: 1, dir: 'E' },
      exit: { x: 2, y: 1 },
      walls: [],
      parcels: [],
      patrols: [{ path: [{ x: 2, y: 1 }, { x: 1, y: 1 }] }], 
      programLength: 1,
      maxSteps: 8,
    };
    const state = createState(level, ['F']); 
    const next = simulateStep(state);
    expect(next.status).toBe('crashed');
    expect(next.failReason).toBe('patrol');
  });

  test('level 1 authored solution succeeds', () => {
    const result = simulateProgram(LEVELS[0], LEVELS[0].solution, LEVELS[0].solution.length);
    expect(result.status).toBe('success');
  });

  test('all authored levels have working solutions', () => {
    for (const level of LEVELS) {
      const result = simulateProgram(level, level.solution, level.maxSteps);
      expect(result.status, `Level ${level.id} should be solvable`).toBe('success');
    }
  });
});
