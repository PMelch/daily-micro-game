export const TOOL_ORDER = ['weld', 'cool', 'shield'];

export const INCIDENT_TYPES = {
  fire: { steps: ['cool', 'weld'], damage: 4 },
  crack: { steps: ['shield', 'weld'], damage: 3 },
  spark: { steps: ['shield', 'cool'], damage: 2 },
};

let incidentCounter = 1;

export function assignRoles(playerCount) {
  return Array.from({ length: playerCount }, (_, index) => TOOL_ORDER[index % TOOL_ORDER.length]);
}

export function createIncident(zone, type) {
  return {
    id: `incident-${incidentCounter++}`,
    zone,
    type,
    steps: [...INCIDENT_TYPES[type].steps],
    progress: 0,
    resolved: false,
    damage: INCIDENT_TYPES[type].damage,
  };
}

export function applyToolToIncident(incident, tool) {
  if (incident.resolved) return { ...incident };
  const expectedTool = incident.steps[incident.progress];
  if (tool !== expectedTool) return { ...incident };
  const progress = incident.progress + 1;
  return {
    ...incident,
    progress,
    resolved: progress >= incident.steps.length,
  };
}

export function tickRoomState(room, options = {}) {
  const incidents = room.incidents.map((incident) => ({ ...incident }));
  const activeIncidents = incidents.filter((incident) => !incident.resolved);
  const damage = activeIncidents.reduce((sum, incident) => sum + incident.damage, 0);
  const hull = Math.max(0, room.hull - damage);
  const timeLeft = Math.max(0, room.timeLeft - 1);

  let status = room.status;
  if (hull <= 0) status = 'lost';
  else if (timeLeft <= 0) status = 'won';

  return {
    ...room,
    incidents,
    hull,
    timeLeft,
    status,
  };
}
