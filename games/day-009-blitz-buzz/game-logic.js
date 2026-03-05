// Blitz Buzz — Pure Game Logic
// Real-time quiz buzzer: first to buzz gets to answer

// ─── Question Bank ──────────────────────────────────────────────────────────

export const QUESTIONS = [
  // Geografie
  { text: 'Was ist die Hauptstadt von Australien?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 },
  { text: 'Welcher Fluss fließt durch Wien?', options: ['Rhein', 'Donau', 'Elbe', 'Inn'], correct: 1 },
  { text: 'Welches ist das flächengrößte Land der Welt?', options: ['China', 'USA', 'Kanada', 'Russland'], correct: 3 },
  { text: 'In welchem Land liegt der Kilimandscharo?', options: ['Kenia', 'Tansania', 'Äthiopien', 'Uganda'], correct: 1 },
  { text: 'Wie viele Einwohner hat die Erde (ca.)?', options: ['6 Mrd', '7 Mrd', '8 Mrd', '10 Mrd'], correct: 2 },
  { text: 'Welches Meer trennt Europa von Afrika?', options: ['Rotes Meer', 'Schwarzes Meer', 'Kaspisches Meer', 'Mittelmeer'], correct: 3 },
  { text: 'Welcher Kontinent ist der kleinste?', options: ['Europa', 'Australien', 'Antarktis', 'Südamerika'], correct: 1 },

  // Wissenschaft & Natur
  { text: 'Welches ist das leichteste Element im Periodensystem?', options: ['Helium', 'Lithium', 'Wasserstoff', 'Beryllium'], correct: 2 },
  { text: 'Wie viele Knochen hat ein erwachsener Mensch?', options: ['186', '206', '246', '226'], correct: 1 },
  { text: 'Bei welcher Temperatur siedet Wasser (auf Meereshöhe)?', options: ['90°C', '95°C', '100°C', '105°C'], correct: 2 },
  { text: 'Was ist die schnellste Geschwindigkeit im Universum?', options: ['Schallgeschwindigkeit', 'Lichtgeschwindigkeit', 'Elektronengeschwindigkeit', 'Neutrinogeschwindigkeit'], correct: 1 },
  { text: 'Wer entwickelte die Relativitätstheorie?', options: ['Newton', 'Hawking', 'Bohr', 'Einstein'], correct: 3 },
  { text: 'Welches Gas ist für den Treibhauseffekt hauptverantwortlich?', options: ['Sauerstoff', 'Stickstoff', 'CO₂', 'Argon'], correct: 2 },
  { text: 'Wie viele Planeten hat unser Sonnensystem?', options: ['7', '8', '9', '10'], correct: 1 },

  // Geschichte
  { text: 'In welchem Jahr fiel die Berliner Mauer?', options: ['1987', '1988', '1989', '1990'], correct: 2 },
  { text: 'Wer war der erste Mensch auf dem Mond?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correct: 1 },
  { text: 'Wann begann der Zweite Weltkrieg?', options: ['1935', '1937', '1939', '1941'], correct: 2 },
  { text: 'Wer malte die Mona Lisa?', options: ['Michelangelo', 'Raffael', 'Dürer', 'Leonardo da Vinci'], correct: 3 },

  // Pop-Kultur & Unterhaltung
  { text: 'Wie viele Oscars gewann "Titanic" (1997)?', options: ['9', '11', '13', '7'], correct: 1 },
  { text: 'Aus wie vielen Büchern besteht die Harry-Potter-Reihe?', options: ['5', '6', '7', '8'], correct: 2 },
  { text: 'Wer singt "Bohemian Rhapsody"?', options: ['The Beatles', 'Rolling Stones', 'Led Zeppelin', 'Queen'], correct: 3 },
  { text: 'In welcher Stadt spielt "Schitt\'s Creek"?', options: ['Boston', 'Toronto', 'Schitt\'s Creek', 'Albany'], correct: 2 },
  { text: 'Welche Farbe hat Yoda\'s Lichtschwert?', options: ['Blau', 'Rot', 'Grün', 'Lila'], correct: 2 },

  // Sport
  { text: 'Wie viele Spieler steht ein Fußballteam auf dem Feld?', options: ['10', '11', '12', '9'], correct: 1 },
  { text: 'Wie oft hat Österreich Fußball-Weltmeister gewonnen?', options: ['0', '1', '2', '3'], correct: 0 },
  { text: 'Wie lange dauert ein reguläres Tennis-Match mindestens?', options: ['1 Satz', '2 Sätze', '3 Sätze', 'unbestimmt'], correct: 3 },
  { text: 'In welchem Land fanden die ersten modernen Olympischen Spiele statt?', options: ['Frankreich', 'England', 'Griechenland', 'USA'], correct: 2 },

  // Technik & Internet
  { text: 'Wofür steht "HTTP"?', options: ['HyperText Transfer Protocol', 'High Tech Transfer Process', 'Home Terminal Transfer Platform', 'HyperText Terminal Protocol'], correct: 0 },
  { text: 'Wann wurde das iPhone vorgestellt?', options: ['2005', '2006', '2007', '2008'], correct: 2 },
  { text: 'Was bedeutet "CPU"?', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Processing Utility', 'Central Power Unit'], correct: 0 },

  // Alltag
  { text: 'Wie viele Stunden hat ein Tag?', options: ['22', '23', '24', '25'], correct: 2 },
  { text: 'Wie viele Tage hat ein Schaltjahr?', options: ['364', '365', '366', '367'], correct: 2 },
  { text: 'Welche Farbe entsteht, wenn man Blau und Gelb mischt?', options: ['Orange', 'Grün', 'Violett', 'Braun'], correct: 1 },
  { text: 'Wie viele Seiten hat ein Hexagon?', options: ['5', '6', '7', '8'], correct: 1 },
  { text: 'Was ist 12 × 12?', options: ['132', '144', '124', '148'], correct: 1 },
];

// ─── Room Management ────────────────────────────────────────────────────────

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Create a new game room.
 */
export function createRoom(hostName) {
  return {
    code: generateCode(),
    phase: 'lobby',       // 'lobby' | 'question' | 'answering' | 'reveal' | 'gameover'
    players: [
      { name: hostName, score: 0, isHost: true, id: hostName },
    ],
    questionSet: [],
    questionIndex: 0,
    buzzedBy: null,
    lastAnswer: null,     // { correct, player, choice }
  };
}

/**
 * Add a player to a room.
 */
export function joinRoom(room, playerName) {
  if (room.phase !== 'lobby') {
    return { ok: false, reason: 'Game already started' };
  }
  if (room.players.length >= 20) {
    return { ok: false, reason: 'Room is full' };
  }
  room.players.push({ name: playerName, score: 0, isHost: false, id: playerName });
  return { ok: true };
}

/**
 * Check if the game can be started.
 */
export function canStartGame(room) {
  return room.players.length >= 2;
}

/**
 * Shuffle an array (Fisher-Yates).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Start the game.
 */
export function startGame(room) {
  room.questionSet = shuffle(QUESTIONS).slice(0, 10);
  room.questionIndex = 0;
  room.buzzedBy = null;
  room.phase = 'question';
}

/**
 * A player buzzes in. Only the first buzz in 'question' phase counts.
 */
export function buzz(room, playerName) {
  if (room.phase !== 'question') {
    return { ok: false, reason: 'Not in question phase' };
  }
  room.buzzedBy = playerName;
  room.phase = 'answering';
  return { ok: true, player: playerName };
}

/**
 * The buzzing player submits an answer.
 * @param {object} room
 * @param {string} playerName
 * @param {number} choiceIndex
 */
export function submitAnswer(room, playerName, choiceIndex) {
  if (room.phase !== 'answering') {
    return { ok: false, reason: 'Not in answering phase' };
  }
  if (room.buzzedBy !== playerName) {
    return { ok: false, reason: 'Not your turn to answer' };
  }

  const question = room.questionSet[room.questionIndex];
  const correct = choiceIndex === question.correct;

  const player = room.players.find(p => p.name === playerName);
  if (player) {
    player.score += correct ? 3 : -1;
  }

  room.lastAnswer = { correct, player: playerName, choice: choiceIndex };
  room.phase = 'reveal';
  return { ok: true, correct };
}

/**
 * Advance to the next question (or end the game).
 */
export function nextQuestion(room) {
  room.questionIndex += 1;
  room.buzzedBy = null;
  room.lastAnswer = null;

  if (room.questionIndex >= 10) {
    room.phase = 'gameover';
  } else {
    room.phase = 'question';
  }
}

/**
 * Get a public-safe snapshot of room state.
 */
export function getRoomState(room) {
  const q = room.questionSet[room.questionIndex];
  return {
    code: room.code,
    phase: room.phase,
    players: room.players.map(p => ({ name: p.name, score: p.score, isHost: p.isHost })),
    questionIndex: room.questionIndex,
    totalQuestions: 10,
    currentQuestion: q ? { text: q.text, options: q.options } : null,
    buzzedBy: room.buzzedBy,
    lastAnswer: room.lastAnswer
      ? { correct: room.lastAnswer.correct, player: room.lastAnswer.player, correctIndex: q?.correct }
      : null,
  };
}

export function isGameOver(room) {
  return room.phase === 'gameover';
}

export function getFinalScores(room) {
  return [...room.players].sort((a, b) => b.score - a.score);
}
