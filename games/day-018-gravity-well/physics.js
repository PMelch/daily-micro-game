/**
 * Gravity Well Physics Engine
 * Pure functions — no DOM dependencies, fully testable.
 */

const G = 2000;

function computeGravity(ballPos, wellPos, strength = 1) {
  const dx = wellPos[0] - ballPos[0];
  const dy = wellPos[1] - ballPos[1];
  const distSq = dx * dx + dy * dy;
  if (distSq < 1) return [0, 0];
  const dist = Math.sqrt(distSq);
  const forceMag = (G * strength) / distSq;
  return [forceMag * dx / dist, forceMag * dy / dist];
}

function stepSimulation(ball, wells, dt) {
  let ax = 0, ay = 0;
  for (const well of wells) {
    const [fx, fy] = computeGravity(ball.pos, well.pos, well.strength);
    ax += fx;
    ay += fy;
  }
  const newVel = [ball.vel[0] + ax * dt, ball.vel[1] + ay * dt];
  const newPos = [ball.pos[0] + newVel[0] * dt, ball.pos[1] + newVel[1] * dt];
  return { pos: newPos, vel: newVel };
}

function checkCollision(ballPos, targetPos, radius = 20) {
  const dx = ballPos[0] - targetPos[0];
  const dy = ballPos[1] - targetPos[1];
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

function isOutOfBounds(ballPos, width, height, margin = 20) {
  return (
    ballPos[0] < -margin ||
    ballPos[0] > width + margin ||
    ballPos[1] < -margin ||
    ballPos[1] > height + margin
  );
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

if (typeof module !== 'undefined') {
  module.exports = { computeGravity, stepSimulation, checkCollision, isOutOfBounds, clamp, G };
}
