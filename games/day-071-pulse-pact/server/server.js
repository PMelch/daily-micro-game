import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { createRoomState, addPlayer, startMatch, processHit, advanceRoom, serializePublicState } from './game-logic.js';

const PORT = Number(process.env.PORT || 3071);
const rooms = new Map();
const wss = new WebSocketServer({ port: PORT });

function roomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(ws, payload) {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
}

function broadcast(room) {
  const state = serializePublicState(room, Date.now());
  room.players.forEach((player) => {
    send(player.ws, {
      type: 'state',
      me: {
        id: player.id,
        isHost: player.id === room.hostId,
        lanes: player.lanes,
      },
      state,
    });
  });
}

function trimName(name) {
  return String(name || '').trim().slice(0, 18) || 'Spieler';
}

wss.on('connection', (ws) => {
  let joinedRoom = null;
  let playerId = null;

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'create') {
      const room = createRoomState(roomCode());
      playerId = randomUUID();
      addPlayer(room, { id: playerId, name: trimName(msg.name), ws });
      rooms.set(room.code, room);
      joinedRoom = room;
      broadcast(room);
      return;
    }

    if (msg.type === 'join') {
      const room = rooms.get(String(msg.code || '').toUpperCase());
      if (!room || room.phase !== 'lobby' || room.players.length >= 6) {
        send(ws, { type: 'error', message: 'Room not available' });
        return;
      }
      playerId = randomUUID();
      addPlayer(room, { id: playerId, name: trimName(msg.name), ws });
      joinedRoom = room;
      broadcast(room);
      return;
    }

    if (!joinedRoom || !playerId) return;

    if (msg.type === 'start') {
      if (playerId !== joinedRoom.hostId || joinedRoom.players.length < 2) return;
      startMatch(joinedRoom, Date.now());
      broadcast(joinedRoom);
      return;
    }

    if (msg.type === 'hit') {
      processHit(joinedRoom, playerId, Number(msg.lane), Date.now());
      broadcast(joinedRoom);
    }
  });

  ws.on('close', () => {
    if (!joinedRoom || !playerId) return;
    joinedRoom.players = joinedRoom.players.filter((player) => player.id !== playerId);
    if (joinedRoom.players.length === 0) {
      rooms.delete(joinedRoom.code);
      return;
    }
    if (joinedRoom.hostId === playerId) joinedRoom.hostId = joinedRoom.players[0].id;
    broadcast(joinedRoom);
  });
});

setInterval(() => {
  const now = Date.now();
  rooms.forEach((room) => {
    if (room.phase === 'countdown' || room.phase === 'playing') {
      const before = `${room.phase}:${room.energy}:${room.score}:${room.combo}:${room.lastEvent}`;
      advanceRoom(room, now);
      const after = `${room.phase}:${room.energy}:${room.score}:${room.combo}:${room.lastEvent}`;
      if (before !== after || room.phase === 'countdown' || room.phase === 'playing') broadcast(room);
    }
  });
}, 100);

console.log(`Pulse Pact server running on ${PORT}`);
