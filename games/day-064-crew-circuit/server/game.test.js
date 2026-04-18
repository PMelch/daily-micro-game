/**
 * [TESTABILITY ANALYSIS]
 * - Unit tests cover pure multiplayer game logic in a separate module.
 * - Inputs: room creation, player joins, role assignment, movement, scan/stun effects, win state.
 * - Outputs: room state transitions, drone position, revealed cells, disabled sentries, and completion state.
 * - Mocks: none needed for pure logic.
 */
import { describe, it, expect } from 'bun:test';
import {
  createRoomState,
  addPlayer,
  assignRoles,
  startMatch,
  applyAction,
  serializePublicState,
} from './game-logic.js';

describe('crew circuit logic', () => {
  it('creates a lobby room and stores players', () => {
    const room = createRoomState('ABCD');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    expect(room.code).toBe('ABCD');
    expect(room.phase).toBe('lobby');
    expect(room.players.map(p => p.name)).toEqual(['Ada', 'Ben']);
  });

  it('assigns unique core roles before repeating optional ones', () => {
    const roles2 = assignRoles(['p1', 'p2']);
    expect(new Set(Object.values(roles2)).size).toBe(2);
    const roles6 = assignRoles(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    expect(Object.values(roles6)).toEqual(['up', 'right', 'down', 'left', 'scan', 'stun']);
  });

  it('starts a match with the first level and seeded revealed area', () => {
    const room = createRoomState('TEST');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room);
    expect(room.phase).toBe('playing');
    expect(room.levelIndex).toBe(0);
    expect(room.drone.x).toBeGreaterThanOrEqual(0);
    expect(room.revealed.size).toBeGreaterThan(0);
  });

  it('moves the drone only when the matching role acts', () => {
    const room = createRoomState('MOVE');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room);
    const before = { ...room.drone };
    const rightPlayer = room.players.find(p => p.role === 'right');
    applyAction(room, rightPlayer.id, 'right');
    expect(room.drone.x).toBe(before.x + 1);
    expect(room.drone.y).toBe(before.y);
  });

  it('ignores actions from players without the matching role', () => {
    const room = createRoomState('NOPE');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room);
    const before = { ...room.drone };
    const wrongPlayer = room.players.find(p => p.role !== 'right');
    applyAction(room, wrongPlayer.id, 'right');
    expect(room.drone).toEqual(before);
  });

  it('scan reveals nearby fog cells', () => {
    const room = createRoomState('SCAN');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    addPlayer(room, { id: 'p3', name: 'Cid' });
    addPlayer(room, { id: 'p4', name: 'Dee' });
    addPlayer(room, { id: 'p5', name: 'Eli' });
    startMatch(room);
    const scanner = room.players.find(p => p.role === 'scan');
    const before = room.revealed.size;
    applyAction(room, scanner.id, 'scan');
    expect(room.revealed.size).toBeGreaterThan(before);
  });

  it('stun disables adjacent sentry for a few ticks', () => {
    const room = createRoomState('STUN');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    addPlayer(room, { id: 'p3', name: 'Cid' });
    addPlayer(room, { id: 'p4', name: 'Dee' });
    addPlayer(room, { id: 'p5', name: 'Eli' });
    addPlayer(room, { id: 'p6', name: 'Flo' });
    startMatch(room);
    room.sentries = [{ x: room.drone.x + 1, y: room.drone.y, disabledTicks: 0 }];
    const stunPlayer = room.players.find(p => p.role === 'stun');
    applyAction(room, stunPlayer.id, 'stun');
    expect(room.sentries[0].disabledTicks).toBeGreaterThan(0);
  });

  it('completes a level when all charge nodes are collected and exit reached', () => {
    const room = createRoomState('WIN');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room);
    room.cores.clear();
    room.exit = { x: room.drone.x + 1, y: room.drone.y };
    const result = applyAction(room, room.players.find(p => p.role === 'right').id, 'right');
    expect(result.levelComplete).toBe(true);
  });

  it('public state hides unrevealed floor tiles for clients', () => {
    const room = createRoomState('FOG');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room);
    const state = serializePublicState(room);
    expect(state.grid.some(row => row.includes('?'))).toBe(true);
  });
});
