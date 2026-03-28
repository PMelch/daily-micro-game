import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3045;
const wss = new WebSocketServer({ port: PORT });

// Each spectrum has two poles + a set of thematic target positions
const SPECTRA = [
  { left: 'KALT', right: 'HEIΒ', left_en: 'COLD', right_en: 'HOT', left_fr: 'FROID', right_fr: 'CHAUD', left_it: 'FREDDO', right_it: 'CALDO', left_es: 'FRÍO', right_es: 'CALIENTE' },
  { left: 'LEISE', right: 'LAUT', left_en: 'QUIET', right_en: 'LOUD', left_fr: 'SILENCE', right_fr: 'BRUYANT', left_it: 'SILENZIOSO', right_it: 'FORTE', left_es: 'SILENCIOSO', right_es: 'RUIDOSO' },
  { left: 'LANGSAM', right: 'SCHNELL', left_en: 'SLOW', right_en: 'FAST', left_fr: 'LENT', right_fr: 'RAPIDE', left_it: 'LENTO', right_it: 'VELOCE', left_es: 'LENTO', right_es: 'RÁPIDO' },
  { left: 'KLEIN', right: 'RIESIG', left_en: 'TINY', right_en: 'HUGE', left_fr: 'PETIT', right_fr: 'ÉNORME', left_it: 'PICCOLO', right_it: 'ENORME', left_es: 'PEQUEÑO', right_es: 'ENORME' },
  { left: 'BILLIG', right: 'TEUER', left_en: 'CHEAP', right_en: 'EXPENSIVE', left_fr: 'BON MARCHÉ', right_fr: 'CHER', left_it: 'ECONOMICO', right_it: 'CARO', left_es: 'BARATO', right_es: 'CARO' },
  { left: 'LANGWEILIG', right: 'AUFREGEND', left_en: 'BORING', right_en: 'EXCITING', left_fr: 'ENNUYEUX', right_fr: 'EXCITANT', left_it: 'NOIOSO', right_it: 'EMOZIONANTE', left_es: 'ABURRIDO', right_es: 'EMOCIONANTE' },
  { left: 'HARMLOS', right: 'GEFÄHRLICH', left_en: 'SAFE', right_en: 'DANGEROUS', left_fr: 'SÛR', right_fr: 'DANGEREUX', left_it: 'SICURO', right_it: 'PERICOLOSO', left_es: 'SEGURO', right_es: 'PELIGROSO' },
  { left: 'NATÜRLICH', right: 'KÜNSTLICH', left_en: 'NATURAL', right_en: 'ARTIFICIAL', left_fr: 'NATUREL', right_fr: 'ARTIFICIEL', left_it: 'NATURALE', right_it: 'ARTIFICIALE', left_es: 'NATURAL', right_es: 'ARTIFICIAL' },
  { left: 'LEICHT', right: 'SCHWER', left_en: 'EASY', right_en: 'HARD', left_fr: 'FACILE', right_fr: 'DIFFICILE', left_it: 'FACILE', right_it: 'DIFFICILE', left_es: 'FÁCIL', right_es: 'DIFÍCIL' },
  { left: 'ALT', right: 'NEU', left_en: 'OLD', right_en: 'NEW', left_fr: 'VIEUX', right_fr: 'NOUVEAU', left_it: 'VECCHIO', right_it: 'NUOVO', left_es: 'VIEJO', right_es: 'NUEVO' },
];

const PLAYER_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
const TOTAL_ROUNDS = 6;

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
    phase: 'lobby', // lobby | giving_clue | guessing | reveal | ended
    round: 0,
    broadcasterIdx: 0,
    spectrum: null,
    target: null,     // 0-100
    clue: null,
    guesses: {},      // playerId -> 0-100
    roundScores: {},  // playerId -> points for this round
    totalScores: {},  // playerId -> total points
    spectraUsed: [],
    timer: null,
    timeLeft: 0,
  };
}

function broadcastToRoom(room, msg) {
  const data = JSON.stringify(msg);
  room.players.forEach(p => {
    if (p.ws.readyState === 1) p.ws.send(data);
  });
}

function pickSpectrum(room) {
  const available = SPECTRA.filter((_, i) => !room.spectraUsed.includes(i));
  const pool = available.length > 0 ? available : SPECTRA;
  const idx = SPECTRA.indexOf(pool[Math.floor(Math.random() * pool.length)]);
  room.spectraUsed.push(idx);
  return { ...SPECTRA[idx] };
}

