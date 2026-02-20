// Blitz Buzz — WebSocket Game Server
// Serves both HTTP (static files) and WebSocket (game logic)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import {
  createRoom, joinRoom, canStartGame, startGame,
  buzz, submitAnswer, nextQuestion, getRoomState,
  isGameOver, getFinalScores,
} from './game-logic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3009;

// ─── In-memory rooms ──────────────────────────────────────────────────────
const rooms = new Map();       // code → room
const clientRoom = new Map();  // ws → { code, playerName }

// ─── HTTP Server ──────────────────────────────────────────────────────────
const httpServer = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png' };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ─── WebSocket Server ────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

function broadcast(room, message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(ws => {
    const info = clientRoom.get(ws);
    if (info && info.code === room.code && ws.readyState === 1) {
      ws.send(payload);
    }
  });
}

function sendState(room) {
  broadcast(room, { type: 'state', state: getRoomState(room) });
}

function sendTo(ws, message) {
  ws.send(JSON.stringify(message));
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const info = clientRoom.get(ws);

    // ── CREATE ROOM ──
    if (msg.type === 'create') {
      if (!msg.name?.trim()) return sendTo(ws, { type: 'error', message: 'Name required' });

      const room = createRoom(msg.name.trim());
      rooms.set(room.code, room);
      clientRoom.set(ws, { code: room.code, playerName: msg.name.trim() });

      sendTo(ws, { type: 'created', code: room.code, state: getRoomState(room) });
      return;
    }

    // ── JOIN ROOM ──
    if (msg.type === 'join') {
      const code = (msg.code || '').trim().toUpperCase();
      const name = (msg.name || '').trim();
      if (!code || !name) return sendTo(ws, { type: 'error', message: 'Code and name required' });

      const room = rooms.get(code);
      if (!room) return sendTo(ws, { type: 'error', message: 'Room not found' });

      const result = joinRoom(room, name);
      if (!result.ok) return sendTo(ws, { type: 'error', message: result.reason });

      clientRoom.set(ws, { code, playerName: name });
      sendTo(ws, { type: 'joined', state: getRoomState(room) });
      broadcast(room, { type: 'player_joined', name, state: getRoomState(room) });
      return;
    }

    if (!info) return; // not in a room
    const room = rooms.get(info.code);
    if (!room) return;

    // ── START GAME ──
    if (msg.type === 'start') {
      if (!canStartGame(room)) return sendTo(ws, { type: 'error', message: 'Need at least 2 players' });
      startGame(room);
      sendState(room);
      return;
    }

    // ── BUZZ ──
    if (msg.type === 'buzz') {
      const result = buzz(room, info.playerName);
      if (!result.ok) return; // silently ignore late buzzes
      sendState(room);
      return;
    }

    // ── ANSWER ──
    if (msg.type === 'answer') {
      const result = submitAnswer(room, info.playerName, msg.choice);
      if (!result.ok) return;
      sendState(room);
      // Auto-advance after 3 seconds
      setTimeout(() => {
        if (room.phase === 'reveal') {
          nextQuestion(room);
          sendState(room);
          if (isGameOver(room)) {
            broadcast(room, {
              type: 'gameover',
              scores: getFinalScores(room),
              state: getRoomState(room),
            });
          }
        }
      }, 3000);
      return;
    }

    // ── NEXT (manual advance) ──
    if (msg.type === 'next') {
      if (room.phase !== 'reveal') return;
      nextQuestion(room);
      sendState(room);
      if (isGameOver(room)) {
        broadcast(room, {
          type: 'gameover',
          scores: getFinalScores(room),
          state: getRoomState(room),
        });
      }
      return;
    }
  });

  ws.on('close', () => {
    clientRoom.delete(ws);
  });
});

// ─── Cleanup stale rooms every 30 min ─────────────────────────────────────
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    if (room._createdAt && room._createdAt < cutoff) {
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Blitz Buzz server running on port ${PORT}`);
});
