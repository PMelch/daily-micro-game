import { describe, test, expect } from 'bun:test';
import {
  getLevelFromScore,
  getEnemySpeed,
  getPointsForKill,
  getRandomWord,
  findTarget,
  createEnemy,
  processTypedChar,
  updateEnemies,
  shouldSpawn,
  BASE_SPEED,
  SPEED_PER_LEVEL,
  LEVEL_THRESHOLDS,
  WORDS_BY_LEVEL,
} from './game-logic.js';

// ─── getLevelFromScore ────────────────────────────────────────────────────────
describe('getLevelFromScore', () => {
  test('score 0 → level 0', () => {
    expect(getLevelFromScore(0)).toBe(0);
  });
  test('score 4 → level 0', () => {
    expect(getLevelFromScore(4)).toBe(0);
  });
  test('score 5 → level 1', () => {
    expect(getLevelFromScore(5)).toBe(1);
  });
  test('score 12 → level 2', () => {
    expect(getLevelFromScore(12)).toBe(2);
  });
  test('score 22 → level 3', () => {
    expect(getLevelFromScore(22)).toBe(3);
  });
  test('score 100 → level 3 (max)', () => {
    expect(getLevelFromScore(100)).toBe(3);
  });
});

// ─── getEnemySpeed ────────────────────────────────────────────────────────────
describe('getEnemySpeed', () => {
  test('level 0 → base speed', () => {
    expect(getEnemySpeed(0)).toBeCloseTo(BASE_SPEED);
  });
  test('speed increases per level', () => {
    expect(getEnemySpeed(1)).toBeCloseTo(BASE_SPEED + SPEED_PER_LEVEL);
    expect(getEnemySpeed(2)).toBeCloseTo(BASE_SPEED + 2 * SPEED_PER_LEVEL);
  });
});

// ─── getPointsForKill ────────────────────────────────────────────────────────
describe('getPointsForKill', () => {
  test('level 0 → 1 point', () => expect(getPointsForKill(0)).toBe(1));
  test('level 1 → 2 points', () => expect(getPointsForKill(1)).toBe(2));
  test('level 2 → 3 points', () => expect(getPointsForKill(2)).toBe(3));
  test('level 3 → 5 points', () => expect(getPointsForKill(3)).toBe(5));
  test('level beyond max → 5 points', () => expect(getPointsForKill(99)).toBe(5));
});

// ─── getRandomWord ────────────────────────────────────────────────────────────
describe('getRandomWord', () => {
  test('returns a string', () => {
    const word = getRandomWord(0);
    expect(typeof word).toBe('string');
    expect(word.length).toBeGreaterThan(0);
  });
  test('returns word from correct level pool', () => {
    for (let lvl = 0; lvl < 4; lvl++) {
      const word = getRandomWord(lvl);
      // May be from ANY level if exclusion set is empty, but let's check it's in the pool
      expect(WORDS_BY_LEVEL[lvl]).toContain(word);
    }
  });
  test('avoids excluded words when possible', () => {
    const level = 0;
    const pool = WORDS_BY_LEVEL[0];
    // Exclude all but one
    const keepWord = pool[0];
    const excluded = new Set(pool.slice(1));
    const word = getRandomWord(level, excluded);
    expect(word).toBe(keepWord);
  });
  test('level beyond max uses max pool', () => {
    const word = getRandomWord(99);
    expect(WORDS_BY_LEVEL[WORDS_BY_LEVEL.length - 1]).toContain(word);
  });
});

// ─── findTarget ───────────────────────────────────────────────────────────────
describe('findTarget', () => {
  const makeEnemies = (words) => words.map(w => ({ word: w, typed: '', alive: true }));

  test('returns -1 for empty prefix', () => {
    const enemies = makeEnemies(['STAR', 'MOON']);
    expect(findTarget(enemies, '', -1)).toBe(-1);
  });
  test('finds first enemy matching prefix', () => {
    const enemies = makeEnemies(['STAR', 'MOON']);
    expect(findTarget(enemies, 'M', -1)).toBe(1);
  });
  test('prefers current target if still matching', () => {
    const enemies = makeEnemies(['STAR', 'SUN']);
    // Both start with S, current target is index 1
    expect(findTarget(enemies, 'S', 1)).toBe(1);
  });
  test('switches if current target no longer matches', () => {
    const enemies = makeEnemies(['STAR', 'SUN']);
    // Target idx 1 (SUN) but prefix is 'ST'
    expect(findTarget(enemies, 'ST', 1)).toBe(0);
  });
  test('returns -1 when no match', () => {
    const enemies = makeEnemies(['STAR', 'MOON']);
    expect(findTarget(enemies, 'Z', -1)).toBe(-1);
  });
});

