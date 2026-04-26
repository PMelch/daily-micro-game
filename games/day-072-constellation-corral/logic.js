export const LEVELS = [
  {
    id: 1,
    budget: 700,
    pegs: [
      { id: 'a', x: 90, y: 90 },
      { id: 'b', x: 250, y: 90 },
      { id: 'c', x: 320, y: 180 },
      { id: 'd', x: 250, y: 250 },
      { id: 'e', x: 90, y: 250 },
      { id: 'f', x: 20, y: 180 },
    ],
    stars: [
      { x: 150, y: 145 },
      { x: 195, y: 205 },
    ],
    hazards: [{ x: 318, y: 62 }],
  },
  {
    id: 2,
    budget: 760,
    pegs: [
      { id: 'a', x: 70, y: 80 },
      { id: 'b', x: 190, y: 70 },
      { id: 'c', x: 290, y: 110 },
      { id: 'd', x: 300, y: 235 },
      { id: 'e', x: 205, y: 300 },
      { id: 'f', x: 95, y: 280 },
      { id: 'g', x: 40, y: 180 },
    ],
    stars: [
      { x: 120, y: 150 },
      { x: 145, y: 215 },
    ],
    hazards: [{ x: 236, y: 185 }],
  },
  {
    id: 3,
    budget: 500,
    pegs: [
      { id: 'a', x: 120, y: 120 },
      { id: 'b', x: 220, y: 120 },
      { id: 'c', x: 320, y: 170 },
      { id: 'd', x: 220, y: 240 },
      { id: 'e', x: 120, y: 240 },
      { id: 'f', x: 20, y: 170 },
    ],
    stars: [
      { x: 155, y: 160 },
      { x: 185, y: 210 },
    ],
    hazards: [],
  },
  {
    id: 4,
    budget: 860,
    pegs: [
      { id: 'a', x: 60, y: 85 },
      { id: 'b', x: 170, y: 55 },
      { id: 'c', x: 290, y: 85 },
      { id: 'd', x: 315, y: 205 },
      { id: 'e', x: 255, y: 305 },
      { id: 'f', x: 135, y: 320 },
      { id: 'g', x: 35, y: 235 },
      { id: 'h', x: 35, y: 145 },
    ],
    stars: [
      { x: 135, y: 140 },
      { x: 205, y: 145 },
      { x: 165, y: 245 },
    ],
    hazards: [
      { x: 265, y: 180 },
      { x: 250, y: 255 },
    ],
  },
  {
    id: 5,
    budget: 900,
    pegs: [
      { id: 'a', x: 75, y: 70 },
      { id: 'b', x: 185, y: 50 },
      { id: 'c', x: 300, y: 85 },
      { id: 'd', x: 315, y: 180 },
      { id: 'e', x: 270, y: 300 },
      { id: 'f', x: 155, y: 330 },
      { id: 'g', x: 45, y: 270 },
      { id: 'h', x: 25, y: 155 },
    ],
    stars: [
      { x: 110, y: 150 },
      { x: 165, y: 105 },
      { x: 205, y: 215 },
      { x: 160, y: 270 },
    ],
    hazards: [
      { x: 258, y: 128 },
      { x: 255, y: 245 },
    ],
  },
];

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getRopeLength(points) {
  if (points.length < 2) return 0;
  let total = 0;
  for (let index = 0; index < points.length; index += 1) {
    const nextIndex = (index + 1) % points.length;
    total += distance(points[index], points[nextIndex]);
  }
  return Math.round(total);
}

function orientation(a, b, c) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function onSegment(a, b, c) {
  return (
    Math.min(a.x, c.x) <= b.x && b.x <= Math.max(a.x, c.x) &&
    Math.min(a.y, c.y) <= b.y && b.y <= Math.max(a.y, c.y)
  );
}

function segmentsIntersect(p1, q1, p2, q2) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if ((o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0)) {
    return true;
  }

  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

export function isSelfIntersecting(points) {
  if (points.length < 4) return false;
  for (let index = 0; index < points.length; index += 1) {
    const nextIndex = (index + 1) % points.length;
    for (let compareIndex = index + 1; compareIndex < points.length; compareIndex += 1) {
      const compareNext = (compareIndex + 1) % points.length;
      const sharesVertex =
        index === compareIndex ||
        index === compareNext ||
        nextIndex === compareIndex ||
        nextIndex === compareNext;
      const isFirstAndLast = index === 0 && compareNext === 0;
      if (sharesVertex || isFirstAndLast) continue;
      if (segmentsIntersect(points[index], points[nextIndex], points[compareIndex], points[compareNext])) {
        return true;
      }
    }
  }
  return false;
}

export function pointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const xi = polygon[index].x;
    const yi = polygon[index].y;
    const xj = polygon[previous].x;
    const yj = polygon[previous].y;

    const intersects = ((yi > point.y) !== (yj > point.y))
      && point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-9) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function getPolygon(level, pegIds) {
  const pegMap = new Map(level.pegs.map((peg) => [peg.id, peg]));
  return pegIds.map((id) => {
    const peg = pegMap.get(id);
    if (!peg) {
      throw new Error(`Unknown peg id: ${id}`);
    }
    return peg;
  });
}

export function evaluateLoop(level, pegIds) {
  if (pegIds.length < 3) {
    return {
      success: false,
      capturedStars: 0,
      capturedHazards: 0,
      ropeUsed: 0,
      missingStars: level.stars.length,
      failureReason: 'too-short',
      polygon: [],
    };
  }

  const polygon = getPolygon(level, pegIds);
  if (isSelfIntersecting(polygon)) {
    return {
      success: false,
      capturedStars: 0,
      capturedHazards: 0,
      ropeUsed: getRopeLength(polygon),
      missingStars: level.stars.length,
      failureReason: 'self-intersection',
      polygon,
    };
  }

  const ropeUsed = getRopeLength(polygon);
  const capturedStars = level.stars.filter((star) => pointInPolygon(star, polygon)).length;
  const capturedHazards = level.hazards.filter((hazard) => pointInPolygon(hazard, polygon)).length;
  const missingStars = level.stars.length - capturedStars;

  let failureReason = '';
  if (capturedHazards > 0) {
    failureReason = 'hazard';
  } else if (missingStars > 0) {
    failureReason = 'missing';
  } else if (ropeUsed > level.budget) {
    failureReason = 'budget';
  }

  return {
    success: failureReason === '',
    capturedStars,
    capturedHazards,
    ropeUsed,
    missingStars,
    failureReason,
    polygon,
  };
}
