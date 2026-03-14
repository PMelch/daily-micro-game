// game.test.js — TDD tests for Neon Drift game logic
// Run with: bun test

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createGameState,
  applyMoves,
  isValidDirection,
  isOppositeDirection,
  checkCollision,
  GRID_SIZE,
  DIRS,
} from './game-logic.js';

// ── Constants ──────────────────────────────────────────────────────────────

describe('DIRS constants', () => {
  it('defines 4 directions', () => {
    expect(Object.keys(DIRS).length).toBe(4);
    expect(DIRS.UP).toBeDefined();
    expect(DIRS.DOWN).toBeDefined();
    expect(DIRS.LEFT).toBeDefined();
    expect(DIRS.RIGHT).toBeDefined();
  });

  it('directions have dx/dy offsets', () => {
    expect(DIRS.UP.dy).toBe(-1);
    expect(DIRS.DOWN.dy).toBe(1);
    expect(DIRS.LEFT.dx).toBe(-1);
    expect(DIRS.RIGHT.dx).toBe(1);
  });
});

// ── createGameState ────────────────────────────────────────────────────────

describe('createGameState', () => {
  it('creates initial state with 2 players', () => {
    const state = createGameState();
    expect(state.players).toHaveLength(2);
  });

  it('places players at opposite sides', () => {
    const state = createGameState();
    const p1 = state.players[0];
    const p2 = state.players[1];
    expect(p1.x).not.toBe(p2.x);
  });

  it('initializes trails for each player', () => {
    const state = createGameState();
    state.players.forEach(p => {
      expect(Array.isArray(p.trail)).toBe(true);
      expect(p.trail.length).toBeGreaterThan(0);
    });
  });

  it('sets initial directions', () => {
    const state = createGameState();
    expect(state.players[0].dir).toBeDefined();
    expect(state.players[1].dir).toBeDefined();
  });

  it('initializes scores to 0', () => {
    const state = createGameState();
    state.players.forEach(p => expect(p.score).toBe(0));
  });

  it('marks game as running', () => {
    const state = createGameState();
    expect(state.running).toBe(true);
    expect(state.winner).toBeNull();
  });
});

// ── isOppositeDirection ────────────────────────────────────────────────────

describe('isOppositeDirection', () => {
  it('UP and DOWN are opposites', () => {
    expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
    expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
  });

  it('LEFT and RIGHT are opposites', () => {
    expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
    expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
  });

  it('same direction is not opposite', () => {
    expect(isOppositeDirection('UP', 'UP')).toBe(false);
    expect(isOppositeDirection('LEFT', 'LEFT')).toBe(false);
  });

  it('perpendicular directions are not opposite', () => {
    expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
    expect(isOppositeDirection('RIGHT', 'DOWN')).toBe(false);
  });
});

// ── isValidDirection ───────────────────────────────────────────────────────