function scoreGuesses(room) {
  const scores = {};
  room.players.forEach(p => { scores[p.id] = 0; });

  for (const [pid, guess] of Object.entries(room.guesses)) {
    // Skip broadcaster
    if (room.players[room.broadcasterIdx]?.id === pid) continue;
    const diff = Math.abs(guess - room.target);
    // Scoring: 5pts if within 5, 4 within 10, 3 within 15, 2 within 25, 1 within 40, 0 otherwise
    if (diff <= 5) scores[pid] = 5;
    else if (diff <= 10) scores[pid] = 4;
    else if (diff <= 15) scores[pid] = 3;
    else if (diff <= 25) scores[pid] = 2;
    else if (diff <= 40) scores[pid] = 1;
    else scores[pid] = 0;
  }

  // Bonus: broadcaster gets avg of guessers' scores (they did a good job if guessers scored high)
  const guessers = room.players.filter(p => p.id !== room.players[room.broadcasterIdx]?.id);
  if (guessers.length > 0) {
    const avgScore = guessers.reduce((sum, p) => sum + (scores[p.id] || 0), 0) / guessers.length;
    const broadId = room.players[room.broadcasterIdx]?.id;
    if (broadId) scores[broadId] = Math.round(avgScore);
  }

  return scores;
}

function startRound(room) {
  room.round++;
  room.broadcasterIdx = (room.round - 1) % room.players.length;
  room.spectrum = pickSpectrum(room);
  room.target = Math.round(20 + Math.random() * 60); // 20-80 to avoid extremes
  room.clue = null;
  room.guesses = {};
  room.roundScores = {};
  room.phase = 'giving_clue';
  room.timeLeft = 45;

  const broadcasterId = room.players[room.broadcasterIdx]?.id;

  // Tell broadcaster their private info (target + spectrum)
  room.players.forEach(p => {
    const msg = {
      type: 'roundStart',
      round: room.round,
      totalRounds: TOTAL_ROUNDS,
      broadcasterIdx: room.broadcasterIdx,
      broadcasterId,
      spectrum: room.spectrum,
      phase: 'giving_clue',
      timeLeft: room.timeLeft,
    };
    if (p.id === broadcasterId) {
      msg.target = room.target; // only broadcaster sees target
    }
    if (p.ws.readyState === 1) p.ws.send(JSON.stringify(msg));
  });

  // Countdown for clue giving
  room.timer = setInterval(() => {
    room.timeLeft--;
    broadcastToRoom(room, { type: 'tick', timeLeft: room.timeLeft, phase: room.phase });
    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      // Auto-submit empty clue if broadcaster didn't respond
      if (!room.clue) {
        room.clue = '???';
        startGuessing(room);
      }
    }
  }, 1000);
}

function startGuessing(room) {
  if (room.timer) { clearInterval(room.timer); room.timer = null; }
  room.phase = 'guessing';
  room.timeLeft = 30;

  // Initialize guesses for all non-broadcasters at 50
  room.players.forEach(p => {
    if (room.players[room.broadcasterIdx]?.id !== p.id) {
      room.guesses[p.id] = 50;
    }
  });

  broadcastToRoom(room, {
    type: 'guessingStart',
    clue: room.clue,
    spectrum: room.spectrum,
    timeLeft: room.timeLeft,
    phase: 'guessing',
  });

  room.timer = setInterval(() => {
    room.timeLeft--;
    broadcastToRoom(room, { type: 'tick', timeLeft: room.timeLeft, phase: room.phase });
    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      revealResults(room);
    } else {
      // Check if all guessers have locked in
      const guessers = room.players.filter(p => p.id !== room.players[room.broadcasterIdx]?.id);
      const allLocked = guessers.every(p => room.guesses[p.id] !== undefined && room.lockedGuesses?.[p.id]);
      if (allLocked && guessers.length > 0) {
        clearInterval(room.timer);
        revealResults(room);
      }
    }
  }, 1000);
}

function revealResults(room) {
  if (room.timer) { clearInterval(room.timer); room.timer = null; }
  room.phase = 'reveal';

  const roundScores = scoreGuesses(room);
  room.roundScores = roundScores;

  // Add to total scores
  room.players.forEach(p => {
    if (!room.totalScores[p.id]) room.totalScores[p.id] = 0;
    room.totalScores[p.id] += roundScores[p.id] || 0;
  });

  broadcastToRoom(room, {
    type: 'reveal',
    target: room.target,
    clue: room.clue,
    guesses: room.guesses,
    roundScores,
    totalScores: room.totalScores,
    spectrum: room.spectrum,
    round: room.round,
    totalRounds: TOTAL_ROUNDS,
    phase: 'reveal',
  });

  // Auto-advance after 8 seconds
  room.timer = setTimeout(() => {
    if (room.round >= TOTAL_ROUNDS) {
      endGame(room);
    } else {
      startRound(room);
    }
  }, 8000);
}

function endGame(room) {
  if (room.timer) { clearTimeout(room.timer); clearInterval(room.timer); room.timer = null; }
  room.phase = 'ended';

  // Sort players by score
  const ranking = room.players.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    score: room.totalScores[p.id] || 0
  })).sort((a, b) => b.score - a.score);

  broadcastToRoom(room, {
    type: 'gameOver',
    ranking,
    totalScores: room.totalScores,
  });
}

