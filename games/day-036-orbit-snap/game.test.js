// TDD Tests for Orbit Snap game logic
// Run with: bun test

import { describe, test, expect } from "bun:test";
import {
  getSatelliteAngle,
  isInCatchZone,
  canCatch,
  scoreForCatch,
  generateLevel,
  loseLife,
  isGameOver,
  formatScore,
  crossedCatchZone,
  RING_COUNT,
  CATCH_ZONE_HALF_DEG,
  TOP_ANGLE,
} from "./game-logic.js";

// ── getSatelliteAngle ───────────────────────────────────────────────────────

describe("getSatelliteAngle", () => {
  test("returns start angle at t=0", () => {
    const angle = getSatelliteAngle(0, 0.001, 0);
    expect(angle).toBeCloseTo(0);
  });

  test("advances by speed × time", () => {
    const angle = getSatelliteAngle(0, 0.001, 1000);
    // 0.001 rad/ms × 1000ms = 1 rad
    expect(angle).toBeCloseTo(1, 4);
  });

  test("wraps around at 2π", () => {
    // Start at 0, go one full revolution
    const angle = getSatelliteAngle(0, 0.001, (2 * Math.PI) / 0.001);
    expect(angle).toBeCloseTo(0, 3);
  });

  test("normalizes to [0, 2π)", () => {
    const angle = getSatelliteAngle(0, 0.01, 10000); // 100 rad
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(2 * Math.PI);
  });

  test("handles non-zero start angle", () => {
    const angle = getSatelliteAngle(Math.PI, 0.001, 1000);
    expect(angle).toBeCloseTo(Math.PI + 1, 3);
  });
});

// ── isInCatchZone ───────────────────────────────────────────────────────────

describe("isInCatchZone", () => {
  const topNorm = ((-Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI));

  test("top angle (12 o'clock) is in catch zone", () => {
    expect(isInCatchZone(topNorm)).toBe(true);
  });

  test("angle slightly off from top is still in zone", () => {
    const halfRad = (CATCH_ZONE_HALF_DEG * Math.PI) / 180;
    expect(isInCatchZone(topNorm + halfRad * 0.9)).toBe(true);
    expect(isInCatchZone(topNorm - halfRad * 0.9)).toBe(true);
  });

  test("angle just outside zone boundary is not in zone", () => {
    const halfRad = (CATCH_ZONE_HALF_DEG * Math.PI) / 180;
    expect(isInCatchZone(topNorm + halfRad * 1.1)).toBe(false);
  });

  test("angle at bottom (6 o'clock) is not in zone", () => {
    expect(isInCatchZone(Math.PI / 2)).toBe(false);
  });

  test("angle at 3 o'clock is not in zone", () => {
    expect(isInCatchZone(0)).toBe(false);
  });
});

// ── canCatch ───────────────────────────────────────────────────────────────

describe("canCatch", () => {
  test("returns true when satellite is on player's ring and in catch zone", () => {
    // Satellite on ring 2, starting at TOP_ANGLE normalized, speed 0 → stays at top
    const topNorm = ((-Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI));
    const satellite = { ring: 2, startAngle: topNorm, speed: 0 };
    expect(canCatch(satellite, 2, 0)).toBe(true);
  });

  test("returns false when player is on wrong ring", () => {
    const topNorm = ((-Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI));
    const satellite = { ring: 2, startAngle: topNorm, speed: 0 };
    expect(canCatch(satellite, 1, 0)).toBe(false);
    expect(canCatch(satellite, 3, 0)).toBe(false);
  });

  test("returns false when satellite not in catch zone", () => {
    // Satellite on ring 0, starting at 0 (3 o'clock), speed 0
    const satellite = { ring: 0, startAngle: 0, speed: 0 };
    expect(canCatch(satellite, 0, 0)).toBe(false);
  });

  test("returns true after satellite travels to catch zone", () => {
    // Satellite starts at 0 (3 o'clock), needs to travel to 3π/2 (12 o'clock)
    // topNorm ≈ 3π/2 ≈ 4.712
    const topNorm = ((-Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI));
    const startAngle = 0;
    const speed = 0.001;
    // Time to reach top: topNorm / speed
    const t = topNorm / speed;
    const satellite = { ring: 1, startAngle, speed };
    expect(canCatch(satellite, 1, t)).toBe(true);
  });
});

// ── scoreForCatch ──────────────────────────────────────────────────────────

