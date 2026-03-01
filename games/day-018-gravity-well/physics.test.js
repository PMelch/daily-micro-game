import { describe, test, expect } from "bun:test";
const { computeGravity, stepSimulation, checkCollision, isOutOfBounds, clamp, G } = require("./physics.js");

describe("computeGravity", () => {
  test("returns zero force when at same position (singularity guard)", () => {
    const f = computeGravity([100, 100], [100, 100]);
    expect(f[0]).toBe(0);
    expect(f[1]).toBe(0);
  });

  test("attracts ball toward well on X axis", () => {
    // Well is to the right → force should be positive X
    const f = computeGravity([0, 0], [100, 0], 1);
    expect(f[0]).toBeGreaterThan(0);
    expect(f[1]).toBeCloseTo(0, 5);
  });

  test("repulsor (negative strength) pushes ball away", () => {
    const f = computeGravity([0, 0], [100, 0], -1);
    expect(f[0]).toBeLessThan(0);
  });

  test("force decreases with distance squared", () => {
    const f1 = computeGravity([0, 0], [10, 0], 1);
    const f2 = computeGravity([0, 0], [20, 0], 1);
    // At double distance, force should be ~1/4
    expect(f1[0] / f2[0]).toBeCloseTo(4, 0);
  });

  test("force magnitude equals G/dist^2", () => {
    const dist = 50;
    const f = computeGravity([0, 0], [dist, 0], 1);
    expect(f[0]).toBeCloseTo(G / (dist * dist), 5);
  });
});

describe("stepSimulation", () => {
  test("ball with no wells moves in straight line", () => {
    const ball = { pos: [0, 0], vel: [10, 0] };
    const result = stepSimulation(ball, [], 0.1);
    expect(result.pos[0]).toBeCloseTo(1.0, 5);
    expect(result.pos[1]).toBeCloseTo(0, 5);
    expect(result.vel[0]).toBeCloseTo(10, 5);
  });

  test("well accelerates ball toward it", () => {
    const ball = { pos: [0, 0], vel: [0, 0] };
    const wells = [{ pos: [1000, 0], strength: 1 }];
    const result = stepSimulation(ball, wells, 0.1);
    // ball should now have positive X velocity
    expect(result.vel[0]).toBeGreaterThan(0);
    expect(result.pos[0]).toBeGreaterThan(0);
  });

  test("multiple wells accumulate forces", () => {
    const ball = { pos: [500, 0], vel: [0, 0] };
    // Two wells pulling in opposite X directions equally, but one pulls down
    const wells = [
      { pos: [0, 0], strength: 1 },    // pulls left
      { pos: [1000, 0], strength: 1 },  // pulls right (equal distance)
      { pos: [500, 1000], strength: 1 } // pulls down
    ];
    const result = stepSimulation(ball, wells, 0.1);
    // X forces cancel, Y should be positive (downward)
    expect(Math.abs(result.vel[0])).toBeLessThan(0.01);
    expect(result.vel[1]).toBeGreaterThan(0);
  });
});

describe("checkCollision", () => {
  test("returns true when ball is within radius of target", () => {
    expect(checkCollision([100, 100], [110, 100], 20)).toBe(true);
  });

  test("returns false when ball is outside radius", () => {
    expect(checkCollision([100, 100], [200, 100], 20)).toBe(false);
  });

  test("returns true when exactly at edge of radius", () => {
    expect(checkCollision([0, 0], [20, 0], 20)).toBe(true);
  });
});

describe("isOutOfBounds", () => {
  test("returns false when inside canvas", () => {
    expect(isOutOfBounds([400, 300], 800, 600)).toBe(false);
  });

  test("returns true when too far left", () => {
    expect(isOutOfBounds([-50, 300], 800, 600)).toBe(true);
  });

  test("returns true when too far right", () => {
    expect(isOutOfBounds([850, 300], 800, 600)).toBe(true);
  });

  test("returns true when too far down", () => {
    expect(isOutOfBounds([400, 650], 800, 600)).toBe(true);
  });

  test("returns false within margin", () => {
    expect(isOutOfBounds([-10, 300], 800, 600)).toBe(false);
  });
});

describe("clamp", () => {
  test("clamps above max", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
  test("clamps below min", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });
  test("passes through value in range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});
