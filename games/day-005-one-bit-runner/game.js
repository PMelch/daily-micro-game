// One-Bit Runner — game logic
// Canvas: 800x400 logical

export const GROUND_Y = 340;
export const PLAYER_W = 24;
export const PLAYER_H = 32;

const GRAVITY = 1800;
const JUMP_VY = -620;
const BASE_SPEED = 250;
const MAX_SPEED = 550;
const HITBOX_MARGIN = 4; // forgiveness pixels per side

export function createGameState() {
  return {
    player: {
      x: 80,
      y: GROUND_Y - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vy: 0,
      grounded: true,
    },
    obstacles: [],
    distance: 0,
    alive: true,
    spawnTimer: 0,
    nextSpawnDist: 300 + Math.random() * 200,
  };
}

export function jump(state) {
  if (!state.alive) return;
  const p = state.player;
  if (p.grounded) {
    p.vy = JUMP_VY;
    p.grounded = false;
  }
}

export function update(state, dt) {
  if (!state.alive) return;
  const p = state.player;
  const speed = getSpeed(state.distance);

  // gravity
  p.vy += GRAVITY * dt;
  p.y += p.vy * dt;

  // ground clamp
  if (p.y >= GROUND_Y - PLAYER_H) {
    p.y = GROUND_Y - PLAYER_H;
    p.vy = 0;
    p.grounded = true;
  }

  // distance & obstacles
  const dx = speed * dt;
  state.distance += dx;

  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    state.obstacles[i].x -= dx;
    if (state.obstacles[i].x + state.obstacles[i].w < -50) {
      state.obstacles.splice(i, 1);
    }
  }

  // spawn
  state.spawnTimer += dx;
  if (state.spawnTimer >= state.nextSpawnDist) {
    state.spawnTimer = 0;
    state.nextSpawnDist = 200 + Math.random() * 250 + Math.max(0, 100 - state.distance / 100);
    state.obstacles.push(generateObstacle(820));
  }

  // collision
  for (const obs of state.obstacles) {
    if (checkCollision(p, obs)) {
      state.alive = false;
      return;
    }
  }
}

export function checkCollision(player, obs) {
  const m = HITBOX_MARGIN;
  const px = player.x + m;
  const py = player.y + m;
  const pw = (player.w || PLAYER_W) - m * 2;
  const ph = (player.h || PLAYER_H) - m * 2;
  return (
    px < obs.x + obs.w &&
    px + pw > obs.x &&
    py < obs.y + obs.h &&
    py + ph > obs.y
  );
}

export function generateObstacle(xPos) {
  const types = ['spike', 'spike', 'spike', 'tall', 'double'];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case 'spike': {
      const h = 20 + Math.random() * 20 | 0;
      return { x: xPos, y: GROUND_Y - h, w: 18 + Math.random() * 12 | 0, h, type: 'spike' };
    }
    case 'tall': {
      const h = 40 + Math.random() * 25 | 0;
      return { x: xPos, y: GROUND_Y - h, w: 22, h, type: 'tall' };
    }
    case 'double': {
      const h = 24 + Math.random() * 16 | 0;
      return { x: xPos, y: GROUND_Y - h, w: 40 + Math.random() * 20 | 0, h, type: 'double' };
    }
    default: {
      return { x: xPos, y: GROUND_Y - 25, w: 20, h: 25, type: 'spike' };
    }
  }
}

export function getSpeed(distance) {
  return Math.min(MAX_SPEED, BASE_SPEED + distance * 0.012);
}

export function getScore(distance) {
  return Math.floor(distance / 10);
}