describe("scoreForCatch", () => {
  test("normal satellite gives 10 points at combo 0", () => {
    expect(scoreForCatch({ type: 'normal' }, 0)).toBe(10);
  });

  test("fast satellite gives 20 points", () => {
    expect(scoreForCatch({ type: 'fast' }, 0)).toBe(20);
  });

  test("bonus satellite gives 30 points", () => {
    expect(scoreForCatch({ type: 'bonus' }, 0)).toBe(30);
  });

  test("combo ≥ 3 doubles the score", () => {
    expect(scoreForCatch({ type: 'normal' }, 3)).toBe(20);
    expect(scoreForCatch({ type: 'normal' }, 4)).toBe(20);
  });

  test("combo ≥ 5 triples the score", () => {
    expect(scoreForCatch({ type: 'normal' }, 5)).toBe(30);
    expect(scoreForCatch({ type: 'fast' }, 5)).toBe(60);
    expect(scoreForCatch({ type: 'bonus' }, 5)).toBe(90);
  });

  test("combo 2 gives no multiplier (x1)", () => {
    expect(scoreForCatch({ type: 'normal' }, 2)).toBe(10);
  });
});

// ── generateLevel ──────────────────────────────────────────────────────────

describe("generateLevel", () => {
  test("level 1 returns RING_COUNT satellites (one per ring)", () => {
    const sats = generateLevel(1);
    expect(sats.length).toBe(RING_COUNT);
  });

  test("all satellites have valid ring indices", () => {
    const sats = generateLevel(1);
    for (const s of sats) {
      expect(s.ring).toBeGreaterThanOrEqual(0);
      expect(s.ring).toBeLessThan(RING_COUNT);
    }
  });

  test("all satellites have positive speed", () => {
    for (let lvl = 1; lvl <= 5; lvl++) {
      const sats = generateLevel(lvl);
      for (const s of sats) {
        expect(s.speed).toBeGreaterThan(0);
      }
    }
  });

  test("higher levels generate more or equal satellites", () => {
    const l1 = generateLevel(1).length;
    const l3 = generateLevel(3).length;
    expect(l3).toBeGreaterThanOrEqual(l1);
  });

  test("each satellite has required fields", () => {
    const sats = generateLevel(2);
    for (const s of sats) {
      expect(typeof s.ring).toBe('number');
      expect(typeof s.startAngle).toBe('number');
      expect(typeof s.speed).toBe('number');
      expect(['normal', 'fast', 'bonus']).toContain(s.type);
      expect(typeof s.id).toBe('string');
    }
  });
});

// ── loseLife / isGameOver ──────────────────────────────────────────────────

describe("loseLife", () => {
  test("decrements by 1", () => {
    expect(loseLife(3)).toBe(2);
    expect(loseLife(1)).toBe(0);
  });

  test("never goes below 0", () => {
    expect(loseLife(0)).toBe(0);
  });
});

describe("isGameOver", () => {
  test("true when lives <= 0", () => {
    expect(isGameOver(0)).toBe(true);
    expect(isGameOver(-1)).toBe(true);
  });

  test("false when lives > 0", () => {
    expect(isGameOver(1)).toBe(false);
    expect(isGameOver(3)).toBe(false);
  });
});

// ── formatScore ────────────────────────────────────────────────────────────

describe("formatScore", () => {
  test("pads with leading zeros to 6 digits", () => {
    expect(formatScore(0)).toBe('000000');
    expect(formatScore(42)).toBe('000042');
    expect(formatScore(123456)).toBe('123456');
  });

  test("handles large scores without truncation", () => {
    expect(formatScore(9999999)).toBe('9999999');
  });

  test("floors decimal values", () => {
    expect(formatScore(42.9)).toBe('000042');
  });
});

// ── crossedCatchZone ───────────────────────────────────────────────────────

describe("crossedCatchZone", () => {
  const topNorm = ((-Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI));
  const halfRad = (CATCH_ZONE_HALF_DEG * Math.PI) / 180;

  test("returns true when satellite just exited catch zone", () => {
    const prev = topNorm + halfRad * 0.5; // inside zone
    const curr = topNorm + halfRad * 1.5; // outside zone
    expect(crossedCatchZone(prev, curr)).toBe(true);
  });

  test("returns false when satellite is still inside zone", () => {
    const prev = topNorm + halfRad * 0.3;
    const curr = topNorm + halfRad * 0.6;
    expect(crossedCatchZone(prev, curr)).toBe(false);
  });

  test("returns false when satellite was already outside zone", () => {
    const prev = topNorm + halfRad * 2;
    const curr = topNorm + halfRad * 3;
    expect(crossedCatchZone(prev, curr)).toBe(false);
  });
});
