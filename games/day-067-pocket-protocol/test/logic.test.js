const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createLevelState,
  runCommand,
  simulateProgram,
  facingVector,
} = require('../logic.js');

test('forward moves the bot in its facing direction unless blocked by a wall', () => {
  const state = createLevelState({
    width: 5,
    height: 5,
    start: { x: 1, y: 2 },
    facing: 'right',
    exit: { x: 4, y: 2 },
    walls: [{ x: 3, y: 2 }],
    dataNodes: [],
    sentries: [],
  });

  const once = runCommand(state, 'forward');
  assert.deepEqual(once.bot, { x: 2, y: 2 });

  const twice = runCommand(once, 'forward');
  assert.deepEqual(twice.bot, { x: 2, y: 2 });
});

test('turn commands rotate the bot without moving it', () => {
  const state = createLevelState({
    width: 4,
    height: 4,
    start: { x: 1, y: 1 },
    facing: 'up',
    exit: { x: 3, y: 3 },
    walls: [],
    dataNodes: [],
    sentries: [],
  });

  const left = runCommand(state, 'left');
  assert.equal(left.facing, 'left');
  assert.deepEqual(left.bot, { x: 1, y: 1 });

  const right = runCommand(left, 'right');
  assert.equal(right.facing, 'up');
});

test('dash travels until just before a wall and collects data nodes on the path', () => {
  const state = createLevelState({
    width: 6,
    height: 4,
    start: { x: 0, y: 1 },
    facing: 'right',
    exit: { x: 5, y: 1 },
    walls: [{ x: 4, y: 1 }],
    dataNodes: [{ x: 2, y: 1 }],
    sentries: [],
  });

  const next = runCommand(state, 'dash');
  assert.deepEqual(next.bot, { x: 3, y: 1 });
  assert.equal(next.collected.size, 1);
});

test('simulateProgram fails when a sentry path collides with the bot after a tick', () => {
  const result = simulateProgram({
    width: 5,
    height: 5,
    start: { x: 1, y: 2 },
    facing: 'right',
    exit: { x: 4, y: 2 },
    walls: [],
    dataNodes: [],
    sentries: [
      { path: [{ x: 3, y: 2 }, { x: 2, y: 2 }] },
    ],
  }, ['forward']);

  assert.equal(result.status, 'caught');
  assert.equal(result.reason, 'sentry');
});

test('simulateProgram succeeds only after collecting all data and reaching the exit', () => {
  const result = simulateProgram({
    width: 5,
    height: 5,
    start: { x: 0, y: 0 },
    facing: 'right',
    exit: { x: 2, y: 2 },
    walls: [],
    dataNodes: [{ x: 2, y: 0 }],
    sentries: [],
  }, ['forward', 'forward', 'right', 'forward', 'forward'], 5);

  assert.equal(result.status, 'success');
  assert.deepEqual(result.final.bot, { x: 2, y: 2 });
  assert.equal(result.final.collected.size, 1);
});

test('facingVector returns stable vectors for every direction', () => {
  assert.deepEqual(facingVector('up'), { x: 0, y: -1 });
  assert.deepEqual(facingVector('right'), { x: 1, y: 0 });
  assert.deepEqual(facingVector('down'), { x: 0, y: 1 });
  assert.deepEqual(facingVector('left'), { x: -1, y: 0 });
});
