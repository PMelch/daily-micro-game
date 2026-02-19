// Ricochet - Game Logic
// Ball-bouncing physics puzzler

const BALL_RADIUS = 8;
const FRICTION = 0.992;
const STOP_THRESHOLD = 0.3;

export function reflect({ vx, vy }, { nx, ny }) {
  const dot = vx * nx + vy * ny;
  return { vx: vx - 2 * dot * nx, vy: vy - 2 * dot * ny };
}

export function checkWallBounce(ball, bounds, walls = []) {
  let { x, y, vx, vy, r } = ball;

  // Boundary walls
  if (x - r <= bounds.x) { vx = Math.abs(vx); x = bounds.x + r; }
  if (x + r >= bounds.x + bounds.w) { vx = -Math.abs(vx); x = bounds.x + bounds.w - r; }
  if (y - r <= bounds.y) { vy = Math.abs(vy); y = bounds.y + r; }
  if (y + r >= bounds.y + bounds.h) { vy = -Math.abs(vy); y = bounds.y + bounds.h - r; }

  // Inner walls — treat as line segments, simple proximity check
  for (const wall of walls) {
    const { x1, y1, x2, y2 } = wall;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) continue;
    // Normal of wall segment
    let nx = -dy / len, ny = dx / len;
    // Project ball center onto wall line
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (len * len)));
    const closestX = x1 + t * dx, closestY = y1 + t * dy;
    const distX = x - closestX, distY = y - closestY;
    const dist = Math.sqrt(distX * distX + distY * distY);
    if (dist < r + 2) {
      // Ensure normal points toward ball
      if (distX * nx + distY * ny < 0) { nx = -nx; ny = -ny; }
      const ref = reflect({ vx, vy }, { nx, ny });
      vx = ref.vx; vy = ref.vy;
      // Push ball out
      const overlap = r + 2 - dist;
      x += nx * overlap; y += ny * overlap;
    }
  }

  return { ...ball, x, y, vx, vy };
}

export function checkTargetHit(ball, targets) {
  return targets.map(t => {
    if (t.hit) return t;
    const dx = ball.x - t.x, dy = ball.y - t.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ball.r + t.r) return { ...t, hit: true };
    return t;
  });
}

export function stepBall(ball, bounds, walls = [], targets = []) {
  let b = { ...ball };
  b.x += b.vx;
  b.y += b.vy;
  b = checkWallBounce(b, bounds, walls);
  b.vx *= FRICTION;
  b.vy *= FRICTION;
  const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  const stopped = speed < STOP_THRESHOLD;
  if (stopped) { b.vx = 0; b.vy = 0; }
  const newTargets = checkTargetHit(b, targets);
  return { ball: b, targets: newTargets, stopped };
}

export function createBallState(x, y) {
  return { x, y, vx: 0, vy: 0, r: BALL_RADIUS };
}

export function simulateTrajectory(ball, bounds, walls, steps = 80) {
  const pts = [{ x: ball.x, y: ball.y }];
  let b = { ...ball };
  for (let i = 0; i < steps - 1; i++) {
    b.x += b.vx; b.y += b.vy;
    b = checkWallBounce(b, bounds, walls);
    b.vx *= FRICTION; b.vy *= FRICTION;
    pts.push({ x: b.x, y: b.y });
    if (Math.sqrt(b.vx * b.vx + b.vy * b.vy) < STOP_THRESHOLD) break;
  }
  return pts;
}

