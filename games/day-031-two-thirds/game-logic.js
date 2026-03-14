// Two-Thirds — Game Logic
// Classic game theory: pick 0-100, closest to 2/3 of the group average wins

export const GAME_STATES = {
  LOBBY: 'lobby',
  GUESSING: 'guessing',
  REVEAL: 'reveal',
  FINISHED: 'finished',
};

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

export function createRoom(hostName) {
  const code = generateRoomCode();
  const room = {
    code,
    host: hostName,
    state: GAME_STATES.LOBBY,
    players: [{ name: hostName, score: 0, connected: true }],
    currentRound: 0,
    totalRounds: 5,
    guesses: {}, // playerName -> number
    roundHistory: [], // [{guesses, target, winners, average}]
  };
  rooms.set(code, room);
  return { success: true, code, room };
}

export function joinRoom(code, playerName) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.state !== GAME_STATES.LOBBY) return { success: false, error: 'game_started' };
  if (room.players.length >= 6) return { success: false, error: 'room_full' };
  if (room.players.find(p => p.name === playerName)) return { success: false, error: 'name_taken' };

  room.players.push({ name: playerName, score: 0, connected: true });
  return { success: true, code, room };
}

export function startGame(code, hostName) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.host !== hostName) return { success: false, error: 'not_host' };
  if (room.players.length < 2) return { success: false, error: 'need_more_players' };
  if (room.state !== GAME_STATES.LOBBY) return { success: false, error: 'already_started' };

  room.state = GAME_STATES.GUESSING;
  room.currentRound = 1;
  room.guesses = {};
  return { success: true, room };
}

export function submitGuess(code, playerName, guess) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.state !== GAME_STATES.GUESSING) return { success: false, error: 'not_guessing' };
  if (!room.players.find(p => p.name === playerName)) return { success: false, error: 'not_in_room' };
  if (room.guesses[playerName] !== undefined) return { success: false, error: 'already_guessed' };

  const num = Math.round(Number(guess));
  if (isNaN(num) || num < 0 || num > 100) return { success: false, error: 'invalid_guess' };

  room.guesses[playerName] = num;

  // Check if all connected players have guessed
  const connectedPlayers = room.players.filter(p => p.connected);
  const allGuessed = connectedPlayers.every(p => room.guesses[p.name] !== undefined);

  return { success: true, allGuessed, room };
}

export function resolveRound(code) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.state !== GAME_STATES.GUESSING) return { success: false, error: 'not_guessing' };

  const guessEntries = Object.entries(room.guesses);
  if (guessEntries.length === 0) return { success: false, error: 'no_guesses' };

  // Calculate 2/3 of average
  const sum = guessEntries.reduce((acc, [, v]) => acc + v, 0);
  const average = sum / guessEntries.length;
  const target = Math.round((2 / 3) * average);

  // Find winner(s) — closest to target
  let minDist = Infinity;
  for (const [, guess] of guessEntries) {
    const dist = Math.abs(guess - target);
    if (dist < minDist) minDist = dist;
  }
  const winners = guessEntries
    .filter(([, guess]) => Math.abs(guess - target) === minDist)
    .map(([name]) => name);

  // Award points
  const points = winners.length === 1 ? 3 : 1;
  for (const w of winners) {
    const player = room.players.find(p => p.name === w);
    if (player) player.score += points;
  }

  const roundResult = {
    round: room.currentRound,
    guesses: { ...room.guesses },
    average: Math.round(average * 10) / 10,
    target,
    winners,
    minDist,
  };
  room.roundHistory.push(roundResult);

  const isLastRound = room.currentRound >= room.totalRounds;
  if (isLastRound) {
    room.state = GAME_STATES.FINISHED;
  } else {
    room.state = GAME_STATES.REVEAL;
  }

  return { success: true, roundResult, isLastRound, room };
}

export function nextRound(code) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.state !== GAME_STATES.REVEAL) return { success: false, error: 'not_reveal' };

  room.currentRound++;
  room.guesses = {};
  room.state = GAME_STATES.GUESSING;
  return { success: true, room };
}

export function leaveRoom(code, playerName) {
  const room = rooms.get(code);
  if (!room) return { success: false };
  const player = room.players.find(p => p.name === playerName);
  if (player) player.connected = false;

  // Clean up empty rooms
  if (room.players.every(p => !p.connected)) {
    rooms.delete(code);
    return { success: true, deleted: true };
  }
  return { success: true, deleted: false, room };
}

export function getRoomState(code) {
  return rooms.get(code) || null;
}

export function getRooms() {
  return [...rooms.values()];
}

export function calculateTarget(guesses) {
  // Pure function for testing
  if (!guesses || guesses.length === 0) return 0;
  const avg = guesses.reduce((a, b) => a + b, 0) / guesses.length;
  return Math.round((2 / 3) * avg);
}
