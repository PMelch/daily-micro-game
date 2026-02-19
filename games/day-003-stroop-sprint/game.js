// Stroop Sprint - Game Logic

export const COLORS = [
  { name: 'RED',    hex: '#ff4444' },
  { name: 'BLUE',   hex: '#4488ff' },
  { name: 'GREEN',  hex: '#44dd44' },
  { name: 'YELLOW', hex: '#ffcc00' },
  { name: 'PURPLE', hex: '#cc44ff' },
  { name: 'ORANGE', hex: '#ff8844' },
];

export const INITIAL_TIME_LIMIT = 3000; // ms

export function generateRound() {
  const wordIdx = Math.floor(Math.random() * COLORS.length);
  let inkIdx;
  do {
    inkIdx = Math.floor(Math.random() * COLORS.length);
  } while (inkIdx === wordIdx);
  return {
    word: COLORS[wordIdx].name,
    inkColor: COLORS[inkIdx].name,
    inkHex: COLORS[inkIdx].hex,
  };
}

export function checkAnswer(round, answer) {
  return answer === round.inkColor;
}

export function createGameState() {
  return { lives: 3, score: 0, round: 0, gameOver: false };
}

export function handleAnswer(state, round, answer) {
  const correct = checkAnswer(round, answer);
  const next = {
    ...state,
    round: state.round + 1,
    score: correct ? state.score + 1 : state.score,
    lives: correct ? state.lives : state.lives - 1,
  };
  if (next.lives <= 0) next.gameOver = true;
  return next;
}

export function getTimeLimit(round) {
  // Starts at INITIAL_TIME_LIMIT, decreases by 100ms every 2 rounds, min 1000ms
  return Math.max(1000, INITIAL_TIME_LIMIT - Math.floor(round / 2) * 100);
}
