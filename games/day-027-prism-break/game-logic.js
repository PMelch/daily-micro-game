/**
 * Prism Break — Game Logic (pure, no DOM)
 * Color-coded Breakout: ball only destroys matching-color blocks.
 * Prism blocks shatter on any hit and change the ball's color.
 */

export const COLORS = ['red', 'green', 'blue', 'yellow'];
export const PRISM = 'prism';

// ── Color matching ──────────────────────────────────────────────────────────

/** Ball destroys a block only if colors match (or block is prism). */
export function doColorsMatch(ballColor, blockColor) {
  if (blockColor === PRISM) return true;
  return ballColor === blockColor;
}

// ── Factory functions ───────────────────────────────────────────────────────

export function createBall(x, y, vx, vy, color) {
  return { x, y, vx, vy, color, radius: 8 };
}

export function createBlock(x, y, w, h, color) {
  return { x, y, w, h, color, alive: true };
}

export function createPaddle(x, y, w, h) {
  return { x, y, w, h };
}

// ── Ball physics ────────────────────────────────────────────────────────────

/** Move ball one frame (dt in pixels, usually 1). */
export function moveBall(ball, dt = 1) {
  return { ...ball, x: ball.x + ball.vx * dt, y: ball.y + ball.vy * dt };
}

export function bounceX(ball) {
  return { ...ball, vx: -ball.vx };
}

export function bounceY(ball) {
  return { ...ball, vy: -ball.vy };
}

// ── Wall / boundary collision ───────────────────────────────────────────────

/**
 * Check collisions with canvas walls.
 * @param {object} ball
 * @param {number} canvasWidth
 * @param {number} canvasHeight - bottom boundary; if 0, no bottom check
 * @returns {{ ball, hit, lost }}
 */
export function checkWallCollision(ball, canvasWidth, canvasHeight = 0) {
  let b = { ...ball };
  let hit = false;
  let lost = false;

  // Left wall
  if (b.x - b.radius <= 0) {
    b = { ...bounceX(b), x: b.radius };
    hit = true;
  }
  // Right wall
  if (b.x + b.radius >= canvasWidth) {
    b = { ...bounceX(b), x: canvasWidth - b.radius };
    hit = true;
  }
  // Top wall
  if (b.y - b.radius <= 0) {
    b = { ...bounceY(b), y: b.radius };
    hit = true;
  }
  // Bottom (lost life)
  if (canvasHeight > 0 && b.y - b.radius > canvasHeight) {
    lost = true;
  }

  return { ball: b, hit, lost };
}

// ── Paddle collision ─────────────────────────────────────────────────────────

/**
 * Check if ball hits the paddle and bounce with angle.
 * Returns angle-adjusted bounce based on hit position on paddle.
 */
export function checkPaddleCollision(ball, paddle) {
  if (
    ball.vy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.h + 4 &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w
  ) {
    const hitPos = (ball.x - paddle.x) / paddle.w; // 0..1
    const angle = (hitPos - 0.5) * 2; // -1..1
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    return {
      ball: {
        ...ball,
        vy: -Math.abs(ball.vy),
        vx: angle * speed * 0.85,
        y: paddle.y - ball.radius,
      },
      hit: true,
    };
  }
  return { ball, hit: false };
}

// ── Block collision ──────────────────────────────────────────────────────────

/**
 * Check ball vs. single block.
 * - Matching color: block destroyed, ball bounces.
 * - Non-matching: ball bounces, block survives.
 * - Prism: block destroyed, ball color changes randomly.
 *
 * @param {object} ball
 * @param {object} block
 * @param {Function} [rng] optional random fn for testability (0..1)
 * @returns {{ ball, block, hit, destroyed }}
 */
