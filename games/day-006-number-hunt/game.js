// Game logic module for Number Hunt
export function createGame(gridSize = 5) {
  const total = gridSize * gridSize;
  const numbers = [];
  
  // Generate shuffled positions
  const positions = [];
  for (let i = 0; i < total; i++) {
    positions.push({ row: Math.floor(i / gridSize), col: i % gridSize });
  }
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  for (let i = 0; i < total; i++) {
    numbers.push({
      value: i + 1,
      row: positions[i].row,
      col: positions[i].col,
      found: false
    });
  }

  return {
    gridSize,
    total,
    numbers,
    nextTarget: 1,
    startTime: null,
    endTime: null,
    mistakes: 0,
    finished: false
  };
}

export function tapNumber(game, value) {
  if (game.finished) return { ok: false, reason: 'finished' };
  
  if (game.startTime === null) {
    game.startTime = Date.now();
  }
  
  if (value === game.nextTarget) {
    const cell = game.numbers.find(n => n.value === value);
    cell.found = true;
    game.nextTarget++;
    
    if (game.nextTarget > game.total) {
      game.finished = true;
      game.endTime = Date.now();
      return { ok: true, finished: true, time: game.endTime - game.startTime };
    }
    return { ok: true, finished: false };
  } else {
    game.mistakes++;
    return { ok: false, reason: 'wrong', expected: game.nextTarget, got: value };
  }
}

export function getElapsed(game) {
  if (!game.startTime) return 0;
  if (game.endTime) return game.endTime - game.startTime;
  return Date.now() - game.startTime;
}
