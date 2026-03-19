// game-logic.js — Orbit Snap core logic
// Satellites orbit concentric rings; catch them at the 12-o'clock catch zone.

// ── Constants ──────────────────────────────────────────────────────────────

export const RING_COUNT = 4;
export const CATCH_ZONE_HALF_DEG = 12; // ±12° around top = 24° window
export const TOP_ANGLE = -Math.PI / 2; // 12 o'clock = -90° in canvas coords

// ── Satellite angle ────────────────────────────────────────────────────────

/**
 * Compute the current angle (radians, 0 = right, counterclockwise positive)
 * of a satellite given its orbit speed (rad/ms) and elapsed time.
 *
 * @param {number} startAngle  Initial angle in radians
 * @param {number} speed       Radians per millisecond (positive = clockwise)
 * @param {number} elapsedMs   Elapsed time in milliseconds
 * @returns {number}           Current angle in radians [0, 2π)
 */
export function getSatelliteAngle(startAngle, speed, elapsedMs) {
  const raw = startAngle + speed * elapsedMs;
  // Normalize to [0, 2π)
  return ((raw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

// ── Catch zone ─────────────────────────────────────────────────────────────

/**
 * Determine if a satellite's current angle is within the catch zone.
 * Catch zone is at TOP_ANGLE (12 o'clock = 270° in standard coords = -π/2).
 *
 * @param {number} angle   Current satellite angle in radians [0, 2π)
 * @returns {boolean}
 */
export function isInCatchZone(angle) {
  const halfRad = (CATCH_ZONE_HALF_DEG * Math.PI) / 180;
  // Normalize TOP_ANGLE to [0, 2π)
  const topNorm = ((TOP_ANGLE % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  let diff = Math.abs(angle - topNorm);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  return diff <= halfRad;
}

// ── Catch detection ────────────────────────────────────────────────────────

/**
 * Check if a satellite can be caught right now.
 *
 * @param {object} satellite   { ring, startAngle, speed }
 * @param {number} playerRing  Current ring the player is on (0-indexed)
 * @param {number} elapsedMs   Elapsed time in milliseconds
 * @returns {boolean}
 */
export function canCatch(satellite, playerRing, elapsedMs) {
  if (satellite.ring !== playerRing) return false;
  const angle = getSatelliteAngle(satellite.startAngle, satellite.speed, elapsedMs);
  return isInCatchZone(angle);
}

// ── Scoring ────────────────────────────────────────────────────────────────

/**
 * Score for catching a satellite.
 *
 * @param {object} satellite  { type: 'normal'|'fast'|'bonus' }
 * @param {number} combo      Current combo count (consecutive catches)
 * @returns {number}          Points awarded
 */
export function scoreForCatch(satellite, combo) {
  const base = satellite.type === 'bonus' ? 30 : satellite.type === 'fast' ? 20 : 10;
  const multiplier = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;
  return base * multiplier;
}

// ── Level configuration ────────────────────────────────────────────────────

/**
 * Generate the satellite configuration for a given level.
 * Higher levels = faster satellites, more of them, closer spawn spacing.
 *
 * @param {number} level  Level number (1-based)
 * @returns {object[]}    Array of satellite descriptors
 */
export function generateLevel(level) {
  const satellites = [];
  const baseSpeed = 0.0003; // rad/ms at level 1
  const speedIncrease = 0.00005 * (level - 1);

  // One satellite per ring at level 1; add extras at higher levels
  for (let ring = 0; ring < RING_COUNT; ring++) {
    const count = ring < level - 1 ? 2 : 1; // extra satellite on lower rings at higher levels
    for (let i = 0; i < count; i++) {
      const speed = baseSpeed + speedIncrease + ring * 0.00004; // outer rings faster
      const type = Math.random() < 0.15 ? 'bonus' : Math.random() < 0.25 ? 'fast' : 'normal';
      const startAngle = (2 * Math.PI * i) / count + (ring * Math.PI) / 3; // spread evenly
      satellites.push({ ring, startAngle, speed, type, id: `r${ring}s${i}` });
    }
  }
  return satellites;
}

// ── Lives system ───────────────────────────────────────────────────────────

/**
 * Compute new lives after missing a satellite.
 *
 * @param {number} lives   Current lives
 * @returns {number}       Lives after penalty
 */
export function loseLife(lives) {
  return Math.max(0, lives - 1);
}

/**
 * Check if the game is over.
 *
 * @param {number} lives
 * @returns {boolean}
 */
export function isGameOver(lives) {
  return lives <= 0;
}

// ── Score formatting ───────────────────────────────────────────────────────

/**
 * Format a score integer as a string with leading zeros for display.
 *
 * @param {number} score
 * @returns {string}
 */
export function formatScore(score) {
  return String(Math.max(0, Math.floor(score))).padStart(6, '0');
}

// ── Satellite "miss" detection ─────────────────────────────────────────────

/**
 * Check if a satellite has just passed through the catch zone without being caught.
 * Returns true if the satellite crossed from inside to just outside (trailing edge).
 *
 * We track this by checking if the satellite's angle is just past the catch zone
 * (i.e., was in zone at t-1 but is now slightly past).
 *
 * @param {number} prevAngle  Angle at previous frame (radians)
 * @param {number} currAngle  Angle at current frame (radians)
 * @returns {boolean}
 */
export function crossedCatchZone(prevAngle, currAngle) {
  return isInCatchZone(prevAngle) && !isInCatchZone(currAngle);
}
