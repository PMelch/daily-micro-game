import { describe, test, expect } from 'bun:test';
import {
  createGameState,
  jump,
  update,
  checkCollision,
  generateObstacle,
  getSpeed,
  getScore,
  GROUND_Y,
  PLAYER_W,
  PLAYER_H,
} from './game.js';

describe('createGameState', () => {
  test('creates initial state with player on ground', () => {
    const s = createGameState();
    expect(s.player.x).toBe(80);
    expect(s.player.y).toBe(GROUND_Y - PLAYER_H);
    expect(s.player.vy).toBe(0);
    expect(s.obstacles).toEqual([]);
    expect(s.distance).toBe(0);
    expect(s.alive).toBe(true);
  });
});

describe('jump', () => {
  test('gives player negative vy when on ground', () => {
    const s = createGameState();
    jump(s);
    expect(s.player.vy).toBeLessThan(0);
  });

  test('does not double jump', () => {
    const s = createGameState();
    jump(s);
    const vy1 = s.player.vy;
    s.player.y -= 10; // in air
    jump(s);
    expect(s.player.vy).toBe(vy1);
  });

  test('does nothing when dead', () => {
    const s = createGameState();
    s.alive = false;
    jump(s);
    expect(s.player.vy).toBe(0);
  });
});

describe('update', () => {
  test('applies gravity each tick', () => {
    const s = createGameState();
    jump(s);
    const vyBefore = s.player.vy;
    update(s, 1 / 60);
    expect(s.player.vy).toBeGreaterThan(vyBefore);
  });

  test('player lands on ground', () => {
    const s = createGameState();
    s.player.y = GROUND_Y - PLAYER_H + 5; // below ground
    s.player.vy = 100;
    update(s, 1 / 60);
    expect(s.player.y).toBe(GROUND_Y - PLAYER_H);
    expect(s.player.vy).toBe(0);
    expect(s.player.grounded).toBe(true);
  });

  test('distance increases', () => {
    const s = createGameState();
    update(s, 1 / 60);
    expect(s.distance).toBeGreaterThan(0);
  });

  test('obstacles scroll left', () => {
    const s = createGameState();
    s.obstacles.push({ x: 400, y: GROUND_Y - 30, w: 20, h: 30, type: 'spike' });
    update(s, 1 / 60);
    expect(s.obstacles[0].x).toBeLessThan(400);
  });

  test('offscreen obstacles are removed', () => {
    const s = createGameState();
    s.obstacles.push({ x: -100, y: GROUND_Y - 30, w: 20, h: 30, type: 'spike' });
    update(s, 1 / 60);
    expect(s.obstacles.length).toBe(0);
  });

  test('does not update when dead', () => {
    const s = createGameState();
    s.alive = false;
    s.distance = 42;
    update(s, 1 / 60);
    expect(s.distance).toBe(42);
  });
});

describe('checkCollision', () => {
  test('detects collision with overlapping obstacle', () => {
    const player = { x: 80, y: 200, w: PLAYER_W, h: PLAYER_H };
    const obs = { x: 85, y: 205, w: 20, h: 30 };
    expect(checkCollision(player, obs)).toBe(true);
  });

  test('no collision when far apart', () => {
    const player = { x: 80, y: 200, w: PLAYER_W, h: PLAYER_H };
    const obs = { x: 500, y: 200, w: 20, h: 30 };
    expect(checkCollision(player, obs)).toBe(false);
  });

  test('uses shrunken hitbox (forgiving)', () => {
    // Player right edge barely touches obstacle left edge — should NOT collide due to margin
    const player = { x: 80, y: 200, w: PLAYER_W, h: PLAYER_H };
    const obs = { x: 80 + PLAYER_W - 2, y: 200, w: 20, h: 30 };
    expect(checkCollision(player, obs)).toBe(false);
  });
});

describe('generateObstacle', () => {
  test('returns obstacle with required fields', () => {
    const obs = generateObstacle(800);
    expect(obs.x).toBe(800);
    expect(obs.y).toBeDefined();
    expect(obs.w).toBeGreaterThan(0);
    expect(obs.h).toBeGreaterThan(0);
    expect(obs.type).toBeDefined();
  });

  test('obstacle y + h roughly at ground level for spikes', () => {
    // Generate many and check spikes sit on ground
    for (let i = 0; i < 50; i++) {
      const obs = generateObstacle(800);
      if (obs.type === 'spike') {
        expect(obs.y + obs.h).toBe(GROUND_Y);
      }
    }
  });
});

describe('getSpeed', () => {
  test('starts at base speed', () => {
    expect(getSpeed(0)).toBeCloseTo(250, -1);
  });

  test('increases over distance', () => {
    expect(getSpeed(5000)).toBeGreaterThan(getSpeed(0));
  });

  test('caps at max speed', () => {
    expect(getSpeed(1000000)).toBeLessThanOrEqual(600);
  });
});

describe('getScore', () => {
  test('score is based on distance', () => {
    expect(getScore(0)).toBe(0);
    expect(getScore(100)).toBeGreaterThan(0);
  });

  test('score increases with distance', () => {
    expect(getScore(500)).toBeGreaterThan(getScore(100));
  });
});
