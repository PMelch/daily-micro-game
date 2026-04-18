import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';
import { createRoomState, addPlayer, startMatch, applyAction, serializePublicState } from './game-logic.js';

const PORT = Number(process.env.PORT || 3064);
const wss = new WebSocketServer({ port: PORT });
const rooms = new Map();

function roomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  do code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  while (rooms.has(code));
  return code;
}

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function broadcast(room) {
  const state = serializePublicState(room);
  room.players.forEach(player => {
    send(player.ws, { type: 'state', me: { id: player.id, role: player.role, isHost: player.id === room.hostId }, state });
  });
}

wss.on('connection', (ws) => {
  let joinedRoom = null;
  let playerId = null;

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());

    if (msg.type === 'create') {
      const code = roomCode();
      const room = createRoomState(code);
      playerId = randomUUID();
      addPlayer(room, { id: playerId, name: msg.name?.trim() || 'Player', ws });
      rooms.set(code, room);
      joinedRoom = room;
      broadcast(room);
      return;
    }

    if (msg.type === 'join') {
      const room = rooms.get((msg.code || '').toUpperCase());
      if (!room || room.players.length >= 6) {
        send(ws, { type: 'error', message: 'Room not available' });
        return;
      }
      playerId = randomUUID();
      addPlayer(room, { id: playerId, name: msg.name?.trim() || 'Player', ws });
      joinedRoom = room;
      broadcast(room);
      return;
    }

    if (!joinedRoom) return;

    if (msg.type === 'start' && playerId === joinedRoom.hostId && joinedRoom.players.length >= 2) {
      startMatch(joinedRoom);
      broadcast(joinedRoom);
      return;
    }

    if (msg.type === 'action') {
      applyAction(joinedRoom, playerId, msg.action);
      broadcast(joinedRoom);
    }
  });

  ws.on('close', () => {
    if (!joinedRoom || !playerId) return;
    joinedRoom.players = joinedRoom.players.filter(p => p.id !== playerId);
    if (joinedRoom.players.length === 0) {
      rooms.delete(joinedRoom.code);
      return;
    }
    if (joinedRoom.hostId === playerId) joinedRoom.hostId = joinedRoom.players[0].id;
    broadcast(joinedRoom);
  });
});

console.log(`Crew Circuit server running on ${PORT}`);