// ── Levels ──
export const LEVELS = [
  // 1: Simple straight shot
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 500 }, walls: [],
    targets: [{ x: 400, y: 100, r: 15 }] },
  // 2: One target off to the side
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 100, y: 500 }, walls: [],
    targets: [{ x: 700, y: 100, r: 15 }] },
  // 3: Two targets
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 500 }, walls: [],
    targets: [{ x: 200, y: 100, r: 15 }, { x: 600, y: 100, r: 15 }] },
  // 4: Bank shot required — wall blocks direct path
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 500 }, walls: [
    { x1: 200, y1: 300, x2: 600, y2: 300 }],
    targets: [{ x: 400, y: 150, r: 15 }] },
  // 5: Two walls, two targets
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 100, y: 500 }, walls: [
    { x1: 300, y1: 200, x2: 300, y2: 450 },
    { x1: 500, y1: 150, x2: 500, y2: 400 }],
    targets: [{ x: 700, y: 100, r: 15 }, { x: 700, y: 400, r: 15 }] },
  // 6: Corner bounces
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 50, y: 550 }, walls: [
    { x1: 200, y1: 100, x2: 200, y2: 500 }],
    targets: [{ x: 750, y: 50, r: 15 }, { x: 50, y: 50, r: 15 }] },
  // 7: Maze-like
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 550 }, walls: [
    { x1: 150, y1: 400, x2: 650, y2: 400 },
    { x1: 150, y1: 200, x2: 650, y2: 200 },
    { x1: 650, y1: 200, x2: 650, y2: 400 }],
    targets: [{ x: 100, y: 100, r: 15 }, { x: 400, y: 300, r: 12 }] },
  // 8: Three targets, two walls
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 550 }, walls: [
    { x1: 250, y1: 350, x2: 550, y2: 350 },
    { x1: 400, y1: 150, x2: 400, y2: 350 }],
    targets: [{ x: 150, y: 100, r: 12 }, { x: 650, y: 100, r: 12 }, { x: 400, y: 50, r: 12 }] },
  // 9: Tight corridors
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 50, y: 550 }, walls: [
    { x1: 200, y1: 0, x2: 200, y2: 450 },
    { x1: 400, y1: 150, x2: 400, y2: 600 },
    { x1: 600, y1: 0, x2: 600, y2: 450 }],
    targets: [{ x: 100, y: 50, r: 12 }, { x: 300, y: 300, r: 12 }, { x: 500, y: 50, r: 12 }, { x: 750, y: 300, r: 12 }] },
  // 10: The gauntlet — four walls, four targets
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 550 }, walls: [
    { x1: 150, y1: 450, x2: 350, y2: 450 },
    { x1: 450, y1: 450, x2: 650, y2: 450 },
    { x1: 150, y1: 250, x2: 350, y2: 250 },
    { x1: 450, y1: 250, x2: 650, y2: 250 },
    { x1: 350, y1: 250, x2: 350, y2: 450 },
    { x1: 450, y1: 250, x2: 450, y2: 450 }],
    targets: [{ x: 100, y: 100, r: 12 }, { x: 700, y: 100, r: 12 }, { x: 250, y: 350, r: 10 }, { x: 550, y: 350, r: 10 }] },
  // 11: Sniper — tiny targets, long bounces
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 50, y: 550 }, walls: [
    { x1: 300, y1: 100, x2: 300, y2: 500 },
    { x1: 500, y1: 100, x2: 500, y2: 500 },
    { x1: 300, y1: 100, x2: 500, y2: 100 }],
    targets: [{ x: 400, y: 300, r: 8 }, { x: 750, y: 50, r: 8 }, { x: 750, y: 550, r: 8 }, { x: 50, y: 50, r: 8 }, { x: 150, y: 300, r: 8 }] },
  // 12: Final boss — lots of walls and targets
  { bounds: { x: 0, y: 0, w: 800, h: 600 }, spawn: { x: 400, y: 570 }, walls: [
    { x1: 100, y1: 480, x2: 350, y2: 480 },
    { x1: 450, y1: 480, x2: 700, y2: 480 },
    { x1: 200, y1: 350, x2: 600, y2: 350 },
    { x1: 200, y1: 350, x2: 200, y2: 220 },
    { x1: 600, y1: 350, x2: 600, y2: 220 },
    { x1: 200, y1: 220, x2: 400, y2: 220 },
    { x1: 400, y1: 100, x2: 400, y2: 220 }],
    targets: [{ x: 100, y: 100, r: 10 }, { x: 700, y: 100, r: 10 }, { x: 300, y: 280, r: 10 }, { x: 500, y: 280, r: 10 }, { x: 400, y: 50, r: 10 }, { x: 50, y: 400, r: 10 }] },
];
