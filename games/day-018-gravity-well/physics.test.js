const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { computeGravity, stepSimulation, checkCollision, isOutOfBounds, clamp, G } = require("./physics.js");

function closeTo(actual, expected, delta = 0.001) {
  assert.ok(Math.abs(actual - expected) < delta, `Expected ${actual} to be close to ${expected}`);
}

describe("computeGravity", () => {
  test("returns zero force at same position", () => {
    const f = computeGravity([100, 100], [100, 100]);
    assert.equal(f[0], 0);
    assert.equal(f[1], 0);
  });

  test("attracts ball toward well on X axis", () => {
    const f = computeGravity([0, 0], [100, 0], 1);
    assert.ok(f[0] > 0);
    closeTo(f[1], 0);
  });

  test("repulsor pushes ball away", () => {
    const f = computeGravity([0, 0], [100, 0], -1);
    assert.ok(f[0] < 0);
  });

  test("force decreases with distance squared", () => {
    const f1 = computeGravity([0, 0], [10, 0], 1);
    const f2 = computeGravity([0, 0], [20, 0], 1);
    closeTo(f1[0] / f2[0], 4, 0.5);
  });

  test("force magnitude equals G/dist^2", () => {
    const dist = 50;
    const f = computeGravity([0, 0], [dist, 0], 1);
    closeTo(f[0], G / (dist * dist));
  });
});

describe("stepSimulation", () => {
  test("ball with no wells moves straight", () => {
    const ball = { pos: [0, 0], vel: [10, 0] };
    const result = stepSimulation(ball, [], 0.1);
    closeTo(result.pos[0], 1.0);
    closeTo(result.pos[1], 0);
    closeTo(result.vel[0], 10);
  });

  test("well accelerates ball toward it", () => {
    const ball = { pos: [0, 0], vel: [0, 0] };
    const wells = [{ pos: [1000, 0], strength: 1 }];
    const result = stepSimulation(ball, wells, 0.1);
    assert.ok(result.vel[0] > 0);
    assert.ok(result.pos[0] > 0);
  });

  test("multiple wells accumulate forces", () => {
    const ball = { pos: [500, 0], vel: [0, 0] };
    const wells = [
      { pos: [0, 0], strength: 1 },
      { pos: [1000, 0], strength: 1 },
      { pos: [500, 1000], strength: 1 }
    ];
    const result = stepSimulation(ball, wells, 0.1);
    assert.ok(Math.abs(result.vel[0]) < 0.01);
    assert.ok(result.vel[1] > 0);
  });
});

describe("checkCollision", () => {
  test("true within radius", () => assert.equal(checkCollision([100, 100], [110, 100], 20), true));
  test("false outside radius", () => assert.equal(checkCollision([100, 100], [200, 100], 20), false));
  test("true at edge", () => assert.equal(checkCollision([0, 0], [20, 0], 20), true));
});

describe("isOutOfBounds", () => {
  test("false inside", () => assert.equal(isOutOfBounds([400, 300], 800, 600), false));
  test("true far left", () => assert.equal(isOutOfBounds([-50, 300], 800, 600), true));
  test("true far right", () => assert.equal(isOutOfBounds([850, 300], 800, 600), true));
  test("false within margin", () => assert.equal(isOutOfBounds([-10, 300], 800, 600), false));
});

describe("clamp", () => {
  test("above max", () => assert.equal(clamp(150, 0, 100), 100));
  test("below min", () => assert.equal(clamp(-5, 0, 100), 0));
  test("in range", () => assert.equal(clamp(50, 0, 100), 50));
});
