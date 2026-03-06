import { describe, expect, it } from "bun:test";

// ---- Ship model (mirrors game.js physics) ----

export class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2; // pointing up
    this.fuel = 100;
  }

  update(dt, thrusting, turnDir) {
    if (this.fuel <= 0) thrusting = false;
    const turnSpeed = 3;
    this.angle += turnDir * turnSpeed * dt;
    const g = 40;
    this.vy += g * dt;
    if (thrusting && this.fuel > 0) {
      const thrustPower = 120;
      this.vx += Math.cos(this.angle) * thrustPower * dt;
      this.vy += Math.sin(this.angle) * thrustPower * dt;
      this.fuel -= 20 * dt;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.fuel = 100;
  }
}

// ---- Level definitions (mirrors game.js) ----

const LEVELS = [
  { shipX: 50, shipY: 50, padX: 380, padY: 600, padW: 80, padH: 20, obstacles: [{x:0, y:300, w:250, h:30}] },
  { shipX: 50, shipY: 50, padX: 50, padY: 600, padW: 60, padH: 20, obstacles: [{x:0, y:200, w:350, h:30}, {x:150, y:400, w:350, h:30}] },
  { shipX: 430, shipY: 50, padX: 200, padY: 600, padW: 50, padH: 20, obstacles: [{x:100, y:150, w:380, h:30}, {x:0, y:300, w:300, h:30}, {x:100, y:450, w:380, h:30}] },
  { shipX: 50, shipY: 50, padX: 380, padY: 100, padW: 50, padH: 20, obstacles: [{x:150, y:0, w:50, h:400}, {x:300, y:200, w:50, h:440}] }
];

// ---- Collision detection (mirrors game.js) ----

function rectIntersect(r1, r2) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function checkCollisions(ship, levelIndex) {
  const lvl = LEVELS[levelIndex];
  if (ship.y + 10 >= lvl.padY && ship.y <= lvl.padY + lvl.padH) {
    if (ship.x >= lvl.padX && ship.x <= lvl.padX + lvl.padW) {
      const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
      const angleDeg = ((ship.angle + Math.PI * 2) % (Math.PI * 2)) * 180 / Math.PI;
      const upright = (angleDeg > 250 && angleDeg < 290);
      if (speed < 40 && upright) return 'LANDED';
      else return 'CRASH_PAD';
    }
  }
  if (ship.x < 0 || ship.x > 480 || ship.y < 0 || ship.y > 640) return 'CRASH_BOUNDS';
  const shipRect = { left: ship.x - 10, right: ship.x + 10, top: ship.y - 10, bottom: ship.y + 10 };
  for (let obs of lvl.obstacles) {
    const obsRect = { left: obs.x, right: obs.x + obs.w, top: obs.y, bottom: obs.y + obs.h };
    if (rectIntersect(shipRect, obsRect)) return 'CRASH_OBS';
  }
  return 'NONE';
}

// ---- Game state machine (mirrors game.js logic) ----

class GameStateMachine {
  constructor() {
    this.currentLevel = 0;
    this.state = 'START';
    this.ship = new Ship(50, 50);
    this.overlayVisible = false;
    this.overlayTitle = '';
    this.overlayButton = '';
  }

  initLevel() {
    const lvl = LEVELS[this.currentLevel];
    this.ship.reset(lvl.shipX, lvl.shipY);
    this.state = 'PLAYING';
    this.overlayVisible = false;
  }

  onCrash() {
    this.state = 'GAMEOVER';
    this.overlayVisible = true;
    this.overlayTitle = 'CRASHED!';
    this.overlayButton = 'Try Again';
  }

  onLanded() {
    this.state = 'SUCCESS';
    this.currentLevel++;
    if (this.currentLevel >= LEVELS.length) {
      this.state = 'WIN';
      this.overlayVisible = true;
      this.overlayTitle = 'YOU WIN!';
      this.overlayButton = 'Try Again';
    } else {
      this.overlayVisible = true;
      this.overlayTitle = 'LANDED!';
      this.overlayButton = 'Next Level';
    }
  }

  onButtonClick() {
    if (this.state === 'WIN') this.currentLevel = 0;
    this.initLevel();
  }
}

// ---- Tests ----

describe("Ship physics", () => {
  it("falls due to gravity", () => {
    const ship = new Ship(100, 100);
    ship.update(1, false, 0);
    expect(ship.vy).toBe(40);
    expect(ship.y).toBe(140);
  });

  it("consumes fuel when thrusting", () => {
    const ship = new Ship(100, 100);
    ship.update(1, true, 0);
    expect(ship.fuel).toBe(80);
  });

  it("stops thrusting when fuel is empty", () => {
    const ship = new Ship(100, 100);
    ship.fuel = 0;
    const vyBefore = ship.vy;
    ship.update(1, true, 0);
    // Should only have gravity, no thrust
    expect(ship.vy).toBe(40); // only gravity
    expect(ship.fuel).toBe(0);
  });

  it("rotates when turn direction is given", () => {
    const ship = new Ship(100, 100);
    const angleBefore = ship.angle;
    ship.update(1, false, 1); // turn right
    expect(ship.angle).toBeGreaterThan(angleBefore);
  });
});