describe('isValidDirection', () => {
  it('accepts cardinal directions', () => {
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(d => {
      expect(isValidDirection(d)).toBe(true);
    });
  });

  it('rejects invalid strings', () => {
    expect(isValidDirection('DIAGONAL')).toBe(false);
    expect(isValidDirection('')).toBe(false);
    expect(isValidDirection(null)).toBe(false);
  });

  it('rejects u-turn (opposite of current direction)', () => {
    expect(isValidDirection('DOWN', 'UP')).toBe(false);
    expect(isValidDirection('UP', 'DOWN')).toBe(false);
    expect(isValidDirection('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirection('RIGHT', 'LEFT')).toBe(false);
  });

  it('allows same direction as current', () => {
    expect(isValidDirection('UP', 'UP')).toBe(true);
  });
});

// ── checkCollision ─────────────────────────────────────────────────────────

describe('checkCollision', () => {
  it('detects wall collision (x < 0)', () => {
    expect(checkCollision(-1, 5, [])).toBe(true);
  });

  it('detects wall collision (y < 0)', () => {
    expect(checkCollision(5, -1, [])).toBe(true);
  });

  it('detects wall collision (x >= GRID_SIZE)', () => {
    expect(checkCollision(GRID_SIZE, 5, [])).toBe(true);
  });

  it('detects wall collision (y >= GRID_SIZE)', () => {
    expect(checkCollision(5, GRID_SIZE, [])).toBe(true);
  });

  it('detects trail collision', () => {
    const trails = [[{ x: 5, y: 5 }]];
    expect(checkCollision(5, 5, trails)).toBe(true);
  });

  it('no collision in open space', () => {
    const trails = [[{ x: 3, y: 3 }]];
    expect(checkCollision(5, 5, trails)).toBe(false);
  });

  it('no collision at grid origin', () => {
    expect(checkCollision(0, 0, [])).toBe(false);
  });

  it('no collision at grid boundary (last valid cell)', () => {
    expect(checkCollision(GRID_SIZE - 1, GRID_SIZE - 1, [])).toBe(false);
  });
});

// ── applyMoves ─────────────────────────────────────────────────────────────

describe('applyMoves', () => {
  let state;
  beforeEach(() => { state = createGameState(); });

  it('moves player 1 in their chosen direction', () => {
    const p1 = state.players[0];
    const oldX = p1.x;
    const oldY = p1.y;
    const result = applyMoves(state, 'RIGHT', 'LEFT');
    const np1 = result.state.players[0];
    // Should have moved right
    expect(np1.x).toBe(oldX + 1);
    expect(np1.y).toBe(oldY);
  });

  it('moves player 2 in their chosen direction', () => {
    const p2 = state.players[1];
    const oldX = p2.x;
    const oldY = p2.y;
    const result = applyMoves(state, 'RIGHT', 'LEFT');
    const np2 = result.state.players[1];
    expect(np2.x).toBe(oldX - 1);
    expect(np2.y).toBe(oldY);
  });

  it('extends the trail after a move', () => {
    const p1Before = state.players[0];
    const trailLenBefore = p1Before.trail.length;
    const result = applyMoves(state, 'RIGHT', 'LEFT');
    const p1After = result.state.players[0];
    expect(p1After.trail.length).toBe(trailLenBefore + 1);
  });

  it('rejects U-turn — keeps current direction', () => {
    // Set player 1 direction to RIGHT, try to go LEFT (U-turn)
    state.players[0].dir = 'RIGHT';
    const oldX = state.players[0].x;
    const result = applyMoves(state, 'LEFT', 'RIGHT');
    // Should continue RIGHT, not turn LEFT
    expect(result.state.players[0].x).toBe(oldX + 1);
  });

  it('detects wall crash and marks winner', () => {
    // Place player 1 at the right edge going right
    state.players[0].x = GRID_SIZE - 1;
    state.players[0].dir = 'RIGHT';
    state.players[1].x = 5;
    state.players[1].y = 5;
    state.players[1].dir = 'LEFT';
    // Clear trails to avoid false positives
    state.players[0].trail = [{ x: state.players[0].x, y: state.players[0].y }];
    state.players[1].trail = [{ x: 5, y: 5 }];

    const result = applyMoves(state, 'RIGHT', 'LEFT');
    // Player 1 crashed into wall, player 2 wins the round
    expect(result.crash.length).toBeGreaterThan(0);
    expect(result.crash).toContain(0); // player 0 crashed
  });

  it('detects trail crash', () => {
    const p1 = state.players[0];
    // Place player 2's trail right in front of player 1
    const frontX = p1.x + 1;
    const frontY = p1.y;
    state.players[1].trail = [
      { x: frontX, y: frontY }, // block right in front of p1
    ];
    state.players[1].x = frontX + 5;
    state.players[1].y = frontY;
    state.players[1].dir = 'LEFT';
    p1.dir = 'RIGHT';

    const result = applyMoves(state, 'RIGHT', 'LEFT');
    expect(result.crash).toContain(0);
  });

  it('detects head-on collision (both crash)', () => {
    // Put players adjacent, facing each other
    state.players[0].x = 5;
    state.players[0].y = 10;
    state.players[0].dir = 'RIGHT';
    state.players[0].trail = [{ x: 5, y: 10 }];

    state.players[1].x = 6;
    state.players[1].y = 10;
    state.players[1].dir = 'LEFT';
    state.players[1].trail = [{ x: 6, y: 10 }];

    const result = applyMoves(state, 'RIGHT', 'LEFT');
    // Both moving toward each other — head-on: both crash
    expect(result.crash.length).toBe(2);
  });
});

// ── Round scoring ──────────────────────────────────────────────────────────

describe('round scoring', () => {
  it('increments winner score after round ends', () => {
    const state = createGameState();
    // Force player 0 to crash by putting them at the wall
    state.players[0].x = GRID_SIZE - 1;
    state.players[0].dir = 'RIGHT';
    state.players[0].trail = [{ x: GRID_SIZE - 1, y: state.players[0].y }];
    state.players[1].trail = [{ x: state.players[1].x, y: state.players[1].y }];

    const result = applyMoves(state, 'RIGHT', 'LEFT');
    // Apply scoring
    const newState = result.state;
    if (result.crash.length === 1 && result.crash[0] === 0) {
      newState.players[1].score += 1;
    }
    expect(newState.players[1].score).toBe(1);
  });
});
