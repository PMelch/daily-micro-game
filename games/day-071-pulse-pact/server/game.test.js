/**
 * [TESTABILITY ANALYSIS]
 * - Unit tests cover pure room state, lane assignment, chart generation, timing windows, and miss resolution.
 * - Inputs: room creation, player join order, match start timestamp, simulated hit timestamps, and server ticks.
 * - Outputs: assigned lanes, generated notes, score/combo changes, energy loss, and end-state transitions.
 * - Mocks: none needed; all timing is injected as numbers.
 */
import { describe, it, expect } from 'bun:test';
import {
  createRoomState,
  addPlayer,
  assignLaneGroups,
  startMatch,
  scoreHit,
  processHit,
  advanceRoom,
  serializePublicState,
  MAX_LANES,
  HIT_WINDOWS,
} from './game-logic.js';

describe('pulse pact logic', () => {
  it('assigns all six lanes evenly across 2 players', () => {
    const groups = assignLaneGroups(['a', 'b']);
    expect(groups.a).toEqual([0, 2, 4]);
    expect(groups.b).toEqual([1, 3, 5]);
  });

  it('assigns every lane exactly once across up to 6 players', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const groups = assignLaneGroups(ids);
    const covered = Object.values(groups).flat().sort((x, y) => x - y);
    expect(covered).toEqual([0, 1, 2, 3, 4, 5]);
    expect(Object.values(groups).every((lanes) => lanes.length === 1)).toBe(true);
  });

  it('starts a countdown match with lanes, chart, and future start time', () => {
    const room = createRoomState('ABCD');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room, 1_000);

    expect(room.phase).toBe('countdown');
    expect(room.startAt).toBeGreaterThan(1_000);
    expect(room.chart.length).toBeGreaterThan(12);
    expect(room.chart.every((note) => note.lane >= 0 && note.lane < MAX_LANES)).toBe(true);
    expect(room.players.every((player) => player.lanes.length > 0)).toBe(true);
  });

  it('scores perfect, good, ok, and miss windows correctly', () => {
    expect(scoreHit(0)).toEqual({ label: 'perfect', points: 100 });
    expect(scoreHit(HIT_WINDOWS.perfect + 1).label).toBe('good');
    expect(scoreHit(HIT_WINDOWS.good + 1).label).toBe('ok');
    expect(scoreHit(HIT_WINDOWS.ok + 1).label).toBe('miss');
  });

  it('awards score and combo for a valid hit on an assigned lane', () => {
    const room = createRoomState('HIT1');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room, 5_000);
    room.phase = 'playing';
    room.startAt = 5_000;
    room.chart = [{ id: 'n1', lane: room.players[0].lanes[0], time: 1_000, hit: false, missed: false }];

    const result = processHit(room, 'p1', room.players[0].lanes[0], 6_020);

    expect(result.ok).toBe(true);
    expect(result.judgement).toBe('perfect');
    expect(room.score).toBe(100);
    expect(room.combo).toBe(1);
    expect(room.chart[0].hit).toBe(true);
  });

  it('rejects hits on lanes the player does not own', () => {
    const room = createRoomState('HIT2');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room, 5_000);
    room.phase = 'playing';
    room.startAt = 5_000;
    const forbiddenLane = room.players[1].lanes[0];
    room.chart = [{ id: 'n1', lane: forbiddenLane, time: 6_000, hit: false, missed: false }];

    const result = processHit(room, 'p1', forbiddenLane, 6_000);

    expect(result.ok).toBe(false);
    expect(room.score).toBe(0);
    expect(room.combo).toBe(0);
    expect(room.chart[0].hit).toBe(false);
  });

  it('marks overdue notes as missed, breaks combo, and drains energy', () => {
    const room = createRoomState('MISS');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room, 0);
    room.phase = 'playing';
    room.startAt = 0;
    room.chart = [{ id: 'n1', lane: 0, time: 1_000, hit: false, missed: false }];
    room.combo = 4;
    room.energy = 3;

    advanceRoom(room, 1_000 + HIT_WINDOWS.ok + 10);

    expect(room.chart[0].missed).toBe(true);
    expect(room.combo).toBe(0);
    expect(room.energy).toBe(2);
  });

  it('ends in victory when every note is resolved and energy remains', () => {
    const room = createRoomState('WIN!');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room, 0);
    room.phase = 'playing';
    room.startAt = 0;
    room.energy = 2;
    room.chart = [
      { id: 'n1', lane: 0, time: 100, hit: true, missed: false },
      { id: 'n2', lane: 1, time: 200, hit: false, missed: true },
    ];

    advanceRoom(room, 1_000);

    expect(room.phase).toBe('ended');
    expect(room.result).toBe('victory');
  });

  it('public state exposes player lanes, shared score, and visible note status', () => {
    const room = createRoomState('PUB1');
    addPlayer(room, { id: 'p1', name: 'Ada' });
    addPlayer(room, { id: 'p2', name: 'Ben' });
    startMatch(room, 0);
    const state = serializePublicState(room);

    expect(state.players).toHaveLength(2);
    expect(state.players[0].lanes.length).toBeGreaterThan(0);
    expect(Array.isArray(state.chart)).toBe(true);
    expect(state.score).toBe(0);
  });
});
