import { describe, test, expect } from 'bun:test';
import {
  clampBumper,
  simulateShot,
  createMatch,
  nextPlayerIndex,
  awardTurn,
  SAMPLE_LAYOUT
} from './game.js';

describe('Bounce Budget logic', () => {
  test('clampBumper keeps bumper inside arena bounds', () => {
    expect(clampBumper({ x: -20, y: 999, angle: 22 })).toEqual({ x: 20, y: 580, angle: 22 });
  });

  test('shot collects stars and exits with deterministic score', () => {
    const result = simulateShot(SAMPLE_LAYOUT, [{ x: 200, y: 300, angle: 45 }], { x: 0, y: -6 });
    expect(result.path.length).toBeGreaterThan(10);
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.collected.length).toBeGreaterThanOrEqual(1);
    expect(result.outcome).toMatch(/wall|timeout|sink|clear/);
  });

  test('match rotates active player and stores turn score', () => {
    const match = createMatch(['Ada', 'Bob', 'Caro']);
    expect(match.activePlayer).toBe(0);
    awardTurn(match, 10, ['star-1']);
    expect(match.players[0].score).toBe(10);
    match.activePlayer = nextPlayerIndex(match);
    expect(match.activePlayer).toBe(1);
  });
});