export function checkBlockCollision(ball, block, rng = Math.random) {
  if (!block.alive) return { ball, block, hit: false, destroyed: false };

  const bLeft   = ball.x - ball.radius;
  const bRight  = ball.x + ball.radius;
  const bTop    = ball.y - ball.radius;
  const bBottom = ball.y + ball.radius;

  // AABB overlap test
  if (
    bRight  <= block.x ||
    bLeft   >= block.x + block.w ||
    bBottom <= block.y ||
    bTop    >= block.y + block.h
  ) {
    return { ball, block, hit: false, destroyed: false };
  }

  // Minimum-overlap axis bounce + reposition ball outside block
  const overlapLeft   = bRight  - block.x;
  const overlapRight  = (block.x + block.w) - bLeft;
  const overlapTop    = bBottom - block.y;
  const overlapBottom = (block.y + block.h) - bTop;
  const minOverlap    = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  let newBall = { ...ball };
  if (minOverlap === overlapTop) {
    newBall = bounceY(newBall);
    newBall.y = block.y - ball.radius;
  } else if (minOverlap === overlapBottom) {
    newBall = bounceY(newBall);
    newBall.y = block.y + block.h + ball.radius;
  } else if (minOverlap === overlapLeft) {
    newBall = bounceX(newBall);
    newBall.x = block.x - ball.radius;
  } else {
    newBall = bounceX(newBall);
    newBall.x = block.x + block.w + ball.radius;
  }

  const colorMatch = doColorsMatch(ball.color, block.color);
  let newBlock = { ...block };
  let destroyed = false;
  let newColor = ball.color;

  if (colorMatch) {
    newBlock = { ...block, alive: false };
    destroyed = true;

    if (block.color === PRISM) {
      // Change ball color (different from current if possible)
      const others = COLORS.filter(c => c !== ball.color);
      const pool = others.length > 0 ? others : COLORS;
      newColor = pool[Math.floor(rng() * pool.length)];
    }
  }

  return {
    ball: { ...newBall, color: newColor },
    block: newBlock,
    hit: true,
    destroyed,
  };
}

// ── Level queries ────────────────────────────────────────────────────────────

/**
 * Level complete when all non-prism blocks are destroyed.
 * (Remaining prism blocks are OK — the player cleared what needed clearing.)
 */
export function isLevelComplete(blocks) {
  return blocks.filter(b => b.color !== PRISM).every(b => !b.alive);
}

export function countAliveBlocks(blocks) {
  return blocks.filter(b => b.alive).length;
}

// ── Paddle clamping ──────────────────────────────────────────────────────────

export function clampPaddle(paddle, canvasWidth) {
  let x = paddle.x;
  if (x < 0) x = 0;
  if (x + paddle.w > canvasWidth) x = canvasWidth - paddle.w;
  return { ...paddle, x };
}

// ── Level definitions ────────────────────────────────────────────────────────

const BLOCK_W = 54;
const BLOCK_H = 18;
const BLOCK_GAP_X = 4;
const BLOCK_GAP_Y = 4;
const GRID_OFFSET_X = 15;
const GRID_OFFSET_Y = 80;

function makeGrid(rows, pattern) {
  const blocks = [];
  for (let row = 0; row < rows.length; row++) {
    const cols = rows[row];
    for (let col = 0; col < cols.length; col++) {
      const colorCode = cols[col];
      if (!colorCode) continue; // null = empty
      const x = GRID_OFFSET_X + col * (BLOCK_W + BLOCK_GAP_X);
      const y = GRID_OFFSET_Y + row * (BLOCK_H + BLOCK_GAP_Y);
      blocks.push(createBlock(x, y, BLOCK_W, BLOCK_H, colorCode));
    }
  }
  return blocks;
}

const R = 'red', G = 'green', B = 'blue', Y = 'yellow', P = PRISM;

export function createLevel(level) {
  switch (level) {
    case 1:
      return makeGrid([
        [R, R, R, R, B, B, B, B],
        [R, R, R, R, B, B, B, B],
        [R, R, R, R, B, B, B, B],
        [null, null, null, P, P, null, null, null],
      ]);
    case 2:
      return makeGrid([
        [R, R, G, G, B, B, R, R],
        [R, G, G, P, P, G, G, R],
        [G, G, B, B, B, B, G, G],
        [B, B, B, G, G, B, B, B],
        [null, R, R, null, null, R, R, null],
      ]);
    case 3:
      return makeGrid([
        [Y, Y, Y, Y, Y, Y, Y, Y],
        [R, R, P, B, B, P, G, G],
        [R, B, B, R, G, G, R, B],
        [B, R, R, G, B, G, G, R],
        [G, G, P, G, R, P, B, B],
        [Y, Y, Y, Y, Y, Y, Y, Y],
      ]);
    case 4:
      return makeGrid([
        [B, B, R, R, G, G, Y, Y],
        [B, P, R, P, G, P, Y, P],
        [R, R, G, G, Y, Y, B, B],
        [R, P, G, P, Y, P, B, P],
        [G, G, Y, Y, B, B, R, R],
        [G, P, Y, P, B, P, R, P],
        [Y, Y, B, B, R, R, G, G],
      ]);
    case 5:
      return makeGrid([
        [P, R, G, B, Y, R, G, P],
        [R, P, R, G, B, Y, P, G],
        [G, R, P, R, G, P, Y, B],
        [B, G, R, P, P, G, R, Y],
        [Y, B, G, R, R, P, G, B],
        [G, Y, B, G, P, R, B, R],
        [R, G, Y, B, G, R, P, G],
        [P, R, G, Y, B, G, R, P],
      ]);
    default:
      return createLevel(5);
  }
}
