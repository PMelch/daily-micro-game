// game-logic.js — Pure game logic for Type Blitz (testable, no DOM deps)

export const WORDS_BY_LEVEL = [
  // Level 1 — short, common
  ['STAR', 'MOON', 'SUN', 'BEAM', 'FIRE', 'BOLT', 'NOVA', 'FLUX', 'CORE', 'VOID'],
  // Level 2 — medium
  ['LASER', 'COMET', 'ORBIT', 'PULSE', 'RADAR', 'PRISM', 'NEBUL', 'BLAZE', 'QUARK', 'VAPOR'],
  // Level 3 — longer
  ['METEOR', 'PHOTON', 'GALAXY', 'PLASMA', 'RADIANT', 'FUSION', 'VECTOR', 'ZENITH', 'ECLIPSE', 'QUANTUM'],
  // Level 4 — hard
  ['SUPERNOVA', 'ANTIMATTER', 'BLACKHOLE', 'WORMHOLE', 'HYPERDRIVE', 'STARBURST', 'MAGNITUDE', 'LIGHTYEAR', 'RADIATION', 'SINGULARITY'],
];

export const LEVEL_THRESHOLDS = [0, 5, 12, 22]; // score thresholds for each level (0-indexed)
export const BASE_SPEED = 0.18;         // pixels per frame at level 1
export const SPEED_PER_LEVEL = 0.07;   // additional speed per level
export const MAX_ENEMIES_BY_LEVEL = [2, 3, 4, 5];
export const SPAWN_INTERVAL_BY_LEVEL = [220, 170, 130, 90]; // frames between spawns
export const POINTS_PER_WORD_BY_LEVEL = [1, 2, 3, 5];

/**
 * Returns current level (0-indexed) based on score.
 */
export function getLevelFromScore(score) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

/**
 * Returns enemy speed for a given level.
 */
export function getEnemySpeed(level) {
  return BASE_SPEED + level * SPEED_PER_LEVEL;
}

/**
 * Returns points awarded for destroying an enemy at given level.
 */
export function getPointsForKill(level) {
  return POINTS_PER_WORD_BY_LEVEL[Math.min(level, POINTS_PER_WORD_BY_LEVEL.length - 1)];
}

/**
 * Returns a random word for given level (not in excluded set).
 */
export function getRandomWord(level, excluded = new Set()) {
  const pool = WORDS_BY_LEVEL[Math.min(level, WORDS_BY_LEVEL.length - 1)];
  const available = pool.filter(w => !excluded.has(w));
  if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Finds the enemy that should be targeted by the typed prefix.
 * Priority: currently targeted enemy first, then first enemy matching prefix.
 * Returns index or -1.
 */
export function findTarget(enemies, typedPrefix, currentTargetIdx) {
  if (!typedPrefix) return -1;
  const prefix = typedPrefix.toUpperCase();
  // Check current target first
  if (
    currentTargetIdx >= 0 &&
    currentTargetIdx < enemies.length &&
    enemies[currentTargetIdx] &&
    enemies[currentTargetIdx].word.startsWith(prefix)
  ) {
    return currentTargetIdx;
  }
  // Find first matching enemy
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i] && enemies[i].word.startsWith(prefix)) {
      return i;
    }
  }
  return -1;
}

/**
 * Creates an enemy object.
 */
export function createEnemy(word, x, canvasWidth, speed) {
  return {
    word,
    typed: '',   // how much has been correctly typed
    x: x ?? Math.random() * (canvasWidth - 120) + 60,
    y: -40,
    speed,
    alive: true,
    exploding: false,
    explodeFrame: 0,
  };
}

/**
 * Processes a typed character against the targeted enemy.
 * Returns: { hit, destroyed, miss }
 */
export function processTypedChar(enemies, targetIdx, char) {
  if (targetIdx < 0 || targetIdx >= enemies.length || !enemies[targetIdx]) {
    return { hit: false, destroyed: false, miss: true };
  }
  const enemy = enemies[targetIdx];
  const expected = enemy.word[enemy.typed.length];
  if (!expected) return { hit: false, destroyed: false, miss: true };

  if (char.toUpperCase() === expected.toUpperCase()) {
    enemy.typed += expected;
    if (enemy.typed.length === enemy.word.length) {
      enemy.alive = false;
      enemy.exploding = true;
      return { hit: true, destroyed: true, miss: false };
    }
    return { hit: true, destroyed: false, miss: false };
  } else {
    // Wrong character — reset typed progress
    enemy.typed = '';
    return { hit: false, destroyed: false, miss: true };
  }
}

/**
 * Updates enemy positions. Returns list of enemies that reached the bottom (y > limit).
 */
export function updateEnemies(enemies, canvasHeight) {
  const escaped = [];
  for (const enemy of enemies) {
    if (!enemy.alive && !enemy.exploding) continue;
    if (enemy.exploding) {
      enemy.explodeFrame++;
      continue;
    }
    enemy.y += enemy.speed;
    if (enemy.y >= canvasHeight) {
      escaped.push(enemy);
      enemy.alive = false;
    }
  }
  return escaped;
}

/**
 * Checks if it's time to spawn a new enemy.
 */
export function shouldSpawn(frameCount, level, activeEnemyCount) {
  const maxEnemies = MAX_ENEMIES_BY_LEVEL[Math.min(level, MAX_ENEMIES_BY_LEVEL.length - 1)];
  const interval = SPAWN_INTERVAL_BY_LEVEL[Math.min(level, SPAWN_INTERVAL_BY_LEVEL.length - 1)];
  if (activeEnemyCount >= maxEnemies) return false;
  return frameCount % interval === 0;
}
