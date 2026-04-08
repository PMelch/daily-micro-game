/**
 * Vibe Check – game logic (pure functions, no DOM)
 * Day 054 – Pass & Play
 */

export const SPECTRUMS = [
  { key: 'hot_cold',         left_de: 'Heiß',       right_de: 'Kalt',       left_en: 'Hot',       right_en: 'Cold',       left_fr: 'Chaud',     right_fr: 'Froid',      left_it: 'Caldo',     right_it: 'Freddo',    left_es: 'Caliente',   right_es: 'Frío' },
  { key: 'fast_slow',        left_de: 'Schnell',    right_de: 'Langsam',    left_en: 'Fast',      right_en: 'Slow',       left_fr: 'Rapide',    right_fr: 'Lent',       left_it: 'Veloce',    right_it: 'Lento',     left_es: 'Rápido',     right_es: 'Lento' },
  { key: 'loud_quiet',       left_de: 'Laut',       right_de: 'Leise',      left_en: 'Loud',      right_en: 'Quiet',      left_fr: 'Fort',      right_fr: 'Silencieux', left_it: 'Rumoroso',  right_it: 'Silenzioso',left_es: 'Ruidoso',    right_es: 'Silencioso' },
  { key: 'ancient_modern',   left_de: 'Uralt',      right_de: 'Modern',     left_en: 'Ancient',   right_en: 'Modern',     left_fr: 'Ancien',    right_fr: 'Moderne',    left_it: 'Antico',    right_it: 'Moderno',   left_es: 'Antiguo',    right_es: 'Moderno' },
  { key: 'big_small',        left_de: 'Riesig',     right_de: 'Winzig',     left_en: 'Huge',      right_en: 'Tiny',       left_fr: 'Énorme',    right_fr: 'Minuscule',  left_it: 'Enorme',    right_it: 'Minuscolo', left_es: 'Enorme',     right_es: 'Diminuto' },
  { key: 'natural_artif',    left_de: 'Natürlich',  right_de: 'Künstlich',  left_en: 'Natural',   right_en: 'Artificial', left_fr: 'Naturel',   right_fr: 'Artificiel', left_it: 'Naturale',  right_it: 'Artificiale',left_es: 'Natural',   right_es: 'Artificial' },
  { key: 'serious_funny',    left_de: 'Ernst',      right_de: 'Lustig',     left_en: 'Serious',   right_en: 'Funny',      left_fr: 'Sérieux',   right_fr: 'Drôle',      left_it: 'Serio',     right_it: 'Divertente',left_es: 'Serio',     right_es: 'Gracioso' },
  { key: 'danger_safe',      left_de: 'Gefährlich', right_de: 'Sicher',     left_en: 'Dangerous', right_en: 'Safe',       left_fr: 'Dangereux', right_fr: 'Sûr',        left_it: 'Pericoloso',right_it: 'Sicuro',    left_es: 'Peligroso',  right_es: 'Seguro' },
  { key: 'expensive_cheap',  left_de: 'Teuer',      right_de: 'Billig',     left_en: 'Expensive', right_en: 'Cheap',      left_fr: 'Cher',      right_fr: 'Bon marché', left_it: 'Caro',      right_it: 'Economico', left_es: 'Caro',       right_es: 'Barato' },
  { key: 'sad_happy',        left_de: 'Traurig',    right_de: 'Fröhlich',   left_en: 'Sad',       right_en: 'Happy',      left_fr: 'Triste',    right_fr: 'Joyeux',     left_it: 'Triste',    right_it: 'Felice',    left_es: 'Triste',     right_es: 'Alegre' },
  { key: 'ugly_beautiful',   left_de: 'Hässlich',   right_de: 'Wunderschön',left_en: 'Ugly',      right_en: 'Beautiful',  left_fr: 'Laid',      right_fr: 'Beau',       left_it: 'Brutto',    right_it: 'Bello',     left_es: 'Feo',        right_es: 'Hermoso' },
  { key: 'weak_strong',      left_de: 'Schwach',    right_de: 'Stark',      left_en: 'Weak',      right_en: 'Strong',     left_fr: 'Faible',    right_fr: 'Fort',       left_it: 'Debole',    right_it: 'Forte',     left_es: 'Débil',      right_es: 'Fuerte' },
  { key: 'boring_exciting',  left_de: 'Langweilig', right_de: 'Aufregend',  left_en: 'Boring',    right_en: 'Exciting',   left_fr: 'Ennuyeux',  right_fr: 'Passionnant',left_it: 'Noioso',    right_it: 'Eccitante', left_es: 'Aburrido',   right_es: 'Emocionante' },
  { key: 'dark_bright',      left_de: 'Dunkel',     right_de: 'Hell',       left_en: 'Dark',      right_en: 'Bright',     left_fr: 'Sombre',    right_fr: 'Lumineux',   left_it: 'Scuro',     right_it: 'Luminoso',  left_es: 'Oscuro',     right_es: 'Brillante' },
  { key: 'soft_hard',        left_de: 'Weich',      right_de: 'Hart',       left_en: 'Soft',      right_en: 'Hard',       left_fr: 'Doux',      right_fr: 'Dur',        left_it: 'Morbido',   right_it: 'Duro',      left_es: 'Suave',      right_es: 'Duro' },
  { key: 'hero_villain',     left_de: 'Held',       right_de: 'Bösewicht',  left_en: 'Hero',      right_en: 'Villain',    left_fr: 'Héros',     right_fr: 'Méchant',    left_it: 'Eroe',      right_it: 'Cattivo',   left_es: 'Héroe',      right_es: 'Villano' },
  { key: 'urban_rural',      left_de: 'Städtisch',  right_de: 'Ländlich',   left_en: 'Urban',     right_en: 'Rural',      left_fr: 'Urbain',    right_fr: 'Rural',      left_it: 'Urbano',    right_it: 'Rurale',    left_es: 'Urbano',     right_es: 'Rural' },
  { key: 'work_play',        left_de: 'Arbeit',     right_de: 'Freizeit',   left_en: 'Work',      right_en: 'Play',       left_fr: 'Travail',   right_fr: 'Jeu',        left_it: 'Lavoro',    right_it: 'Gioco',     left_es: 'Trabajo',    right_es: 'Juego' },
  { key: 'complex_simple',   left_de: 'Komplex',    right_de: 'Einfach',    left_en: 'Complex',   right_en: 'Simple',     left_fr: 'Complexe',  right_fr: 'Simple',     left_it: 'Complesso', right_it: 'Semplice',  left_es: 'Complejo',   right_es: 'Simple' },
  { key: 'past_future',      left_de: 'Vergangenheit', right_de: 'Zukunft', left_en: 'Past',      right_en: 'Future',     left_fr: 'Passé',     right_fr: 'Futur',      left_it: 'Passato',   right_it: 'Futuro',    left_es: 'Pasado',     right_es: 'Futuro' },
];

