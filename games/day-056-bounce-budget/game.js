// @ts-check

export const SAMPLE_LAYOUT = {
  width: 400,
  height: 600,
  stars: [
    { x: 100, y: 100, radius: 15 },
    { x: 300, y: 200, radius: 15 },
    { x: 200, y: 400, radius: 15 }
  ],
  start: { x: 200, y: 550 },
  bumperRadius: 20
};

export function clampBumper(bumper) {
  const r = SAMPLE_LAYOUT.bumperRadius;
  let x = Math.max(r, Math.min(SAMPLE_LAYOUT.width - r, bumper.x));
  let y = Math.max(r, Math.min(SAMPLE_LAYOUT.height - r, bumper.y));
  return { x, y, angle: bumper.angle };
}

function circleIntersect(c1, c2) {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  return Math.sqrt(dx*dx + dy*dy) <= (c1.radius + c2.radius);
}

export function simulateShot(layout, bumpers, launchVelocity) {
  const r = 8; // ball radius
  let x = layout.start.x;
  let y = layout.start.y;
  let vx = launchVelocity.x;
  let vy = launchVelocity.y;
  
  const path = [{ x, y }];
  const collected = [];
  let score = 0;
  let outcome = 'timeout';
  
  let remainingStars = layout.stars.map((s, i) => ({ ...s, id: `star-${i}` }));
  
  for (let step = 0; step < 1000; step++) {
    x += vx;
    y += vy;
    
    // Bounds check
    if (x < r || x > layout.width - r) {
      vx = -vx;
      x = Math.max(r, Math.min(layout.width - r, x));
    }
    if (y < r) {
      vy = -vy;
      y = Math.max(r, Math.min(layout.height - r, y));
    }
    if (y > layout.height + 50) {
      outcome = 'sink';
      break;
    }
    
    // Check bumpers
    for (const b of bumpers) {
      // Treat bumper as a static circle for now for simplicity
      const dist = Math.sqrt((x - b.x)**2 + (y - b.y)**2);
      if (dist < r + layout.bumperRadius) {
        // Reflect velocity vector around normal
        const nx = (x - b.x) / dist;
        const ny = (y - b.y) / dist;
        const dot = vx * nx + vy * ny;
        if (dot < 0) {
          vx = vx - 2 * dot * nx;
          vy = vy - 2 * dot * ny;
          // small speed boost
          vx *= 1.05;
          vy *= 1.05;
        }
      }
    }
    
    // Check stars
    for (let i = remainingStars.length - 1; i >= 0; i--) {
      const s = remainingStars[i];
      if (circleIntersect({ x, y, radius: r }, s)) {
        collected.push(s.id);
        score += 10;
        remainingStars.splice(i, 1);
      }
    }
    
    if (step % 3 === 0) path.push({ x, y });
    
    if (remainingStars.length === 0) {
      outcome = 'clear';
      break;
    }
  }
  
  path.push({ x, y });
  return { path, collected, score, outcome };
}

export function createMatch(playerNames) {
  return {
    players: playerNames.map(name => ({ name, score: 0 })),
    activePlayer: 0,
    round: 1
  };
}

export function awardTurn(match, score, collectedIds) {
  match.players[match.activePlayer].score += score;
}

export function nextPlayerIndex(match) {
  return (match.activePlayer + 1) % match.players.length;
}
