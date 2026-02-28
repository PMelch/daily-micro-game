/**
 * Sync or Sink - Core Game Logic (testable)
 */

const TOTAL_ROUNDS = 5;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function createRoom(hostId, hostName) {
  return {
    code: generateRoomCode(),
    hostId,
    players: [{ id: hostId, name: hostName, score: 0 }],
    state: 'lobby',
    round: 0,
    roundStartTime: null,
    presses: [],
    roundResults: [],
  };
}

function addPlayer(room, playerId, playerName) {
  if (room.state !== 'lobby') return { error: 'game_started' };
  if (room.players.length >= MAX_PLAYERS) return { error: 'room_full' };
  if (room.players.find(p => p.id === playerId)) return { error: 'already_joined' };
  room.players.push({ id: playerId, name: playerName, score: 0 });
  return { ok: true };
}

function removePlayer(room, playerId) {
  room.players = room.players.filter(p => p.id !== playerId);
  if (room.hostId === playerId && room.players.length > 0) {
    room.hostId = room.players[0].id;
  }
  return room;
}

function startGame(room, requesterId) {
  if (requesterId !== room.hostId) return { error: 'not_host' };
  if (room.players.length < MIN_PLAYERS) return { error: 'not_enough_players' };
  if (room.state !== 'lobby') return { error: 'wrong_state' };
  room.state = 'countdown';
  room.round = 0;
  room.roundResults = [];
  room.players.forEach(p => { p.score = 0; });
  return { ok: true };
}

function startRound(room) {
  room.round += 1;
  room.state = 'active';
  room.presses = [];
  room.roundStartTime = Date.now();
  return { round: room.round, startTime: room.roundStartTime };
}

function recordPress(room, playerId) {
  if (room.state !== 'active') return { error: 'not_active' };
  if (room.presses.find(p => p.playerId === playerId)) return { error: 'already_pressed' };
  if (!room.players.find(p => p.id === playerId)) return { error: 'not_in_room' };
  room.presses.push({ playerId, timestamp: Date.now() });
  return { ok: true, pressCount: room.presses.length };
}

function calculateRoundResult(room) {
  const pressingPlayerIds = room.presses.map(p => p.playerId);
  const allPlayerIds = room.players.map(p => p.id);
  const missedPlayers = allPlayerIds.filter(id => !pressingPlayerIds.includes(id));

  if (room.presses.length < 2) {
    return { syncScore: 0, spreadMs: null, grade: 'F', pressDetails: room.presses, missedPlayers };
  }

  const timestamps = room.presses.map(p => p.timestamp);
  const minT = Math.min(...timestamps);
  const maxT = Math.max(...timestamps);
  const spreadMs = maxT - minT;

  // 0ms = 100pts, 1000ms = 0pts
  let syncScore = Math.max(0, Math.round(100 - (spreadMs / 10)));
  if (missedPlayers.length === 0) syncScore = Math.min(100, syncScore + 10);

  let grade;
  if (syncScore >= 95) grade = 'S';
  else if (syncScore >= 80) grade = 'A';
  else if (syncScore >= 60) grade = 'B';
  else if (syncScore >= 40) grade = 'C';
  else if (syncScore >= 20) grade = 'D';
  else grade = 'F';

  return { syncScore, spreadMs, grade, pressDetails: room.presses, missedPlayers };
}

function finalizeRound(room) {
  const result = calculateRoundResult(room);
  room.roundResults.push({ round: room.round, ...result });
  room.presses.forEach(press => {
    const player = room.players.find(p => p.id === press.playerId);
    if (player) player.score += Math.round(result.syncScore / room.players.length);
  });
  room.state = room.round >= TOTAL_ROUNDS ? 'finished' : 'results';
  return result;
}

function getLeaderboard(room) {
  return [...room.players].sort((a, b) => b.score - a.score);
}

module.exports = {
  generateRoomCode, createRoom, addPlayer, removePlayer, startGame,
  startRound, recordPress, calculateRoundResult, finalizeRound, getLeaderboard,
  TOTAL_ROUNDS, MIN_PLAYERS, MAX_PLAYERS,
};
