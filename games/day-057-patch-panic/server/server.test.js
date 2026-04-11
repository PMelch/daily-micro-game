/**
 * [TESTABILITY ANALYSIS]
 * We can unit-test the pure multiplayer game rules without websockets:
 * - player role assignment stays balanced and deterministic
 * - incidents spawn with valid zone/type requirements
 * - applying tools advances or resolves incidents only in the correct order
 * - unresolved incidents drain hull over time
 * - victory triggers when the timer reaches zero with hull remaining
 */

import { describe, it, expect } from 'bun:test';
import {
  assignRoles,
  createIncident,
  applyToolToIncident,
  tickRoomState,
  TOOL_ORDER,
  INCIDENT_TYPES,
} from './state.js';

describe('assignRoles', () => {
  it('assigns one role per player and reuses roles in rotation', () => {
    const roles = assignRoles(5);
    expect(roles).toEqual(['weld', 'cool', 'shield', 'weld', 'cool']);
  });
});

describe('createIncident', () => {
  it('creates incidents with valid repair sequences', () => {
    const incident = createIncident('engine', 'fire');
    expect(incident.zone).toBe('engine');
    expect(incident.type).toBe('fire');
    expect(incident.steps).toEqual(INCIDENT_TYPES.fire.steps);
    expect(incident.progress).toBe(0);
  });
});

describe('applyToolToIncident', () => {
  it('advances when the correct next tool is used', () => {
    const incident = createIncident('bridge', 'crack');
    const afterShield = applyToolToIncident(incident, 'shield');
    expect(afterShield.progress).toBe(1);
    expect(afterShield.resolved).toBe(false);

    const afterWeld = applyToolToIncident(afterShield, 'weld');
    expect(afterWeld.progress).toBe(2);
    expect(afterWeld.resolved).toBe(true);
  });

  it('ignores wrong tools', () => {
    const incident = createIncident('cargo', 'spark');
    const afterWrong = applyToolToIncident(incident, 'weld');
    expect(afterWrong.progress).toBe(0);
    expect(afterWrong.resolved).toBe(false);
  });
});

describe('tickRoomState', () => {
  it('drains hull based on active incidents', () => {
    const room = {
      hull: 100,
      timeLeft: 30,
      status: 'playing',
      incidents: [
        createIncident('bridge', 'fire'),
        createIncident('cargo', 'spark'),
      ],
      maxIncidents: 3,
    };

    const next = tickRoomState(room, { spawn: false });
    expect(next.hull).toBe(94);
    expect(next.timeLeft).toBe(29);
    expect(next.status).toBe('playing');
  });

  it('ends in victory when timer expires and hull remains', () => {
    const room = {
      hull: 12,
      timeLeft: 1,
      status: 'playing',
      incidents: [],
      maxIncidents: 3,
    };

    const next = tickRoomState(room, { spawn: false });
    expect(next.timeLeft).toBe(0);
    expect(next.status).toBe('won');
  });

  it('ends in defeat when hull hits zero', () => {
    const room = {
      hull: 3,
      timeLeft: 10,
      status: 'playing',
      incidents: [createIncident('bridge', 'fire')],
      maxIncidents: 3,
    };

    const next = tickRoomState(room, { spawn: false });
    expect(next.hull).toBe(0);
    expect(next.status).toBe('lost');
  });
});
