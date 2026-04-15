(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BankShotLogic = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const WIDTH = 320;
  const HEIGHT = 420;
  const START = { x: 160, y: 386 };
  const GEM_RADIUS = 12;
  const BUMPER_RADIUS = 18;
  const PUCK_RADIUS = 10;

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createBoard(seed) {
    const rng = mulberry32(seed);
    const gems = [];
    const bumpers = [];

    const gemRows = [110, 160, 220];
    for (let row = 0; row < gemRows.length; row++) {
      const y = gemRows[row];
      for (let col = 0; col < 2; col++) {
        const x = 90 + col * 140 + Math.round((rng() - 0.5) * 26);
        gems.push({
          id: `g-${row}-${col}`,
          x,
          y: y + Math.round((rng() - 0.5) * 18),
          r: GEM_RADIUS,
          value: row === 0 ? 5 : row === 1 ? 3 : 2,
        });
      }
    }

    const bumperBase = [
      { x: 95, y: 145 },
      { x: 225, y: 145 },
      { x: 125, y: 255 },
      { x: 195, y: 255 },
    ];
    bumperBase.forEach((base, index) => {
      bumpers.push({
        id: `b-${index}`,
        x: base.x + Math.round((rng() - 0.5) * 16),
        y: base.y + Math.round((rng() - 0.5) * 16),
        r: BUMPER_RADIUS,
      });
    });

    return { width: WIDTH, height: HEIGHT, start: { ...START }, gems, bumpers };
  }

  function clampAim(target) {
    return {
      x: Math.max(30, Math.min(WIDTH - 30, target.x)),
      y: Math.max(40, Math.min(HEIGHT - 120, target.y)),
    };
  }

  function simulateShot(board, target) {
    const aim = clampAim(target);
    let dx = aim.x - board.start.x;
    let dy = aim.y - board.start.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = 7.2;
    let vx = (dx / len) * speed;
    let vy = (dy / len) * speed;
    let x = board.start.x;
    let y = board.start.y;
    const collected = [];
    let score = 0;
    let bankShots = 0;
    const remaining = board.gems.map(g => ({ ...g }));
    const trail = [];

    for (let step = 0; step < 380; step++) {
      x += vx;
      y += vy;

      if (x <= PUCK_RADIUS || x >= board.width - PUCK_RADIUS) {
        x = Math.max(PUCK_RADIUS, Math.min(board.width - PUCK_RADIUS, x));
        vx *= -1;
        bankShots += 1;
      }
      if (y <= PUCK_RADIUS || y >= board.height - PUCK_RADIUS) {
        y = Math.max(PUCK_RADIUS, Math.min(board.height - PUCK_RADIUS, y));
        vy *= -1;
        bankShots += 1;
      }

      for (const bumper of board.bumpers) {
        const dist = Math.hypot(x - bumper.x, y - bumper.y);
        const minDist = bumper.r + PUCK_RADIUS;
        if (dist > 0 && dist < minDist) {
          const nx = (x - bumper.x) / dist;
          const ny = (y - bumper.y) / dist;
          const dot = vx * nx + vy * ny;
          vx -= 2 * dot * nx;
          vy -= 2 * dot * ny;
          x = bumper.x + nx * minDist;
          y = bumper.y + ny * minDist;
        }
      }

      for (let i = remaining.length - 1; i >= 0; i--) {
        const gem = remaining[i];
        if (Math.hypot(x - gem.x, y - gem.y) <= gem.r + PUCK_RADIUS) {
          score += gem.value;
          collected.push(gem.id);
          remaining.splice(i, 1);
        }
      }

      trail.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
      vx *= 0.992;
      vy *= 0.992;
      if (Math.hypot(vx, vy) < 0.45) break;
    }

    score += Math.min(3, Math.floor(bankShots / 2));
    return { score, bankShots, collected, final: { x, y }, trail };
  }

  function createMatchState(playerNames, rounds) {
    return {
      players: playerNames.map(name => ({ name, score: 0, shots: [] })),
      currentPlayerIndex: 0,
      round: 1,
      rounds,
      gameOver: false,
    };
  }

  function applyTurnResult(state, shotScore) {
    const next = JSON.parse(JSON.stringify(state));
    const player = next.players[next.currentPlayerIndex];
    player.score += shotScore;
    player.shots.push(shotScore);

    const wasLastPlayer = next.currentPlayerIndex === next.players.length - 1;
    const wasLastRound = next.round === next.rounds;

    if (wasLastPlayer && wasLastRound) {
      next.gameOver = true;
      return next;
    }

    if (wasLastPlayer) {
      next.currentPlayerIndex = 0;
      next.round += 1;
    } else {
      next.currentPlayerIndex += 1;
    }
    return next;
  }

  return {
    WIDTH,
    HEIGHT,
    START,
    createBoard,
    simulateShot,
    createMatchState,
    applyTurnResult,
  };
});