/**
 * Calculate score based on distance between target and guess.
 * Both positions are 0-100.
 * Returns 4 (bullseye), 3 (close), 2 (warm), or 1 (cold).
 */
export function calculateScore(targetPos, guessPos) {
  const dist = Math.abs(targetPos - guessPos);
  if (dist <= 8)  return 4; // bullseye
  if (dist <= 18) return 3; // close
  if (dist <= 30) return 2; // warm
  return 1;                  // cold
}

/**
 * Returns the score zone label for a given score.
 */
export function scoreLabel(score) {
  switch (score) {
    case 4: return 'bullseye';
    case 3: return 'close';
    case 2: return 'warm';
    default: return 'cold';
  }
}

/**
 * Get a random target position (kept away from extreme edges).
 */
export function getRandomTargetPosition() {
  return Math.floor(Math.random() * 71) + 15; // 15-85
}

/**
 * Pick N unique spectrums from the list (shuffled).
 */
export function pickSpectrums(count) {
  const shuffled = [...SPECTRUMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, SPECTRUMS.length));
}

/**
 * Initialize a new game state.
 * @param {string[]} playerNames
 * @returns {Object} game state
 */
export function initGame(playerNames) {
  const numPlayers = playerNames.length;
  const totalRounds = numPlayers * 2; // each player gives clues twice
  const spectrums = pickSpectrums(totalRounds);

  return {
    players: playerNames.map(name => ({ name, score: 0 })),
    numPlayers,
    totalRounds,
    currentRound: 0,       // 0-indexed
    clueGiverIndex: 0,     // whose turn to give clue
    spectrums,
    currentSpectrum: spectrums[0],
    targetPos: getRandomTargetPosition(),
    phase: 'clue',         // 'clue' | 'guess' | 'reveal' | 'done'
    currentClue: '',
    guessPos: 50,
    roundScoreLog: [],     // {clueGiver, clue, targetPos, guessPos, score}
  };
}

/**
 * Advance to the next round.
 * Returns updated state.
 */
export function nextRound(state) {
  const nextRound = state.currentRound + 1;
  if (nextRound >= state.totalRounds) {
    return { ...state, phase: 'done' };
  }
  const nextGiverIndex = nextRound % state.numPlayers;
  return {
    ...state,
    currentRound: nextRound,
    clueGiverIndex: nextGiverIndex,
    currentSpectrum: state.spectrums[nextRound],
    targetPos: getRandomTargetPosition(),
    phase: 'clue',
    currentClue: '',
    guessPos: 50,
  };
}

/**
 * Submit a clue and advance phase to 'guess'.
 */
export function submitClue(state, clue) {
  if (!clue || !clue.trim()) return state;
  return {
    ...state,
    currentClue: clue.trim(),
    phase: 'guess',
  };
}

/**
 * Submit a guess position and advance phase to 'reveal'.
 */
export function submitGuess(state, guessPos) {
  const score = calculateScore(state.targetPos, guessPos);
  const clueGiverName = state.players[state.clueGiverIndex].name;
  const updatedPlayers = state.players.map((p, i) => {
    if (i === state.clueGiverIndex) return { ...p, score: p.score + score };
    return p;
  });
  const logEntry = {
    round: state.currentRound,
    clueGiver: clueGiverName,
    clue: state.currentClue,
    targetPos: state.targetPos,
    guessPos,
    score,
  };
  return {
    ...state,
    guessPos,
    players: updatedPlayers,
    phase: 'reveal',
    roundScoreLog: [...state.roundScoreLog, logEntry],
  };
}

/**
 * Get winner(s) – returns array of player names with highest score.
 */
export function getWinners(state) {
  const maxScore = Math.max(...state.players.map(p => p.score));
  return state.players.filter(p => p.score === maxScore).map(p => p.name);
}
