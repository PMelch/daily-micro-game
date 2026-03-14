// Two-Thirds — WebSocket Game Server
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import {
  createRoom, joinRoom, getRoomState, startGame,
  submitGuess, resolveRound, nextRound, leaveRoom, GAME_STATES
} from './game-logic.js';

const PORT = process.env.PORT || 3031;
const GUESS_TIMEOUT_MS = 31000; // 30s + 1s buffer
const NEXT_ROUND_DELAY_MS = 6000;

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Two-Thirds WS Server\n');
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
  const guessedPlayers = Object.keys(room.guesses);
  return {
    code: room.code,
    host: room.host,
    state: room.state,
    players: room.players,
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    guessedCount: guessedPlayers.length,
    guessedPlayers,
    // During guessing: hide actual values. Reveal after.
    guesses: room.state === GAME_STATES.GUESSING
      ? Object.fromEntries(guessedPlayers.map(k => [k, '?']))
      : room.guesses,
    roundHistory: room.roundHistory,
  };
}

function scheduleRoundResolve(roomCode) {
  if (roundTimers.has(roomCode)) clearTimeout(roundTimers.get(roomCode));
  const timer = setTimeout(() => {
    const room = getRoomState(roomCode);
    if (!room || room.state !== GAME_STATES.GUESSING) return;
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
      roundTimers.set(roomCode, nextTimer);
    }
  }, GUESS_TIMEOUT_MS);
  roundTimers.set(roomCode, timer);
}

function getPlayerKey(roomCode, playerName) {
  return `${playerName}@${roomCode}`;
}

wss.on('connection', (ws) => {
  let playerKey = null;
  let currentRoom = null;
  let currentPlayer = null;

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    const { type, payload } = msg;

    if (type === 'create') {
      const { playerName } = payload;
      const result = createRoom(playerName);
      if (!result.success) { ws.send(JSON.stringify({ type: 'error', error: result.error })); return; }
      currentRoom = result.code;
      currentPlayer = playerName;
      playerKey = getPlayerKey(currentRoom, currentPlayer);
      playerSockets.set(playerKey, ws);
      if (!roomSockets.has(currentRoom)) roomSockets.set(currentRoom, new Set());
      roomSockets.get(currentRoom).add(playerKey);
      broadcastState(currentRoom);
    }

    else if (type === 'join') {
      const { roomCode, playerName } = payload;
      const result = joinRoom(roomCode, playerName);
      if (!result.success) { ws.send(JSON.stringify({ type: 'error', error: result.error })); return; }
      currentRoom = roomCode;
      currentPlayer = playerName;
      playerKey = getPlayerKey(currentRoom, currentPlayer);
      playerSockets.set(playerKey, ws);
      if (!roomSockets.has(currentRoom)) roomSockets.set(currentRoom, new Set());
      roomSockets.get(currentRoom).add(playerKey);
      broadcastState(currentRoom);
    }

    else if (type === 'start') {
      if (!currentRoom || !currentPlayer) return;
      const result = startGame(currentRoom, currentPlayer);
      if (!result.success) { ws.send(JSON.stringify({ type: 'error', error: result.error })); return; }
      broadcastState(currentRoom);
      scheduleRoundResolve(currentRoom);
    }

    else if (type === 'guess') {
      if (!currentRoom || !currentPlayer) return;
      const { guess } = payload;
      const result = submitGuess(currentRoom, currentPlayer, guess);
      if (!result.success) { ws.send(JSON.stringify({ type: 'error', error: result.error })); return; }
      broadcastState(currentRoom);

      if (result.allGuessed) {
        // All guessed — resolve immediately
        if (roundTimers.has(currentRoom)) clearTimeout(roundTimers.get(currentRoom));
        const resolveResult = resolveRound(currentRoom);
        if (!resolveResult.success) return;
        broadcastState(currentRoom);
        if (!resolveResult.isLastRound) {
          const nextTimer = setTimeout(() => {
            const r = nextRound(currentRoom);
            if (r.success) {
              broadcastState(currentRoom);
              scheduleRoundResolve(currentRoom);
            }
          }, NEXT_ROUND_DELAY_MS);
          roundTimers.set(currentRoom, nextTimer);
        }
      }
    }
  });

  ws.on('close', () => {
    if (!currentRoom || !currentPlayer || !playerKey) return;
    playerSockets.delete(playerKey);
    const keys = roomSockets.get(currentRoom);
    if (keys) keys.delete(playerKey);
    leaveRoom(currentRoom, currentPlayer);
    broadcastState(currentRoom);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Two-Thirds WS server running on port ${PORT}`);
});
