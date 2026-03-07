// Lone Wolf — Game Logic Module
// Pure functions + state management for the WebSocket server

export const GAME_STATES = {
  LOBBY: 'LOBBY',
  PICKING: 'PICKING',
  REVEAL: 'REVEAL',
  SCORES: 'SCORES',
};

const MAX_PLAYERS = 6;
const TOTAL_ROUNDS = 8;

// Shared rooms map (used by server and tests)
const rooms = new Map();

export function getRooms() {
  return rooms;
}

/** Generate a random 4-letter uppercase code */
function generateCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do {
    code = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  } while (rooms.has(code));
  return code;
}

/** All questions with 8 options each — keys for i18n */
const QUESTIONS = [
  {
    categoryKey: 'cat_planet',
    options: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
  },
  {
    categoryKey: 'cat_fruit',
    options: ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Pear', 'Strawberry'],
  },
  {
    categoryKey: 'cat_color',
    options: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black'],
  },
  {
    categoryKey: 'cat_sport',
    options: ['Football', 'Tennis', 'Swimming', 'Basketball', 'Cycling', 'Boxing', 'Golf', 'Running'],
  },
  {
    categoryKey: 'cat_animal',
    options: ['Lion', 'Elephant', 'Eagle', 'Dolphin', 'Tiger', 'Snake', 'Bear', 'Fox'],
  },
  {
    categoryKey: 'cat_country',
    options: ['France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Poland', 'Sweden', 'Greece'],
  },
  {
    categoryKey: 'cat_instrument',
    options: ['Guitar', 'Piano', 'Violin', 'Drums', 'Trumpet', 'Flute', 'Saxophone', 'Harp'],
  },
  {
    categoryKey: 'cat_season',
    options: ['Spring', 'Summer', 'Autumn', 'Winter', 'Rain', 'Snow', 'Thunder', 'Wind'],
  },
  {
    categoryKey: 'cat_ocean',
    options: ['Pacific', 'Atlantic', 'Indian', 'Arctic', 'Mediterranean', 'Caribbean', 'Baltic', 'Coral Sea'],
  },
  {
    categoryKey: 'cat_day',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holiday'],
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Create a new room */
export function createRoom(hostName) {
  const code = generateCode();
  const room = {
    code,
    host: hostName,
    state: GAME_STATES.LOBBY,
    players: [{ name: hostName, score: 0 }],
    questions: [],
    currentRound: 0,
    currentQuestion: null,
    picks: {},
    roundHistory: [],
  };
  rooms.set(code, room);
  return room;
}

/** Join an existing room */
export function joinRoom(code, playerName) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.state !== GAME_STATES.LOBBY) return { success: false, error: 'game_started' };
  if (room.players.length >= MAX_PLAYERS) return { success: false, error: 'room_full' };
  room.players.push({ name: playerName, score: 0 });
  return { success: true, room };
}

/** Get current room state */
export function getRoomState(code) {
  return rooms.get(code) || null;
}

/** Start the game — picks random questions */
export function startGame(code) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.players.length < 2) return { success: false, error: 'not_enough_players' };
  if (room.state !== GAME_STATES.LOBBY) return { success: false, error: 'wrong_state' };

  room.questions = shuffleArray(QUESTIONS).slice(0, TOTAL_ROUNDS);
  room.currentRound = 0;
  room.currentQuestion = room.questions[0];
  room.picks = {};
  room.roundHistory = [];
  room.state = GAME_STATES.PICKING;
  return { success: true };
}

/** Submit a pick for a player */
export function submitPick(code, playerName, optionIndex) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };
  if (room.state !== GAME_STATES.PICKING) return { success: false, error: 'wrong_state' };
  if (optionIndex < 0 || optionIndex >= room.currentQuestion.options.length) {
    return { success: false, error: 'invalid_option' };
  }
  room.picks[playerName] = optionIndex;
  return { success: true, totalPicks: Object.keys(room.picks).length };
}

/** Get list of players who picked uniquely (no one else picked same option) */
export function getUniquepicks(picks) {
  const countByOption = {};
  for (const opt of Object.values(picks)) {
    countByOption[opt] = (countByOption[opt] || 0) + 1;
  }
  return Object.keys(picks).filter(player => countByOption[picks[player]] === 1);
}

/** Calculate total scores from round history */
export function calculateScores(history) {
  const scores = {};
  for (const round of history) {
    const winners = getUniquepicks(round.picks);
    for (const player of winners) {
      scores[player] = (scores[player] || 0) + 1;
    }
  }
  // Ensure all players have an entry
  for (const round of history) {
    for (const player of Object.keys(round.picks)) {
      if (!(player in scores)) scores[player] = 0;
    }
  }
  return scores;
}

/** Resolve the current round — record picks, transition state */
export function resolveRound(code) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'room_not_found' };

  // Record round picks (all players who didn't pick get no score recorded)
  const roundData = {
    question: room.currentQuestion,
    picks: { ...room.picks },
    winners: getUniquepicks(room.picks),
  };
  room.roundHistory.push(roundData);

  const isLastRound = room.currentRound >= room.questions.length - 1;
  room.state = isLastRound ? GAME_STATES.SCORES : GAME_STATES.REVEAL;

  // Update player scores
  for (const player of roundData.winners) {
    const p = room.players.find(p => p.name === player);
    if (p) p.score++;
  }

  return { success: true, roundData, isLastRound };
}

/** Advance to the next round */
export function nextRound(code) {
  const room = rooms.get(code);
  if (!room || room.state !== GAME_STATES.REVEAL) return { success: false, error: 'wrong_state' };

  room.currentRound++;
  room.currentQuestion = room.questions[room.currentRound];
  room.picks = {};
  room.state = GAME_STATES.PICKING;
  return { success: true };
}

/** Remove player from room */
export function leaveRoom(code, playerName) {
  const room = rooms.get(code);
  if (!room) return;
  room.players = room.players.filter(p => p.name !== playerName);
  delete room.picks[playerName];
  if (room.players.length === 0) {
    rooms.delete(code);
  } else if (room.host === playerName && room.players.length > 0) {
    room.host = room.players[0].name;
  }
}