// ─── createEnemy ─────────────────────────────────────────────────────────────
describe('createEnemy', () => {
  test('creates enemy with correct properties', () => {
    const e = createEnemy('NOVA', 100, 400, 0.2);
    expect(e.word).toBe('NOVA');
    expect(e.typed).toBe('');
    expect(e.x).toBe(100);
    expect(e.y).toBe(-40);
    expect(e.speed).toBe(0.2);
    expect(e.alive).toBe(true);
    expect(e.exploding).toBe(false);
  });
});

// ─── processTypedChar ────────────────────────────────────────────────────────
describe('processTypedChar', () => {
  test('returns miss for invalid target index', () => {
    const result = processTypedChar([], -1, 'A');
    expect(result).toEqual({ hit: false, destroyed: false, miss: true });
  });
  test('correct first char → hit, not destroyed', () => {
    const enemies = [createEnemy('STAR', 100, 400, 0.2)];
    const result = processTypedChar(enemies, 0, 'S');
    expect(result).toEqual({ hit: true, destroyed: false, miss: false });
    expect(enemies[0].typed).toBe('S');
  });
  test('wrong char → miss, resets typed', () => {
    const enemies = [createEnemy('STAR', 100, 400, 0.2)];
    enemies[0].typed = 'ST';
    const result = processTypedChar(enemies, 0, 'X');
    expect(result).toEqual({ hit: false, destroyed: false, miss: true });
    expect(enemies[0].typed).toBe('');
  });
  test('typing full word → destroyed', () => {
    const enemies = [createEnemy('GO', 100, 400, 0.2)];
    processTypedChar(enemies, 0, 'G');
    const result = processTypedChar(enemies, 0, 'O');
    expect(result).toEqual({ hit: true, destroyed: true, miss: false });
    expect(enemies[0].alive).toBe(false);
    expect(enemies[0].exploding).toBe(true);
  });
  test('case insensitive — lowercase accepted', () => {
    const enemies = [createEnemy('STAR', 100, 400, 0.2)];
    const result = processTypedChar(enemies, 0, 's');
    expect(result.hit).toBe(true);
    expect(enemies[0].typed).toBe('S');
  });
});

// ─── updateEnemies ───────────────────────────────────────────────────────────
describe('updateEnemies', () => {
  test('enemies move downward', () => {
    const e = createEnemy('STAR', 100, 400, 1.0);
    e.y = 100;
    updateEnemies([e], 600);
    expect(e.y).toBe(101);
  });
  test('returns enemies that escaped (y > canvasHeight)', () => {
    const e = createEnemy('STAR', 100, 400, 1.0);
    e.y = 599;
    const escaped = updateEnemies([e], 600);
    expect(escaped).toHaveLength(1);
    expect(escaped[0].word).toBe('STAR');
    expect(e.alive).toBe(false);
  });
  test('dead non-exploding enemies are skipped', () => {
    const e = createEnemy('STAR', 100, 400, 1.0);
    e.alive = false;
    e.exploding = false;
    e.y = 50;
    updateEnemies([e], 600);
    expect(e.y).toBe(50); // unchanged
  });
  test('exploding enemies increment explodeFrame', () => {
    const e = createEnemy('STAR', 100, 400, 1.0);
    e.alive = false;
    e.exploding = true;
    e.explodeFrame = 3;
    updateEnemies([e], 600);
    expect(e.explodeFrame).toBe(4);
  });
});

// ─── shouldSpawn ─────────────────────────────────────────────────────────────
describe('shouldSpawn', () => {
  test('does not spawn if at max enemies', () => {
    expect(shouldSpawn(0, 0, 2)).toBe(false);  // max at level 0 is 2
  });
  test('spawns at frame 0 when below max', () => {
    expect(shouldSpawn(0, 0, 0)).toBe(true);
  });
  test('does not spawn on non-interval frames', () => {
    // Interval for level 0 is 220
    expect(shouldSpawn(1, 0, 0)).toBe(false);
    expect(shouldSpawn(219, 0, 0)).toBe(false);
  });
  test('spawns on interval frame', () => {
    expect(shouldSpawn(220, 0, 0)).toBe(true);
  });
  test('higher level — shorter interval', () => {
    // Level 3 interval is 90
    expect(shouldSpawn(90, 3, 0)).toBe(true);
    expect(shouldSpawn(90, 0, 0)).toBe(false);
  });
});
