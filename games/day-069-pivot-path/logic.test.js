const { test, expect } = require('bun:test');
const { createLevelState, rotateCell, applyTurn, LEVELS, scoreLevel } = require('./logic.js');

test('rotateCell rotates unlocked tiles clockwise and leaves locked tiles alone', () => {
  const state = createLevelState(LEVELS[1]);
  expect(state.grid[0][0].dir).toBe('right');
  expect(rotateCell(state, { x: 0, y: 0 })).toBe(true);
  expect(state.grid[0][0].dir).toBe('down');

  const lockedBefore = state.grid[1][0].dir;
  expect(rotateCell(state, { x: 0, y: 1 })).toBe(false);
  expect(state.grid[1][0].dir).toBe(lockedBefore);
});

test('applyTurn advances the parcel and collects stamps', () => {
  let state = createLevelState(LEVELS[0]);
  state = applyTurn(state, { type: 'skip' });
  expect(state.parcel).toEqual({ x: 1, y: 0 });
  expect([...state.collected]).toContain('1,0');
  expect(state.steps).toBe(1);
});

test('level 1 authored route reaches the depot and awards stars', () => {
  let state = createLevelState(LEVELS[0]);
  for (let i = 0; i < 6; i += 1) {
    state = applyTurn(state, { type: 'skip' });
  }
  expect(state.status).toBe('success');
  expect(state.parcel).toEqual({ x: 3, y: 3 });
  expect(state.collected.size).toBe(2);
  expect(scoreLevel(state).stars).toBe(1);
});

test('level 2 authored route succeeds after a late pivot', () => {
  let state = createLevelState(LEVELS[1]);
  const script = [
    { type: 'skip' },
    { type: 'skip' },
    { type: 'skip' },
    { type: 'skip' },
    { type: 'rotate', point: { x: 2, y: 1 } },
    { type: 'skip' },
  ];
  for (const action of script) state = applyTurn(state, action);
  expect(state.status).toBe('success');
  expect(state.collected.size).toBe(2);
});

test('level 3 authored route succeeds with two live reroutes', () => {
  let state = createLevelState(LEVELS[2]);
  const script = [
    { type: 'skip' },
    { type: 'skip' },
    { type: 'rotate', point: { x: 2, y: 2 } },
    { type: 'rotate', point: { x: 2, y: 2 } },
    { type: 'skip' },
    { type: 'skip' },
    { type: 'skip' },
  ];
  for (const action of script) state = applyTurn(state, action);
  expect(state.status).toBe('success');
  expect(state.collected.size).toBe(3);
});

test('parcel crashes when routed off the board', () => {
  const state = createLevelState({
    id: 99,
    nameKey: 'test',
    width: 1,
    height: 1,
    start: { x: 0, y: 0 },
    exit: { x: 0, y: 0 },
    par: 1,
    stamps: [],
    grid: [[{ dir: 'right', locked: true }]],
  });
  const next = applyTurn(state, { type: 'skip' });
  expect(next.status).toBe('crash');
});
