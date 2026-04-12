import { describe, test, expect } from 'bun:test';
import {
  LEVELS,
  createState,
  movePlayer,
  pulse,
  isWon,
  getTile,
} from './game.js';

describe('Polar Pull logic', () => {
  test('movePlayer walks onto empty floor', () => {
    const state = createState(LEVELS[0]);
    const next = movePlayer(state, 'right');
    expect(next.player).toEqual({ x: 1, y: 0 });
    expect(next.moves).toBe(1);
  });

  test('movePlayer collects a core when stepping onto it', () => {
    const level = {
      width: 3,
      height: 3,
      targetMoves: 4,
      grid: [
        'P.C',
        '...',
        '..E',
      ],
    };
    const state = createState(level);
    const s1 = movePlayer(state, 'right');
    const s2 = movePlayer(s1, 'right');
    expect(s2.collected).toBe(1);
    expect(s2.coresLeft).toBe(0);
  });

  test('pulse attract pulls line-of-sight metal one step toward player', () => {
    const level = {
      width: 5,
      height: 1,
      targetMoves: 3,
      grid: ['P..m.'],
    };
    const state = createState(level);
    const next = pulse(state, 'right', 'attract');
    expect(next.metals[0]).toEqual({ x: 2, y: 0, kind: 'metal' });
    expect(next.energyUsed).toBe(1);
  });

  test('pulse repel pushes line-of-sight metal one step away from player', () => {
    const level = {
      width: 5,
      height: 1,
      targetMoves: 3,
      grid: ['P.m..'],
    };
    const state = createState(level);
    const next = pulse(state, 'right', 'repel');
    expect(next.metals[0]).toEqual({ x: 3, y: 0, kind: 'metal' });
  });

  test('metal on a hole disappears when pushed into it', () => {
    const level = {
      width: 5,
      height: 1,
      targetMoves: 3,
      grid: ['P.mO.'],
    };
    const state = createState(level);
    const next = pulse(state, 'right', 'repel');
    expect(next.metals.length).toBe(0);
  });

  test('player cannot enter walls', () => {
    const level = {
      width: 3,
      height: 1,
      targetMoves: 3,
      grid: ['P#.'],
    };
    const state = createState(level);
    const next = movePlayer(state, 'right');
    expect(next.player).toEqual({ x: 0, y: 0 });
    expect(next.moves).toBe(0);
  });

  test('level is won only when all cores are collected and player reaches exit', () => {
    const level = {
      width: 3,
      height: 2,
      targetMoves: 4,
      grid: [
        'P.C',
        '..E',
      ],
    };
    let state = createState(level);
    state = movePlayer(state, 'right');
    state = movePlayer(state, 'right');
    expect(isWon(state)).toBe(false);
    state = movePlayer(state, 'down');
    expect(isWon(state)).toBe(true);
  });

  test('getTile returns static map features under dynamic actors', () => {
    const state = createState(LEVELS[1]);
    expect(getTile(state, state.exit.x, state.exit.y)).toBe('exit');
  });
});
