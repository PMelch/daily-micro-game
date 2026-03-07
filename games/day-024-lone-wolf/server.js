// Lone Wolf — WebSocket Game Server
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import {
  createRoom, joinRoom, getRoomState, startGame,
  submitPick, resolveRound, nextRound, leaveRoom, getRooms, GAME_STATES
} from './game-logic.js';

const PORT = process.env.PORT || 3024;
const PICK_TIMEOUT_MS = 13000; // 12s pick time + 1s buffer
const NEXT_ROUND_DELAY_MS = 5000;

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lone Wolf WS Server\n');
});

const wss = new WebSocketServer({ server: httpServer });

// Map: playerName@roomCode → WebSocket
const playerSockets = new Map();
// Map: roomCode → Set of playerKeys
const roomSockets = new Map();
// Map: roomCode → timeout handle
const roundTimers = new Map();

function broadcast(roomCode, message) {
  const keys = roomSockets.get(roomCode) || new Set();
  const payload = JSON.stringify(message);
  for (const key of keys) {
    const ws = playerSockets.get(key);
    if (ws && ws.readyState === 1) ws.send(payload);
  }
}

function broadcastState(roomCode) {
  const room = getRoomState(roomCode);
  if (!room) return;
  broadcast(roomCode, { type: 'state', room: sanitizeRoom(room) });
}

function sanitizeRoom(room) {
  // Don't expose internal questions array content unnecessarily
  return {
    code: room.code,
    host: room.host,
    state: room.state,
    players: room.players,
    currentRound: room.currentRound,
    totalRounds: room.questions.length || 8,
    currentQuestion: room.currentQuestion ? {
      categoryKey: room.currentQuestion.categoryKey,
      options: room.currentQuestion.options,
    } : null,
    picks: room.state === GAME_STATES.PICKING
      ? Object.fromEntries(Object.entries(room.picks).map(([k]) => [k, true])) // hide actual picks
      : room.picks,
    roundHistory: room.roundHistory,
  };
}

function scheduleRoundResolve(roomCode) {
  // Clear existing timer if any
  if (roundTimers.has(roomCode)) clearTimeout(roundTimers.get(roomCode));

  const timer = setTimeout(() => {
    const room = getRoomState(roomCode);
    if (!room || room.state !== GAME_STATES.PICKING) return;

    const result = resolveRound(roomCode);
    if (!result.success) return;

    broadcastState(roomCode);

    if (!result.isLastRound) {
      // Auto-advance to next round after delay
      const nextTimer = setTimeout(() => {
        const r = nextRound(roomCode);
        if (r.success) {
          broadcastState(roomCode);
          scheduleRoundResolve(roomCode);
        }
      }, NEXT_ROUND_DELAY_MS);
      roundTimers.set(roomCode + '_next', nextTimer);
    }
  }, PICK_TIMEOUT_MS);

  roundTimers.set(roomCode, timer);
}

function checkAllPicked(roomCode) {
  const room = getRoomState(roomCode);
  if (!room || room.state !== GAME_STATES.PICKING) return;

  const pickedCount = Object.keys(room.picks).length;
  const playerCount = room.players.length;

  if (pickedCount >= playerCount) {
    // All players picked — resolve early
    if (roundTimers.has(roomCode)) clearTimeout(roundTimers.get(roomCode));
    roundTimers.delete(roomCode);

    const result = resolveRound(roomCode);
    if (!result.success) return;

    broadcastState(roomCode);

    if (!result.isLastRound) {
      const nextTimer = setTimeout(() => {
        const r = nextRound(roomCode);
        if (r.success) {
          broadcastState(roomCode);
          scheduleRoundResolve(roomCode);
        }
      }, NEXT_ROUND_DELAY_MS);
      roundTimers.set(roomCode + '_next', nextTimer);
    }
  }
}

wss.on('connection', (ws) => {
  let playerKey = null;
  let playerRoom = null;
  let playerName = null;

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }

    const { type } = msg;

    if (type === 'create_room') {
      const { name } = msg;
      if (!name || typeof name !== 'string') {
        return ws.send(JSON.stringify({ type: 'error', error: 'invalid_name' }));
      }
      const trimmedName = name.trim().slice(0, 20);
      const room = createRoom(trimmedName);
      playerName = trimmedName;
      playerRoom = room.code;
      playerKey = `${trimmedName}@${room.code}`;
      playerSockets.set(playerKey, ws);
      if (!roomSockets.has(room.code)) roomSockets.set(room.code, new Set());
      roomSockets.get(room.code).add(playerKey);
      ws.send(JSON.stringify({ type: 'joined', roomCode: room.code, playerName: trimmedName, isHost: true }));
      broadcastState(room.code);
    }

    else if (type === 'join_room') {
      const { name, code } = msg;
      if (!name || !code) return ws.send(JSON.stringify({ type: 'error', error: 'invalid_params' }));
      const trimmedName = name.trim().slice(0, 20);
      const trimmedCode = code.trim().toUpperCase();
      const result = joinRoom(trimmedCode, trimmedName);
      if (!result.success) return ws.send(JSON.stringify({ type: 'error', error: result.error }));

      playerName = trimmedName;
      playerRoom = trimmedCode;
      playerKey = `${trimmedName}@${trimmedCode}`;
      playerSockets.set(playerKey, ws);
      if (!roomSockets.has(trimmedCode)) roomSockets.set(trimmedCode, new Set());
      roomSockets.get(trimmedCode).add(playerKey);
      ws.send(JSON.stringify({ type: 'joined', roomCode: trimmedCode, playerName: trimmedName, isHost: false }));
      broadcastState(trimmedCode);
    }

    else if (type === 'start_game') {
      if (!playerRoom) return;
      const room = getRoomState(playerRoom);
      if (!room || room.host !== playerName) {
        return ws.send(JSON.stringify({ type: 'error', error: 'not_host' }));
      }
      const result = startGame(playerRoom);
      if (!result.success) return ws.send(JSON.stringify({ type: 'error', error: result.error }));
      broadcastState(playerRoom);
      scheduleRoundResolve(playerRoom);
    }

    else if (type === 'pick') {
      if (!playerRoom || !playerName) return;
      const { optionIndex } = msg;
      const result = submitPick(playerRoom, playerName, optionIndex);
      if (!result.success) return ws.send(JSON.stringify({ type: 'error', error: result.error }));
      ws.send(JSON.stringify({ type: 'pick_ack', optionIndex }));
      // Broadcast pick count (without revealing what was picked)
      broadcastState(playerRoom);
      checkAllPicked(playerRoom);
    }

    else if (type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  });

  ws.on('close', () => {
    if (!playerKey || !playerRoom) return;
    const keys = roomSockets.get(playerRoom);
    if (keys) {
      keys.delete(playerKey);
      if (keys.size === 0) roomSockets.delete(playerRoom);
    }
    playerSockets.delete(playerKey);
    leaveRoom(playerRoom, playerName);
    broadcastState(playerRoom);
  });

  ws.on('error', () => ws.terminate());
});

httpServer.listen(PORT, () => {
  console.log(`Lone Wolf server running on port ${PORT}`);
});
