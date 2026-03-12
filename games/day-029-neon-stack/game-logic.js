/**
 * Neon Stack - Core Game Logic (Pure Functions)
 * Day 029 - Single Player
 */

/**
 * Calculates the horizontal overlap between the current (moving) platform
 * and the previously placed platform.
 *
 * @param {{x: number, width: number}} current - moving platform
 * @param {{x: number, width: number}} previous - last placed platform
 * @returns {{overlapX: number, overlapWidth: number}}
 */
export function calculateOverlap(current, previous) {
  const overlapLeft = Math.max(current.x, previous.x);
  const overlapRight = Math.min(current.x + current.width, previous.x + previous.width);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  return { overlapX: overlapLeft, overlapWidth };
}

/**
 * Determines if a drop is "perfect" — current platform is within
 * `threshold` pixels of the previous platform on both edges.
 *
 * @param {{x: number, width: number}} current
 * @param {{x: number, width: number}} previous
 * @param {number} [threshold=2]
 * @returns {boolean}
 */
export function isPerfectDrop(current, previous, threshold = 2) {
  const leftDiff = Math.abs(current.x - previous.x);
  const rightDiff = Math.abs((current.x + current.width) - (previous.x + previous.width));
  return leftDiff < threshold && rightDiff < threshold;
}

/**
 * Calculates the moving platform speed for a given level.
 * Starts at 2.5 and increases by 0.18 per level, capped at 7.
 *
 * @param {number} level - 0-indexed current level
 * @param {number} [baseSpeed=2.5]
 * @param {number} [increment=0.18]
 * @param {number} [maxSpeed=7]
 * @returns {number}
 */
export function getNextSpeed(level, baseSpeed = 2.5, increment = 0.18, maxSpeed = 7) {
  return Math.min(baseSpeed + level * increment, maxSpeed);
}

/**
 * Computes score for a single successful drop.
 * - Normal drop: 10 points
 * - Perfect drop: 15 points
 * - Perfect drop with streak >= 3: 20 points (streak bonus)
 *
 * @param {boolean} perfect - was the drop perfect?
 * @param {number} streak - current perfect streak count (before this drop)
 * @returns {number}
 */
export function computeScore(perfect, streak) {
  if (!perfect) return 10;
  if (streak >= 3) return 20;
  return 15;
}

/**
 * Calculates the screen Y coordinate of a placed platform.
 * The moving platform (at currentLevel) is always at activeY.
 * Each lower level is pushed down by platformH pixels.
 *
 * @param {number} platformLevel - the level index of the platform
 * @param {number} currentLevel - the current level (moving platform level)
 * @param {number} activeY - screen Y of the moving platform
 * @param {number} platformH - height of each platform in pixels
 * @returns {number}
 */
export function getPlatformScreenY(platformLevel, currentLevel, activeY, platformH) {
  return activeY + (currentLevel - platformLevel) * platformH;
}

/**
 * Checks and possibly reverses the moving platform direction
 * if it would go off screen (with some overhang allowed).
 * Returns a new moving object (does NOT mutate the original).
 *
 * @param {{x: number, width: number, direction: number, speed: number}} moving
 * @param {number} canvasWidth
 * @returns {{direction: number}}
 */
export function clampMoving(moving, canvasWidth) {
  let direction = moving.direction;

  // Reverse when the platform crosses the canvas boundary
  if (moving.x + moving.width > canvasWidth && direction === 1) {
    direction = -1;
  } else if (moving.x < 0 && direction === -1) {
    direction = 1;
  }

  return { ...moving, direction };
}
