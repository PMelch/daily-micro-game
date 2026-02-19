import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  reflect, stepBall, checkWallBounce, checkTargetHit,
  LEVELS, createBallState, simulateTrajectory
} from './game.js';

describe('reflect', () => {
  it('reflects velocity on horizontal wall (top/bottom)', () => {
    const v = reflect({ vx: 3, vy: 4 }, { nx: 0, ny: 1 });
    assert.deepStrictEqual(v, { vx: 3, vy: -4 });
  });
  it('reflects velocity on vertical wall (left/right)', () => {
    const v = reflect({ vx: 3, vy: 4 }, { nx: 1, ny: 0 });
    assert.deepStrictEqual(v, { vx: -3, vy: 4 });
  });
});

describe('checkWallBounce', () => {
  const bounds = { x: 0, y: 0, w: 800, h: 600 };
  const r = 8;

  it('bounces off left wall', () => {
    const ball = { x: 3, y: 300, vx: -5, vy: 2, r };
    const result = checkWallBounce(ball, bounds);
    assert.ok(result.vx > 0);
    assert.equal(result.vy, 2);
  });

  it('bounces off right wall', () => {
    const ball = { x: 797, y: 300, vx: 5, vy: 2, r };
    const result = checkWallBounce(ball, bounds);
    assert.ok(result.vx < 0);
  });

  it('bounces off top wall', () => {
    const ball = { x: 400, y: 3, vx: 2, vy: -5, r };
    const result = checkWallBounce(ball, bounds);
    assert.ok(result.vy > 0);
  });

  it('bounces off bottom wall', () => {
    const ball = { x: 400, y: 597, vx: 2, vy: 5, r };
    const result = checkWallBounce(ball, bounds);
    assert.ok(result.vy < 0);
  });

  it('no bounce in center', () => {
    const ball = { x: 400, y: 300, vx: 5, vy: 5, r };
    const result = checkWallBounce(ball, bounds);
    assert.equal(result.vx, 5);
    assert.equal(result.vy, 5);
  });
});

describe('checkWallBounce with inner walls', () => {
  const bounds = { x: 0, y: 0, w: 800, h: 600 };
  const r = 8;

  it('bounces off a horizontal inner wall', () => {
    const walls = [{ x1: 200, y1: 300, x2: 600, y2: 300 }];
    const ball = { x: 400, y: 296, vx: 3, vy: 5, r };
    const result = checkWallBounce(ball, bounds, walls);
    assert.ok(result.vy < 0, 'should bounce off horizontal wall');
  });

  it('bounces off a vertical inner wall', () => {
    const walls = [{ x1: 400, y1: 100, x2: 400, y2: 500 }];
    const ball = { x: 396, y: 300, vx: 5, vy: 3, r };
    const result = checkWallBounce(ball, bounds, walls);
    assert.ok(result.vx < 0, 'should bounce off vertical wall');
  });
});

describe('checkTargetHit', () => {
  it('detects hit when ball overlaps target', () => {
    const ball = { x: 100, y: 100, r: 8 };
    const targets = [{ x: 105, y: 100, r: 12, hit: false }];
    const result = checkTargetHit(ball, targets);
    assert.equal(result[0].hit, true);
  });

  it('ignores already hit targets', () => {
    const ball = { x: 100, y: 100, r: 8 };
    const targets = [{ x: 105, y: 100, r: 12, hit: true }];
    const result = checkTargetHit(ball, targets);
    assert.equal(result[0].hit, true);
  });

  it('does not hit distant targets', () => {
    const ball = { x: 100, y: 100, r: 8 };
    const targets = [{ x: 500, y: 500, r: 12, hit: false }];
    const result = checkTargetHit(ball, targets);
    assert.equal(result[0].hit, false);
  });
});

describe('stepBall', () => {
  it('moves ball by velocity', () => {
    const ball = { x: 100, y: 100, vx: 5, vy: -3, r: 8 };
    const bounds = { x: 0, y: 0, w: 800, h: 600 };
    const result = stepBall(ball, bounds, []);
    assert.equal(result.ball.x, 105);
    assert.equal(result.ball.y, 97);
  });

  it('applies friction to slow ball down', () => {
    const ball = { x: 400, y: 300, vx: 10, vy: 0, r: 8 };
    const bounds = { x: 0, y: 0, w: 800, h: 600 };
    const result = stepBall(ball, bounds, []);
    assert.ok(result.ball.vx < 10);
  });

  it('marks ball stopped when slow enough', () => {
    const ball = { x: 400, y: 300, vx: 0.05, vy: 0.05, r: 8 };
    const bounds = { x: 0, y: 0, w: 800, h: 600 };
    const result = stepBall(ball, bounds, []);
    assert.equal(result.stopped, true);
  });
});

describe('createBallState', () => {
  it('creates ball at spawn with zero velocity', () => {
    const ball = createBallState(100, 200);
    assert.equal(ball.x, 100);
    assert.equal(ball.y, 200);
    assert.equal(ball.vx, 0);
    assert.equal(ball.vy, 0);
  });
});

describe('simulateTrajectory', () => {
  it('returns array of points', () => {
    const ball = { x: 400, y: 500, vx: 5, vy: -8, r: 8 };
    const bounds = { x: 0, y: 0, w: 800, h: 600 };
    const pts = simulateTrajectory(ball, bounds, [], 60);
    assert.ok(pts.length > 0);
    assert.ok(pts.length <= 60);
    assert.equal(pts[0].x, ball.x);
    assert.equal(pts[0].y, ball.y);
  });

  it('trajectory reflects off walls', () => {
    // Shoot right — should bounce off right wall
    const ball = { x: 790, y: 300, vx: 10, vy: 0, r: 8 };
    const bounds = { x: 0, y: 0, w: 800, h: 600 };
    const pts = simulateTrajectory(ball, bounds, [], 30);
    const lastPt = pts[pts.length - 1];
    assert.ok(lastPt.x < 790, 'ball should have bounced back');
  });
});

describe('LEVELS', () => {
  it('has at least 10 levels', () => {
    assert.ok(LEVELS.length >= 10);
  });

  it('each level has spawn, targets, and bounds', () => {
    for (const lvl of LEVELS) {
      assert.ok(lvl.spawn, 'missing spawn');
      assert.ok(lvl.targets?.length > 0, 'missing targets');
      assert.ok(lvl.bounds, 'missing bounds');
    }
  });

  it('levels get progressively harder (more targets or walls)', () => {
    const first = LEVELS[0];
    const last = LEVELS[LEVELS.length - 1];
    const firstComplexity = first.targets.length + (first.walls?.length || 0);
    const lastComplexity = last.targets.length + (last.walls?.length || 0);
    assert.ok(lastComplexity > firstComplexity, 'last level should be more complex');
  });
});
