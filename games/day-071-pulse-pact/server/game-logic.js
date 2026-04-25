export const MAX_LANES = 6;
export const COUNTDOWN_MS = 1400;
export const HIT_WINDOWS = { perfect: 70, good: 130, ok: 190 };
export const START_ENERGY = 12;

const CHARS = ['A', 'S', 'D', 'J', 'K', 'L'];

function activeNoteCount(chart) {
  return chart.filter((note) => !note.hit && !note.missed).length;
}

function resolved(note) {
  return note.hit || note.missed;
}

function buildPattern() {
  return [
    [0], [5], [1, 4], [2], [3], [0, 3], [2, 5], [1],
    [4], [0, 2], [3, 5], [1], [2, 4], [0], [5], [1, 3],
    [2], [4], [0, 5], [2, 3], [1], [4, 5], [0], [1, 2],
    [3], [0, 4], [2, 5], [1], [3, 4], [0, 2], [5], [1, 4],
  ];
}

export function createRoomState(code) {
  return {
    code,
    phase: 'lobby',
    result: null,
    players: [],
    hostId: null,
    startAt: null,
    energy: START_ENERGY,
    score: 0,
    combo: 0,
    bestCombo: 0,
    chart: [],
    lastEvent: 'Lobby ready',
    updatedAt: Date.now(),
  };
}

export function addPlayer(room, player) {
  room.players.push({ ...player, lanes: [], hits: 0, perfects: 0, missed: 0 });
  if (!room.hostId) room.hostId = player.id;
  room.updatedAt = Date.now();
}

export function assignLaneGroups(playerIds) {
  const groups = Object.fromEntries(playerIds.map((id) => [id, []]));
  playerIds.forEach((_, index) => {
    for (let lane = index; lane < MAX_LANES; lane += playerIds.length) {
      groups[playerIds[index]].push(lane);
    }
  });
  return groups;
}

export function createChart(playerCount = 2) {
  const pattern = buildPattern();
  const densityBonus = Math.max(0, Math.min(2, playerCount - 3));
  const notes = [];
  let time = 900;

  pattern.forEach((lanes, index) => {
    const expanded = [...lanes];
    if (densityBonus > 0 && index % 5 === 0) expanded.push((lanes[0] + 3) % MAX_LANES);
    if (densityBonus > 1 && index % 7 === 0) expanded.push((lanes[0] + 1) % MAX_LANES);
    [...new Set(expanded)].forEach((lane, laneIndex) => {
      notes.push({
        id: `n-${index}-${laneIndex}`,
        lane,
        time,
        hit: false,
        missed: false,
      });
    });
    time += index % 4 === 3 ? 540 : 420;
  });

  return notes;
}

export function startMatch(room, now = Date.now()) {
  const groups = assignLaneGroups(room.players.map((player) => player.id));
  room.players = room.players.map((player) => ({ ...player, lanes: groups[player.id] || [], hits: 0, perfects: 0, missed: 0 }));
  room.phase = 'countdown';
  room.result = null;
  room.startAt = now + COUNTDOWN_MS;
  room.energy = START_ENERGY;
  room.score = 0;
  room.combo = 0;
  room.bestCombo = 0;
  room.chart = createChart(room.players.length);
  room.lastEvent = 'Get ready';
  room.updatedAt = now;
}

export function scoreHit(deltaAbs) {
  if (deltaAbs <= HIT_WINDOWS.perfect) return { label: 'perfect', points: 100 };
  if (deltaAbs <= HIT_WINDOWS.good) return { label: 'good', points: 60 };
  if (deltaAbs <= HIT_WINDOWS.ok) return { label: 'ok', points: 30 };
  return { label: 'miss', points: 0 };
}

function ensurePlaying(room, now) {
  if (room.phase === 'countdown' && now >= room.startAt) {
    room.phase = 'playing';
    room.lastEvent = 'Go';
  }
}

export function processHit(room, playerId, lane, now = Date.now()) {
  ensurePlaying(room, now);
  if (room.phase !== 'playing') return { ok: false, reason: 'not-playing' };
  const player = room.players.find((entry) => entry.id === playerId);
  if (!player) return { ok: false, reason: 'unknown-player' };
  if (!player.lanes.includes(lane)) return { ok: false, reason: 'wrong-lane' };

  const candidates = room.chart
    .filter((note) => note.lane === lane && !resolved(note))
    .map((note) => ({ note, delta: Math.abs(now - (room.startAt + note.time)) }))
    .sort((a, b) => a.delta - b.delta);

  const target = candidates[0];
  if (!target) return { ok: false, reason: 'no-note' };
  const scored = scoreHit(target.delta);
  if (scored.label === 'miss') return { ok: false, reason: 'outside-window' };

  target.note.hit = true;
  room.score += scored.points;
  room.combo += 1;
  room.bestCombo = Math.max(room.bestCombo, room.combo);
  player.hits += 1;
  if (scored.label === 'perfect') player.perfects += 1;
  room.lastEvent = `${player.name} · ${scored.label.toUpperCase()}`;
  room.updatedAt = now;
  return { ok: true, judgement: scored.label, points: scored.points };
}

export function advanceRoom(room, now = Date.now()) {
  ensurePlaying(room, now);
  if (room.phase !== 'playing') {
    room.updatedAt = now;
    return;
  }

  let anyMiss = false;
  room.chart.forEach((note) => {
    if (resolved(note)) return;
    const expiry = room.startAt + note.time + HIT_WINDOWS.ok;
    if (now > expiry) {
      note.missed = true;
      room.energy -= 1;
      room.combo = 0;
      anyMiss = true;
      const owner = room.players.find((player) => player.lanes.includes(note.lane));
      if (owner) owner.missed += 1;
    }
  });

  if (anyMiss) room.lastEvent = 'Miss';
  if (room.energy <= 0) {
    room.phase = 'ended';
    room.result = 'defeat';
    room.energy = 0;
    room.lastEvent = 'Track collapsed';
  }

  const lastNoteTime = room.chart.length ? Math.max(...room.chart.map((note) => note.time)) : 0;
  if (room.phase === 'playing' && activeNoteCount(room.chart) === 0 && now > room.startAt + lastNoteTime + HIT_WINDOWS.ok) {
    room.phase = 'ended';
    room.result = 'victory';
    room.lastEvent = 'Song cleared';
  }

  room.updatedAt = now;
}

export function serializePublicState(room, now = Date.now()) {
  return {
    code: room.code,
    phase: room.phase,
    result: room.result,
    startAt: room.startAt,
    energy: room.energy,
    score: room.score,
    combo: room.combo,
    bestCombo: room.bestCombo,
    serverNow: now,
    laneChars: CHARS,
    lastEvent: room.lastEvent,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      lanes: player.lanes,
      hits: player.hits,
      perfects: player.perfects,
      missed: player.missed,
    })),
    chart: room.chart.map((note) => ({
      id: note.id,
      lane: note.lane,
      time: note.time,
      hit: note.hit,
      missed: note.missed,
    })),
  };
}
