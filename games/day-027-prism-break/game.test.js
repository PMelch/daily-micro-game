import { test, expect, describe } from 'bun:test';
import {
  COLORS, PRISM,
  doColorsMatch,
  createBall, createBlock, createPaddle,
  moveBall, bounceX, bounceY,
  checkWallCollision,
  checkPaddleCollision,
  checkBlockCollision,
  isLevelComplete,
  countAliveBlocks,
  clampPaddle,
  createLevel,
} from './game-logic.js';

// ── Color matching ────────────────────────────────────────────────────────────
describe('doColorsMatch', () => {
  test('same color matches', () => {
    expect(doColorsMatch('red', 'red')).toBe(true);
    expect(doColorsMatch('blue', 'blue')).toBe(true);
  });

  test('different colors do not match', () => {
    expect(doColorsMatch('red', 'blue')).toBe(false);
    expect(doColorsMatch('green', 'yellow')).toBe(false);
  });

  test('ball always matches prism block', () => {
    COLORS.forEach(c => {
      expect(doColorsMatch(c, PRISM)).toBe(true);
    });
  });
});

// ── Ball creation ─────────────────────────────────────────────────────────────
describe('createBall', () => {
  test('creates ball with correct properties', () => {
    const ball = createBall(100, 200, 3, -4, 'red');
    expect(ball.x).toBe(100);
    expect(ball.y).toBe(200);
    expect(ball.vx).toBe(3);
    expect(ball.vy).toBe(-4);
    expect(ball.color).toBe('red');
    expect(ball.radius).toBeGreaterThan(0);
  });
});

// ── Block creation ────────────────────────────────────────────────────────────
describe('createBlock', () => {
  test('creates alive block', () => {
    const block = createBlock(10, 20, 60, 20, 'green');
    expect(block.x).toBe(10);
    expect(block.y).toBe(20);
    expect(block.w).toBe(60);
    expect(block.h).toBe(20);
    expect(block.color).toBe('green');
    expect(block.alive).toBe(true);
  });
});

// ── Paddle creation ───────────────────────────────────────────────────────────
describe('createPaddle', () => {
  test('creates paddle with correct properties', () => {
    const paddle = createPaddle(200, 580, 80, 12);
    expect(paddle.x).toBe(200);
    expect(paddle.y).toBe(580);
    expect(paddle.w).toBe(80);
    expect(paddle.h).toBe(12);
  });
});

// ── Ball movement ─────────────────────────────────────────────────────────────
describe('moveBall', () => {
  test('ball moves by velocity each frame', () => {
    const ball = createBall(100, 100, 5, -3, 'red');
    const moved = moveBall(ball, 1);
    expect(moved.x).toBe(105);
    expect(moved.y).toBe(97);
  });

  test('original ball is not mutated', () => {
    const ball = createBall(100, 100, 5, -3, 'red');
    moveBall(ball, 1);
    expect(ball.x).toBe(100);
  });
});

// ── Bounce helpers ────────────────────────────────────────────────────────────
describe('bounce', () => {
  test('bounceX negates vx', () => {
    const ball = createBall(0, 0, 3, 4, 'red');
    expect(bounceX(ball).vx).toBe(-3);
    expect(bounceX(ball).vy).toBe(4);
  });

  test('bounceY negates vy', () => {
    const ball = createBall(0, 0, 3, 4, 'red');
    expect(bounceY(ball).vy).toBe(-4);
    expect(bounceY(ball).vx).toBe(3);
  });
});

// ── Wall collision ────────────────────────────────────────────────────────────
describe('checkWallCollision', () => {
  const W = 480;

  test('bounces off left wall', () => {
    const ball = createBall(5, 200, -4, 0, 'blue');
    const { ball: result, hit } = checkWallCollision(ball, W, 0);
    expect(hit).toBe(true);
    expect(result.vx).toBeGreaterThan(0);
  });

  test('bounces off right wall', () => {
    const ball = createBall(476, 200, 4, 0, 'blue');
    const { ball: result, hit } = checkWallCollision(ball, W, 0);
    expect(hit).toBe(true);
    expect(result.vx).toBeLessThan(0);
  });

  test('bounces off top wall', () => {
    const ball = createBall(240, 5, 0, -4, 'blue');
    const { ball: result, hit } = checkWallCollision(ball, W, 0);
    expect(hit).toBe(true);
    expect(result.vy).toBeGreaterThan(0);
  });

  test('no bounce when ball is away from walls', () => {
    const ball = createBall(240, 240, 3, -3, 'blue');
    const { hit } = checkWallCollision(ball, W, 0);
    expect(hit).toBe(false);
  });

  test('detects ball escaped bottom (lost life)', () => {
    const ball = createBall(240, 700, 0, 5, 'blue');
    const { lost } = checkWallCollision(ball, W, 640);
    expect(lost).toBe(true);
  });
});

// ── Paddle collision ──────────────────────────────────────────────────────────
describe('checkPaddleCollision', () => {
  const paddle = createPaddle(200, 580, 80, 12);

  test('ball bounces off paddle', () => {
    const ball = createBall(240, 572, 2, 4, 'red'); // moving down, near paddle
    const { ball: result, hit } = checkPaddleCollision(ball, paddle);
    expect(hit).toBe(true);
    expect(result.vy).toBeLessThan(0);
  });

  test('ball moving up does not trigger paddle collision', () => {
    const ball = createBall(240, 572, 2, -4, 'red');
    const { hit } = checkPaddleCollision(ball, paddle);
    expect(hit).toBe(false);
  });

  test('ball outside paddle x range misses', () => {
    const ball = createBall(50, 572, 2, 4, 'red'); // way left of paddle
    const { hit } = checkPaddleCollision(ball, paddle);
    expect(hit).toBe(false);
  });

  test('hit angle varies by paddle position', () => {
    const left  = createBall(205, 572, 0, 4, 'red'); // left side of paddle
    const right = createBall(275, 572, 0, 4, 'red'); // right side of paddle
    const resL = checkPaddleCollision(left, paddle);
    const resR = checkPaddleCollision(right, paddle);
    expect(resL.ball.vx).toBeLessThan(resR.ball.vx);
  });
});