describe("Ship reset", () => {
  it("resets position, velocity, angle, and fuel", () => {
    const ship = new Ship(100, 100);
    // Mess up all values
    ship.x = 999;
    ship.y = 999;
    ship.vx = 50;
    ship.vy = 50;
    ship.angle = Math.PI;
    ship.fuel = 10;

    ship.reset(200, 300);
    expect(ship.x).toBe(200);
    expect(ship.y).toBe(300);
    expect(ship.vx).toBe(0);
    expect(ship.vy).toBe(0);
    expect(ship.angle).toBe(-Math.PI / 2);
    expect(ship.fuel).toBe(100);
  });
});

describe("Collision detection", () => {
  it("detects out-of-bounds crash", () => {
    const ship = new Ship(-20, 100);
    expect(checkCollisions(ship, 0)).toBe('CRASH_BOUNDS');
  });

  it("detects obstacle crash", () => {
    // Level 0 obstacle: {x:0, y:300, w:250, h:30}
    const ship = new Ship(100, 310);
    expect(checkCollisions(ship, 0)).toBe('CRASH_OBS');
  });

  it("detects safe landing on pad", () => {
    // Level 0 pad: x:380, y:600, w:80
    const ship = new Ship(400, 600);
    ship.vx = 0;
    ship.vy = 5; // slow
    ship.angle = -Math.PI / 2; // pointing up (270 degrees)
    expect(checkCollisions(ship, 0)).toBe('LANDED');
  });

  it("detects pad crash when too fast", () => {
    const ship = new Ship(400, 600);
    ship.vx = 0;
    ship.vy = 100; // too fast
    ship.angle = -Math.PI / 2;
    expect(checkCollisions(ship, 0)).toBe('CRASH_PAD');
  });

  it("returns NONE when no collision", () => {
    const ship = new Ship(400, 100);
    expect(checkCollisions(ship, 0)).toBe('NONE');
  });
});

describe("Retry after crash", () => {
  it("shows overlay with retry button after crash", () => {
    const game = new GameStateMachine();
    game.initLevel();
    expect(game.state).toBe('PLAYING');
    expect(game.overlayVisible).toBe(false);

    game.onCrash();
    expect(game.state).toBe('GAMEOVER');
    expect(game.overlayVisible).toBe(true);
    expect(game.overlayTitle).toBe('CRASHED!');
    expect(game.overlayButton).toBe('Try Again');
  });

  it("resets ship position and fuel on retry", () => {
    const game = new GameStateMachine();
    game.initLevel();

    // Simulate playing and moving
    game.ship.x = 300;
    game.ship.y = 400;
    game.ship.fuel = 20;
    game.ship.vx = 50;
    game.ship.vy = 80;

    game.onCrash();
    game.onButtonClick(); // retry

    const lvl = LEVELS[0];
    expect(game.state).toBe('PLAYING');
    expect(game.ship.x).toBe(lvl.shipX);
    expect(game.ship.y).toBe(lvl.shipY);
    expect(game.ship.fuel).toBe(100);
    expect(game.ship.vx).toBe(0);
    expect(game.ship.vy).toBe(0);
    expect(game.overlayVisible).toBe(false);
  });

  it("stays on same level after retry", () => {
    const game = new GameStateMachine();
    game.currentLevel = 2;
    game.initLevel();
    game.onCrash();
    game.onButtonClick();
    expect(game.currentLevel).toBe(2);
  });
});

describe("Next level after success", () => {
  it("shows overlay with next level button after landing", () => {
    const game = new GameStateMachine();
    game.initLevel();
    game.onLanded();
    expect(game.state).toBe('SUCCESS');
    expect(game.overlayVisible).toBe(true);
    expect(game.overlayTitle).toBe('LANDED!');
    expect(game.overlayButton).toBe('Next Level');
    expect(game.currentLevel).toBe(1);
  });

  it("resets ship position to new level start on next level", () => {
    const game = new GameStateMachine();
    game.initLevel();
    // Move ship around
    game.ship.x = 400;
    game.ship.y = 600;
    game.ship.fuel = 30;
    game.ship.vx = -20;
    game.ship.vy = 10;

    game.onLanded(); // currentLevel becomes 1
    game.onButtonClick(); // initLevel for level 1

    const lvl1 = LEVELS[1];
    expect(game.currentLevel).toBe(1);
    expect(game.state).toBe('PLAYING');
    expect(game.ship.x).toBe(lvl1.shipX);
    expect(game.ship.y).toBe(lvl1.shipY);
    expect(game.ship.fuel).toBe(100);
    expect(game.ship.vx).toBe(0);
    expect(game.ship.vy).toBe(0);
    expect(game.overlayVisible).toBe(false);
  });

  it("resets fuel to 100 on each new level", () => {
    const game = new GameStateMachine();
    for (let i = 0; i < LEVELS.length - 1; i++) {
      game.initLevel();
      game.ship.fuel = 5; // drain fuel
      game.onLanded();
      game.onButtonClick();
      expect(game.ship.fuel).toBe(100);
    }
  });

  it("shows win screen after all levels complete", () => {
    const game = new GameStateMachine();
    for (let i = 0; i < LEVELS.length; i++) {
      game.initLevel();
      game.onLanded();
    }
    expect(game.state).toBe('WIN');
    expect(game.overlayTitle).toBe('YOU WIN!');
  });

  it("resets to level 0 when retrying after win", () => {
    const game = new GameStateMachine();
    for (let i = 0; i < LEVELS.length; i++) {
      game.initLevel();
      game.onLanded();
    }
    expect(game.state).toBe('WIN');
    game.onButtonClick();
    expect(game.currentLevel).toBe(0);
    expect(game.state).toBe('PLAYING');
    expect(game.ship.x).toBe(LEVELS[0].shipX);
  });
});
