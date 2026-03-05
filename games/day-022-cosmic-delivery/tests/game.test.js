import { describe, expect, it } from "bun:test";

export class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0; // 0 is pointing straight UP (we'll draw it that way, or let's say angle is in radians, 0 is right, -PI/2 is up)
    this.fuel = 100;
  }

  update(dt, thrusting, turnDir) { // turnDir: -1 left, 1 right, 0 none
    if (this.fuel <= 0) thrusting = false;

    // Rotation
    const turnSpeed = 3; // rad/s
    this.angle += turnDir * turnSpeed * dt;

    // Gravity
    const g = 50; 
    this.vy += g * dt;

    // Thrust
    if (thrusting && this.fuel > 0) {
      const thrustPower = 150;
      this.vx += Math.cos(this.angle) * thrustPower * dt;
      this.vy += Math.sin(this.angle) * thrustPower * dt;
      this.fuel -= 20 * dt;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}

describe("Ship physics", () => {
  it("falls due to gravity", () => {
    const ship = new Ship(100, 100);
    ship.update(1, false, 0); // 1 second
    expect(ship.vy).toBe(50);
    expect(ship.y).toBe(150); // 100 + 50
  });

  it("consumes fuel when thrusting", () => {
    const ship = new Ship(100, 100);
    ship.angle = -Math.PI / 2; // pointing up
    ship.update(1, true, 0);
    expect(ship.fuel).toBe(80);
    expect(ship.vy).toBe(50 - 150); // g - thrustPower = 50 - 150 = -100
  });
});