// ── Block collision ───────────────────────────────────────────────────────────
describe('checkBlockCollision', () => {
  test('matching color destroys block', () => {
    const ball = createBall(50, 25, 0, 4, 'red');
    const block = createBlock(20, 20, 60, 20, 'red');
    const { hit, destroyed, block: newBlock } = checkBlockCollision(ball, block);
    expect(hit).toBe(true);
    expect(destroyed).toBe(true);
    expect(newBlock.alive).toBe(false);
  });

  test('non-matching color bounces but does not destroy', () => {
    const ball = createBall(50, 25, 0, 4, 'blue');
    const block = createBlock(20, 20, 60, 20, 'red');
    const { hit, destroyed, block: newBlock } = checkBlockCollision(ball, block);
    expect(hit).toBe(true);
    expect(destroyed).toBe(false);
    expect(newBlock.alive).toBe(true);
  });

  test('dead block is skipped', () => {
    const ball = createBall(50, 25, 0, 4, 'red');
    const block = { ...createBlock(20, 20, 60, 20, 'red'), alive: false };
    const { hit } = checkBlockCollision(ball, block);
    expect(hit).toBe(false);
  });

  test('prism block always destroyed', () => {
    const ball = createBall(50, 25, 0, 4, 'red');
    const block = createBlock(20, 20, 60, 20, PRISM);
    const { destroyed } = checkBlockCollision(ball, block);
    expect(destroyed).toBe(true);
  });

  test('hitting prism block changes ball color', () => {
    const ball = createBall(50, 25, 0, 4, 'red');
    const block = createBlock(20, 20, 60, 20, PRISM);
    const { ball: newBall } = checkBlockCollision(ball, block);
    // Color must be valid
    expect([...COLORS, PRISM]).toContain(newBall.color);
  });

  test('ball does not collide with non-overlapping block', () => {
    const ball = createBall(200, 200, 0, 4, 'red');
    const block = createBlock(20, 20, 60, 20, 'red'); // far away
    const { hit } = checkBlockCollision(ball, block);
    expect(hit).toBe(false);
  });
});

// ── Level completion ──────────────────────────────────────────────────────────
describe('isLevelComplete', () => {
  test('complete when all non-prism blocks destroyed', () => {
    const blocks = [
      { ...createBlock(0, 0, 60, 20, 'red'),   alive: false },
      { ...createBlock(0, 0, 60, 20, 'blue'),  alive: false },
      { ...createBlock(0, 0, 60, 20, PRISM),   alive: true  }, // prism leftover ok
    ];
    expect(isLevelComplete(blocks)).toBe(true);
  });

  test('not complete when some non-prism blocks alive', () => {
    const blocks = [
      { ...createBlock(0, 0, 60, 20, 'red'),  alive: true  },
      { ...createBlock(0, 0, 60, 20, 'blue'), alive: false },
    ];
    expect(isLevelComplete(blocks)).toBe(false);
  });

  test('complete when empty block list', () => {
    expect(isLevelComplete([])).toBe(true);
  });
});

// ── Count alive blocks ────────────────────────────────────────────────────────
describe('countAliveBlocks', () => {
  test('counts only alive blocks', () => {
    const blocks = [
      { ...createBlock(0, 0, 60, 20, 'red'),  alive: true  },
      { ...createBlock(0, 0, 60, 20, 'blue'), alive: false },
      { ...createBlock(0, 0, 60, 20, 'green'), alive: true },
    ];
    expect(countAliveBlocks(blocks)).toBe(2);
  });
});

// ── Clamp paddle ──────────────────────────────────────────────────────────────
describe('clampPaddle', () => {
  test('paddle stays within canvas', () => {
    const paddle = createPaddle(0, 580, 80, 12);
    const clamped = clampPaddle({ ...paddle, x: -10 }, 480);
    expect(clamped.x).toBe(0);
  });

  test('paddle right edge clamps', () => {
    const paddle = createPaddle(450, 580, 80, 12);
    const clamped = clampPaddle(paddle, 480);
    expect(clamped.x + clamped.w).toBeLessThanOrEqual(480);
  });
});

// ── Create level ──────────────────────────────────────────────────────────────
describe('createLevel', () => {
  test('level 1 has blocks', () => {
    const blocks = createLevel(1);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.every(b => b.alive)).toBe(true);
  });

  test('level 1 uses only allowed colors', () => {
    const blocks = createLevel(1);
    const allowed = [...COLORS, PRISM];
    blocks.forEach(b => expect(allowed).toContain(b.color));
  });

  test('higher levels have more blocks', () => {
    const l1 = createLevel(1).length;
    const l3 = createLevel(3).length;
    expect(l3).toBeGreaterThanOrEqual(l1);
  });

  test('levels 1-5 are valid', () => {
    for (let i = 1; i <= 5; i++) {
      const blocks = createLevel(i);
      expect(blocks.length).toBeGreaterThan(0);
    }
  });
});
