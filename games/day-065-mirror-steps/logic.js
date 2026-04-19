(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MirrorStepsLogic = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const HERO_VECTORS = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
  };

  const MIRROR_VECTORS = {
    left: { x: 1, y: 0 },
    right: { x: -1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
  };

  function keyOf(pos) {
    return `${pos.x},${pos.y}`;
  }

  function cloneLevel(level) {
    return {
      width: level.width,
      height: level.height,
      heroStart: { ...level.heroStart },
      mirrorStart: { ...level.mirrorStart },
      goals: level.goals.map((goal) => ({ ...goal })),
      walls: level.walls.map((wall) => ({ ...wall })),
      crystals: level.crystals.map((crystal) => ({ ...crystal })),
      par: level.par ?? 4,
    };
  }

  function createLevelState(level) {
    const normalized = cloneLevel(level);
    const state = {
      width: normalized.width,
      height: normalized.height,
      hero: { ...normalized.heroStart },
      mirror: { ...normalized.mirrorStart },
      goals: normalized.goals,
      walls: normalized.walls,
      crystals: normalized.crystals,
      collected: new Set(),
      moves: 0,
      par: normalized.par,
    };
    collectCrystals(state);
    return state;
  }

  function isBlocked(state, pos) {
    return pos.x < 0 || pos.y < 0 || pos.x >= state.width || pos.y >= state.height || state.walls.some((wall) => wall.x === pos.x && wall.y === pos.y);
  }

  function moveAvatar(state, pos, vector) {
    const target = { x: pos.x + vector.x, y: pos.y + vector.y };
    return isBlocked(state, target) ? { ...pos } : target;
  }

  function collectCrystals(state) {
    state.crystals.forEach((crystal) => {
      const crystalKey = keyOf(crystal);
      if (crystal.x === state.hero.x && crystal.y === state.hero.y) state.collected.add(crystalKey);
      if (crystal.x === state.mirror.x && crystal.y === state.mirror.y) state.collected.add(crystalKey);
    });
  }

  function applyMove(state, direction) {
    const next = {
      ...state,
      hero: moveAvatar(state, state.hero, HERO_VECTORS[direction]),
      mirror: moveAvatar(state, state.mirror, MIRROR_VECTORS[direction]),
      collected: new Set(state.collected),
      moves: state.moves + 1,
    };
    collectCrystals(next);
    return next;
  }

  function isLevelSolved(state) {
    const allCrystalsCollected = state.collected.size === state.crystals.length;
    const heroOnGoal = state.goals.some((goal) => goal.x === state.hero.x && goal.y === state.hero.y);
    const mirrorOnGoal = state.goals.some((goal) => goal.x === state.mirror.x && goal.y === state.mirror.y);
    return allCrystalsCollected && heroOnGoal && mirrorOnGoal;
  }

  function serializeBoard(state) {
    const rows = [];
    for (let y = 0; y < state.height; y += 1) {
      let row = '';
      for (let x = 0; x < state.width; x += 1) {
        const here = { x, y };
        if (state.hero.x === x && state.hero.y === y) row += 'H';
        else if (state.mirror.x === x && state.mirror.y === y) row += 'M';
        else if (state.crystals.some((c) => c.x === x && c.y === y)) row += 'C';
        else if (state.goals.some((g) => g.x === x && g.y === y)) row += 'G';
        else if (state.walls.some((w) => w.x === x && w.y === y)) row += 'W';
        else row += '.';
      }
      rows.push(row);
    }
    return rows.join('|');
  }

  function executeMoves(level, directions) {
    let state = createLevelState(level);
    for (const direction of directions) {
      state = applyMove(state, direction);
    }
    return state;
  }

  function scoreRun(level, directions) {
    const state = executeMoves(level, directions);
    const solved = isLevelSolved(state);
    const overshoot = Math.max(0, state.moves - (level.par ?? 4));
    const stars = !solved ? 0 : overshoot === 0 ? 3 : overshoot === 1 ? 2 : 1;
    return { state, solved, stars };
  }

  return {
    createLevelState,
    applyMove,
    isLevelSolved,
    serializeBoard,
    executeMoves,
    scoreRun,
  };
});
