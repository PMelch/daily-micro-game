import { WebSocketServer } from 'ws';
import { assignRoles, createIncident, applyToolToIncident } from './state.js';

const PORT = Number(process.env.PORT || 3057);
const ROUND_SECONDS = 75;
const MAX_INCIDENTS = 4;
const TOOL_COOLDOWN_MS = 900;
const ZONES = ['bridge', 'engine', 'cargo'];
const INCIDENT_POOL = ['fire', 'crack', 'spark'];
const rooms = new Map();

const wss = new WebSocketServer({ port: PORT });
console.log(`Patch Panic server running on port ${PORT}`);

function roomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function broadcast(room, payload) {
  const data = JSON.stringify(payload);
  for (const player of room.players) {
    if (player.ws.readyState === 1) player.ws.send(data);
  }
}

function playerView(room, player) {
  return {
    type: 'state',
    roomCode: room.code,
    status: room.status,
    isHost: room.hostId === player.id,
    selfId: player.id,
    role: player.role,
    hull: room.hull,
    timeLeft: room.timeLeft,
    maxIncidents: room.maxIncidents,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      score: p.score,
      connected: p.ws.readyState === 1,
    })),
    incidents: room.incidents,
    repaired: room.repaired,
    message: room.message,
  };
}

function syncRoom(room) {
  for (const player of room.players) {
    if (player.ws.readyState === 1) {
      player.ws.send(JSON.stringify(playerView(room, player)));
    }
  }
}

function createRoom() {
  const code = roomCode();
  const room = {
    code,
    status: 'lobby',
    hostId: null,
    players: [],
    incidents: [],
    hull: 100,
    timeLeft: ROUND_SECONDS,
    repaired: 0,
    maxIncidents: MAX_INCIDENTS,
    message: '',
    interval: null,
    spawnEvery: 3,
    spawnCounter: 3,
  };
  rooms.set(code, room);
  return room;
}

function randomIncident(room) {
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  const type = INCIDENT_POOL[Math.floor(Math.random() * INCIDENT_POOL.length)];
  return createIncident(zone, type);
}

function ensureRoomPressure(room) {
  if (room.incidents.filter((i) => !i.resolved).length >= room.maxIncidents) return;
  room.incidents.push(randomIncident(room));
}

function tick(room) {
  if (room.status !== 'playing') return;
  room.timeLeft = Math.max(0, room.timeLeft - 1);
  const active = room.incidents.filter((incident) => !incident.resolved);
  const damage = active.reduce((sum, incident) => sum + incident.damage, 0);
  room.hull = Math.max(0, room.hull - damage);
  room.spawnCounter -= 1;

  if (room.spawnCounter <= 0) {
    room.spawnCounter = room.spawnEvery;
    ensureRoomPressure(room);
  }

  room.incidents = room.incidents.filter((incident) => !incident.resolved || Date.now() - incident.resolvedAt < 1400);

  if (room.hull <= 0) {
    room.status = 'lost';
    room.message = 'hull_breached';
    stopRoom(room);
  } else if (room.timeLeft <= 0) {
    room.status = 'won';
    room.message = 'shift_saved';
    stopRoom(room);
  }

  syncRoom(room);
}

function stopRoom(room) {
  if (room.interval) {
    clearInterval(room.interval);
    room.interval = null;
  }
}

function startGame(room) {
  room.status = 'playing';
  room.hull = 100;
  room.timeLeft = ROUND_SECONDS;
  room.repaired = 0;
  room.message = 'repair_now';
  room.incidents = [randomIncident(room), randomIncident(room)];
  room.spawnCounter = room.spawnEvery;
  const roles = assignRoles(room.players.length);
  room.players.forEach((player, index) => {
    player.role = roles[index];
    player.score = 0;
    player.lastToolAt = 0;
  });
  stopRoom(room);
  room.interval = setInterval(() => tick(room), 1000);
  syncRoom(room);
}

function joinPlayer(room, ws, name) {
  const player = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.slice(0, 18) || 'Player',
    ws,
    role: null,
    score: 0,
    lastToolAt: 0,
  };
  room.players.push(player);
  if (!room.hostId) room.hostId = player.id;
  return player;
}

function handleCreate(ws, name) {
  const room = createRoom();
  const player = joinPlayer(room, ws, name);
  ws.roomCode = room.code;
  ws.playerId = player.id;
  syncRoom(room);
}

function handleJoin(ws, code, name) {
  const room = rooms.get(code);
  if (!room) {
    ws.send(JSON.stringify({ type: 'error', message: 'room_not_found' }));
    return;
  }
  if (room.status !== 'lobby') {
    ws.send(JSON.stringify({ type: 'error', message: 'game_already_started' }));
    return;
  }
  if (room.players.length >= 6) {
    ws.send(JSON.stringify({ type: 'error', message: 'room_full' }));
    return;
  }
  const player = joinPlayer(room, ws, name);
  ws.roomCode = room.code;
  ws.playerId = player.id;
  room.message = 'crew_ready';
  syncRoom(room);
}

function handleTool(room, playerId, incidentId) {
  const player = room.players.find((entry) => entry.id === playerId);
  if (!player || room.status !== 'playing') return;
  const now = Date.now();
  if (now - player.lastToolAt < TOOL_COOLDOWN_MS) return;

  const index = room.incidents.findIndex((incident) => incident.id === incidentId && !incident.resolved);
  if (index === -1) return;

  const incident = room.incidents[index];
  const updated = applyToolToIncident(incident, player.role);
  if (updated.progress === incident.progress) {
    room.message = 'wrong_tool';
    syncRoom(room);
    return;
  }

  player.lastToolAt = now;
  room.incidents[index] = {
    ...updated,
    touchedBy: player.id,
    resolvedAt: updated.resolved ? Date.now() : null,
  };
  room.message = updated.resolved ? 'incident_fixed' : 'good_step';
  if (updated.resolved) {
    player.score += 10;
    room.repaired += 1;
    if (room.incidents.filter((entry) => !entry.resolved).length < 2) ensureRoomPressure(room);
  } else {
    player.score += 3;
  }

  syncRoom(room);
}

function removePlayer(ws) {
  const code = ws.roomCode;
  if (!code || !rooms.has(code)) return;
  const room = rooms.get(code);
  room.players = room.players.filter((player) => player.id !== ws.playerId);
  if (room.players.length === 0) {
    stopRoom(room);
    rooms.delete(code);
    return;
  }
  if (room.hostId === ws.playerId) room.hostId = room.players[0].id;
  room.message = 'player_left';
  syncRoom(room);
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'create') {
      handleCreate(ws, msg.name || 'Player');
      return;
    }
    if (msg.type === 'join') {
      handleJoin(ws, (msg.roomCode || '').toUpperCase(), msg.name || 'Player');
      return;
    }

    const room = rooms.get(ws.roomCode);
    if (!room) return;

    if (msg.type === 'start' && room.hostId === ws.playerId && room.players.length >= 2) {
      startGame(room);
      return;
    }

    if (msg.type === 'useTool') {
      handleTool(room, ws.playerId, msg.incidentId);
      return;
    }

    if (msg.type === 'restart' && room.hostId === ws.playerId) {
      room.status = 'lobby';
      room.incidents = [];
      room.message = 'ready_again';
      stopRoom(room);
      syncRoom(room);
    }
  });

  ws.on('close', () => removePlayer(ws));
});