function sendLobbyState(player, room) {
  player.ws.send(JSON.stringify({
    type: 'state',
    code: room.code,
    phase: room.phase,
    players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color })),
    yourId: player.id,
    totalRounds: TOTAL_ROUNDS,
  }));
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

      playerId = 'p' + Date.now() + Math.random().toString(36).slice(2,6);
      roomCode = code;
      const player = {
        id: playerId,
        name: msg.name || 'Host',
        color: PLAYER_COLORS[0],
        ws,
      };
      room.players.push(player);
      room.totalScores[playerId] = 0;
      sendLobbyState(player, room);
      broadcastToRoom(room, { type: 'playerJoined', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color })) });
    }

    else if (msg.type === 'join') {
      const code = (msg.code || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) { ws.send(JSON.stringify({ type: 'error', message: 'Room not found' })); return; }
      if (room.players.length >= 6) { ws.send(JSON.stringify({ type: 'error', message: 'Room full' })); return; }
      if (room.phase !== 'lobby') { ws.send(JSON.stringify({ type: 'error', message: 'Game already started' })); return; }

      playerId = 'p' + Date.now() + Math.random().toString(36).slice(2,6);
      roomCode = code;
      const colorIdx = Math.min(room.players.length, PLAYER_COLORS.length - 1);
      const player = {
        id: playerId,
        name: msg.name || `Player ${room.players.length + 1}`,
        color: PLAYER_COLORS[colorIdx],
        ws,
      };
      room.players.push(player);
      room.totalScores[playerId] = 0;
      sendLobbyState(player, room);
      broadcastToRoom(room, { type: 'playerJoined', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color })) });
    }

    else if (msg.type === 'start') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'lobby') return;
      if (room.players.length < 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Need at least 2 players' }));
        return;
      }
      startRound(room);
    }

    else if (msg.type === 'clue') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'giving_clue') return;
      const broadcaster = room.players[room.broadcasterIdx];
      if (!broadcaster || broadcaster.id !== playerId) return;
      const clue = (msg.clue || '').trim().slice(0, 30);
      if (!clue) return;
      room.clue = clue;
      if (room.timer) { clearInterval(room.timer); room.timer = null; }
      startGuessing(room);
    }

    else if (msg.type === 'guess') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'guessing') return;
      const broadcaster = room.players[room.broadcasterIdx];
      if (broadcaster && broadcaster.id === playerId) return; // broadcaster can't guess
      const val = Math.max(0, Math.min(100, Number(msg.value) || 50));
      room.guesses[playerId] = val;
      // Broadcast updated guesses (without values - just who has guessed)
      broadcastToRoom(room, {
        type: 'guessUpdate',
        guessers: Object.keys(room.guesses),
      });
    }

    else if (msg.type === 'lockGuess') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'guessing') return;
      const broadcaster = room.players[room.broadcasterIdx];
      if (broadcaster && broadcaster.id === playerId) return;
      const val = Math.max(0, Math.min(100, Number(msg.value) || 50));
      room.guesses[playerId] = val;
      if (!room.lockedGuesses) room.lockedGuesses = {};
      room.lockedGuesses[playerId] = true;

      // Check if all guessers locked
      const guessers = room.players.filter(p => p.id !== broadcaster?.id);
      const allLocked = guessers.length > 0 && guessers.every(p => room.lockedGuesses?.[p.id]);

      broadcastToRoom(room, {
        type: 'guessUpdate',
        guessers: Object.keys(room.guesses),
        locked: Object.keys(room.lockedGuesses),
      });

      if (allLocked) {
        if (room.timer) { clearInterval(room.timer); room.timer = null; }
        revealResults(room);
      }
    }

    else if (msg.type === 'playAgain') {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'ended') return;
      // Reset game state
      room.round = 0;
      room.broadcasterIdx = 0;
      room.phase = 'lobby';
      room.totalScores = {};
      room.spectraUsed = [];
      room.players.forEach(p => { room.totalScores[p.id] = 0; });
      if (room.timer) { clearTimeout(room.timer); clearInterval(room.timer); room.timer = null; }
      broadcastToRoom(room, {
        type: 'reset',
        players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color })),
      });
    }
  });

  ws.on('close', () => {
    if (!roomCode) return;
    const room = rooms.get(roomCode);
    if (!room) return;
    room.players = room.players.filter(p => p.id !== playerId);
    room.players.forEach((p, i) => { p.color = PLAYER_COLORS[i % PLAYER_COLORS.length]; });
    if (room.players.length === 0) {
      if (room.timer) { clearTimeout(room.timer); clearInterval(room.timer); }
      rooms.delete(roomCode);
    } else {
      broadcastToRoom(room, { type: 'playerLeft', players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color })) });
    }
  });
});

console.log(`Dial-In WS server running on port ${PORT}`);
