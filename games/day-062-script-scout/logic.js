(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ScriptScoutLogic = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FORWARD = 'forward';
  const TURN_LEFT = 'left';
  const TURN_RIGHT = 'right';
  const WAIT = 'wait';
  const DIRECTIONS = ['N', 'E', 'S', 'W'];
  const DELTAS = {
    N: { x: 0, y: -1 },
    E: { x: 1, y: 0 },
    S: { x: 0, y: 1 },
    W: { x: -1, y: 0 },
  };

  function rotate(dir, step) {
    const index = DIRECTIONS.indexOf(dir);
    return DIRECTIONS[(index + step + DIRECTIONS.length) % DIRECTIONS.length];
  }

  function key(x, y) {
    return `${x},${y}`;
  }

  function executeProgram(level, commands) {
    const walls = new Set((level.walls || []).map(w => key(w.x, w.y)));
    const crystals = new Set((level.crystals || []).map(c => key(c.x, c.y)));
    const collected = new Set();
    const position = { ...level.start };
    const visited = [{ x: position.x, y: position.y }];
    let hitWall = false;
    let failedStep = null;

    commands.forEach((command, index) => {
      if (hitWall) return;
      if (command === TURN_LEFT) {
        position.dir = rotate(position.dir, -1);
        return;
      }
      if (command === TURN_RIGHT) {
        position.dir = rotate(position.dir, 1);
        return;
      }
      if (command === WAIT) {
        return;
      }
      if (command === FORWARD) {
        const delta = DELTAS[position.dir];
        const nx = position.x + delta.x;
        const ny = position.y + delta.y;
        const blocked = nx < 0 || ny < 0 || nx >= level.width || ny >= level.height || walls.has(key(nx, ny));
        if (blocked) {
          hitWall = true;
          failedStep = index + 1;
          return;
        }
        position.x = nx;
        position.y = ny;
        visited.push({ x: nx, y: ny });
        const crystalKey = key(nx, ny);
        if (crystals.has(crystalKey)) collected.add(crystalKey);
      }
    });

    return {
      position,
      visited,
      crystalsCollected: collected.size,
      totalCrystals: crystals.size,
      collectedKeys: [...collected],
      hitWall,
      failedStep,
    };
  }

  function isLevelComplete(level, result) {
    return !result.hitWall &&
      result.position.x === level.goal.x &&
      result.position.y === level.goal.y &&
      result.crystalsCollected === (level.crystals || []).length;
  }

  function createRunSummary(level, result, usedCommands) {
    const completed = isLevelComplete(level, result);
    let stars = 0;
    if (completed) {
      if (usedCommands <= level.par) stars = 3;
      else if (usedCommands <= level.par + 1) stars = 2;
      else stars = 1;
    }
    return { completed, stars, usedCommands, par: level.par, hitWall: result.hitWall };
  }

  return {
    FORWARD,
    TURN_LEFT,
    TURN_RIGHT,
    WAIT,
    executeProgram,
    isLevelComplete,
    createRunSummary,
  };
});
