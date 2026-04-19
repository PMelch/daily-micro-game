const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createLevelState,
  applyMove,
  isLevelSolved,
  serializeBoard,
} = require('../logic.js');

test('applyMove moves hero and mirror in opposite directions', () => {
  const state = createLevelState({
    width: 5,
    height: 5,
    heroStart: { x: 1, y: 2 },
    mirrorStart: { x: 3, y: 2 },
    goals: [{ x: 0, y: 2 }, { x: 4, y: 2 }],
    walls: [],
    crystals: [],
  });

  const next = applyMove(state, 'left');
  assert.deepEqual(next.hero, { x: 0, y: 2 });
  assert.deepEqual(next.mirror, { x: 4, y: 2 });
  assert.equal(next.moves, 1);
});

test('walls block each avatar independently', () => {
  const state = createLevelState({
    width: 5,
    height: 5,
    heroStart: { x: 1, y: 2 },
    mirrorStart: { x: 3, y: 2 },
    goals: [{ x: 1, y: 2 }, { x: 4, y: 2 }],
    walls: [{ x: 4, y: 2 }],
    crystals: [],
  });

  const next = applyMove(state, 'left');
  assert.deepEqual(next.hero, { x: 0, y: 2 });
  assert.deepEqual(next.mirror, { x: 3, y: 2 });
});

test('crystals are collected by either avatar and level solves only when both goals and all crystals are done', () => {
  let state = createLevelState({
    width: 5,
    height: 5,
    heroStart: { x: 1, y: 1 },
    mirrorStart: { x: 3, y: 1 },
    goals: [{ x: 1, y: 0 }, { x: 3, y: 0 }],
    walls: [],
    crystals: [{ x: 1, y: 0 }, { x: 3, y: 0 }],
  });

  state = applyMove(state, 'up');
  assert.equal(state.collected.size, 2);
  assert.equal(isLevelSolved(state), true);
});

test('serializeBoard returns stable compact snapshot for regression coverage', () => {
  const state = createLevelState({
    width: 4,
    height: 3,
    heroStart: { x: 0, y: 0 },
    mirrorStart: { x: 3, y: 2 },
    goals: [{ x: 1, y: 0 }, { x: 2, y: 2 }],
    walls: [{ x: 1, y: 1 }],
    crystals: [{ x: 2, y: 0 }],
  });

  assert.equal(
    serializeBoard(state),
    'HGC.|.W..|..GM'
  );
});
