import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3038;
const wss = new WebSocketServer({ port: PORT });

const GRID_SIZE = 16; // 16x16 = 256 cells
const GAME_DURATION = 60; // seconds
const PLAYER_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
const PLAYER_COLOR_NAMES = ['Red','Blue','Green','Orange','Purple','Teal'];

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do {
    code = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function createRoom(code) {
  return {
    code,
    players: [],
    grid: new Array(GRID_SIZE * GRID_SIZE).fill(null), // null = unclaimed
    phase: 'lobby', // lobby | countdown | playing | ended
    timer: null,
    timeLeft: GAME_DURATION,
    paintCooldowns: {}, // playerId -> timestamp of last paint
    scores: {}
  };
}

function getRoom(code) {
  return rooms.get(code);
}

function broadcastToRoom(room, msg) {
  const data = JSON.stringify(msg);
  room.players.forEach(p => {
    if (p.ws.readyState === 1) p.ws.send(data);
  });
}

function computeScores(room) {
  const scores = {};
  room.players.forEach(p => { scores[p.id] = 0; });
  for (const cell of room.grid) {
    if (cell !== null && scores[cell] !== undefined) {
      scores[cell]++;
    }
  }
  return scores;
}

function startGame(room) {
  room.phase = 'countdown';
  broadcastToRoom(room, { type: 'countdown', count: 3 });
  let count = 3;
  const cd = setInterval(() => {
    count--;
    if (count > 0) {
      broadcastToRoom(room, { type: 'countdown', count });
    } else {
      clearInterval(cd);
      room.phase = 'playing';
      room.timeLeft = GAME_DURATION;
      // Reset grid
      room.grid = new Array(GRID_SIZE * GRID_SIZE).fill(null);
      broadcastToRoom(room, { type: 'start', grid: room.grid, timeLeft: room.timeLeft });

      // Game timer
      room.timer = setInterval(() => {
        room.timeLeft--;
        broadcastToRoom(room, { type: 'tick', timeLeft: room.timeLeft });
        if (room.timeLeft <= 0) {
          clearInterval(room.timer);
          room.phase = 'ended';
          const scores = computeScores(room);
          broadcastToRoom(room, { type: 'gameOver', scores, grid: room.grid });
        }
      }, 1000);
    }
  }, 1000);
}

function sendState(player, room) {
  const state = {
    type: 'state',
    code: room.code,
    phase: room.phase,
    players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, colorName: p.colorName })),
    grid: room.grid,
    timeLeft: room.timeLeft,
    yourId: player.id
  };
  player.ws.send(JSON.stringify(state));
}

wss.on('connection', (ws) => {
  let playerId = null;
  let roomCode = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'create') {
      const code = generateRoomCode();
      const room = createRoom(code);
      rooms.set(code, room);

      const colorIdx = 0;
      playerId = 'p' + Date.now() + Math.random().toString(36).slice(2,6);
      roomCode = code;
      const player = {
        id: playerId,
        name: msg.name || 'Player 1',
        color: PLAYER_COLORS[colorIdx],
        colorName: PLAYER_COLOR_NAMES[colorIdx],
        ws,
        colorIdx
      };
      room.players.push(player);
      sendState(player, room);
      broadcastToRoom(room, { type: 'playerJoined', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, colorName: p.colorName })) });
    }

    else if (msg.type === 'join') {
      const code = (msg.code || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) { ws.send(JSON.stringify({ type: 'error', message: 'Room not found' })); return; }
      if (room.players.length >= 6) { ws.send(JSON.stringify({ type: 'error', message: 'Room full' })); return; }
      if (room.phase !== 'lobby') { ws.send(JSON.stringify({ type: 'error', message: 'Game already started' })); return; }

      const colorIdx = room.players.length;
      playerId = 'p' + Date.now() + Math.random().toString(36).slice(2,6);
      roomCode = code;
      const player = {
        id: playerId,
        name: msg.name || `Player ${colorIdx + 1}`,
        color: PLAYER_COLORS[colorIdx],
        colorName: PLAYER_COLOR_NAMES[colorIdx],
        ws,
        colorIdx
      };
      room.players.push(player);
      sendState(player, room);
      broadcastToRoom(room, { type: 'playerJoined', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, colorName: p.colorName })) });
    }

    else if (msg.type === 'start') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'lobby') return;
      if (room.players.length < 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Need at least 2 players' }));
        return;
      }
      startGame(room);
    }

    else if (msg.type === 'paint') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'playing') return;
      const { cells } = msg; // array of cell indices
      if (!Array.isArray(cells) || cells.length === 0) return;

      const player = room.players.find(p => p.id === playerId);
      if (!player) return;

      // Apply paints
      const changed = [];
      for (const idx of cells) {
        if (idx < 0 || idx >= GRID_SIZE * GRID_SIZE) continue;
        if (room.grid[idx] !== playerId) {
          room.grid[idx] = playerId;
          changed.push(idx);
        }
      }

      if (changed.length > 0) {
        broadcastToRoom(room, { type: 'painted', playerId, color: player.color, cells: changed });
      }
    }

    else if (msg.type === 'playAgain') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'ended') return;
      room.phase = 'lobby';
      if (room.timer) { clearInterval(room.timer); room.timer = null; }
      room.grid = new Array(GRID_SIZE * GRID_SIZE).fill(null);
      broadcastToRoom(room, { type: 'reset', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, colorName: p.colorName })) });
    }
  });

  ws.on('close', () => {
    if (!roomCode) return;
    const room = rooms.get(roomCode);
    if (!room) return;
    room.players = room.players.filter(p => p.id !== playerId);
    // Reassign colors
    room.players.forEach((p, i) => {
      p.color = PLAYER_COLORS[i];
      p.colorName = PLAYER_COLOR_NAMES[i];
      p.colorIdx = i;
    });
    broadcastToRoom(room, { type: 'playerLeft', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, colorName: p.colorName })) });
    if (room.players.length === 0) {
      if (room.timer) clearInterval(room.timer);
      rooms.delete(roomCode);
    }
  });
});

console.log(`Pixel Storm WS server running on port ${PORT}`);
