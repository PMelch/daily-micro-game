/**
 * 5 Stroke – Pass & Play Drawing Duel
 * Pure game logic (framework-agnostic, testable with bun test)
 */

// ────────────────────────────────────────────────────────────────────────────
// Word pair database
// ────────────────────────────────────────────────────────────────────────────
const WORD_PAIRS = [
  { de: 'Hund',          en: 'Dog',       fr: 'Chien',     it: 'Cane',        es: 'Perro'      },
  { de: 'Katze',         en: 'Cat',       fr: 'Chat',      it: 'Gatto',       es: 'Gato'       },
  { de: 'Haus',          en: 'House',     fr: 'Maison',    it: 'Casa',        es: 'Casa'       },
  { de: 'Auto',          en: 'Car',       fr: 'Voiture',   it: 'Auto',        es: 'Coche'      },
  { de: 'Baum',          en: 'Tree',      fr: 'Arbre',     it: 'Albero',      es: 'Árbol'      },
  { de: 'Sonne',         en: 'Sun',       fr: 'Soleil',    it: 'Sole',        es: 'Sol'        },
  { de: 'Mond',          en: 'Moon',      fr: 'Lune',      it: 'Luna',        es: 'Luna'       },
  { de: 'Herz',          en: 'Heart',     fr: 'Cœur',      it: 'Cuore',       es: 'Corazón'    },
  { de: 'Stern',         en: 'Star',      fr: 'Étoile',    it: 'Stella',      es: 'Estrella'   },
  { de: 'Fisch',         en: 'Fish',      fr: 'Poisson',   it: 'Pesce',       es: 'Pez'        },
  { de: 'Vogel',         en: 'Bird',      fr: 'Oiseau',    it: 'Uccello',     es: 'Pájaro'     },
  { de: 'Berg',          en: 'Mountain',  fr: 'Montagne',  it: 'Montagna',    es: 'Montaña'    },
  { de: 'Welle',         en: 'Wave',      fr: 'Vague',     it: 'Onda',        es: 'Ola'        },
  { de: 'Pizza',         en: 'Pizza',     fr: 'Pizza',     it: 'Pizza',       es: 'Pizza'      },
  { de: 'Apfel',         en: 'Apple',     fr: 'Pomme',     it: 'Mela',        es: 'Manzana'    },
  { de: 'Fahrrad',       en: 'Bicycle',   fr: 'Vélo',      it: 'Bicicletta',  es: 'Bicicleta'  },
  { de: 'Brille',        en: 'Glasses',   fr: 'Lunettes',  it: 'Occhiali',    es: 'Gafas'      },
  { de: 'Schloss',       en: 'Castle',    fr: 'Château',   it: 'Castello',    es: 'Castillo'   },
  { de: 'Regenschirm',   en: 'Umbrella',  fr: 'Parapluie', it: 'Ombrello',    es: 'Paraguas'   },
  { de: 'Gitarre',       en: 'Guitar',    fr: 'Guitare',   it: 'Chitarra',    es: 'Guitarra'   },
  { de: 'Telefon',       en: 'Phone',     fr: 'Téléphone', it: 'Telefono',    es: 'Teléfono'   },
  { de: 'Eis',           en: 'Ice cream', fr: 'Glace',     it: 'Gelato',      es: 'Helado'     },
  { de: 'Koffer',        en: 'Suitcase',  fr: 'Valise',    it: 'Valigia',     es: 'Maleta'     },
  { de: 'Schlüssel',     en: 'Key',       fr: 'Clé',       it: 'Chiave',      es: 'Llave'      },
  { de: 'Uhr',           en: 'Clock',     fr: 'Horloge',   it: 'Orologio',    es: 'Reloj'      },
  { de: 'Blume',         en: 'Flower',    fr: 'Fleur',     it: 'Fiore',       es: 'Flor'       },
  { de: 'Schmetterling', en: 'Butterfly', fr: 'Papillon',  it: 'Farfalla',    es: 'Mariposa'   },
  { de: 'Krone',         en: 'Crown',     fr: 'Couronne',  it: 'Corona',      es: 'Corona'     },
  { de: 'Rakete',        en: 'Rocket',    fr: 'Fusée',     it: 'Razzo',       es: 'Cohete'     },
  { de: 'Pinguin',       en: 'Penguin',   fr: 'Pingouin',  it: 'Pinguino',    es: 'Pingüino'   },
  { de: 'Diamant',       en: 'Diamond',   fr: 'Diamant',   it: 'Diamante',    es: 'Diamante'   },
  { de: 'Kaktus',        en: 'Cactus',    fr: 'Cactus',    it: 'Cactus',      es: 'Cactus'     },
  { de: 'Frosch',        en: 'Frog',      fr: 'Grenouille',it: 'Rana',        es: 'Rana'       },
  { de: 'Elefant',       en: 'Elephant',  fr: 'Éléphant',  it: 'Elefante',    es: 'Elefante'   },
  { de: 'Regen',         en: 'Rain',      fr: 'Pluie',     it: 'Pioggia',     es: 'Lluvia'     },
  { de: 'Schlange',      en: 'Snake',     fr: 'Serpent',   it: 'Serpente',    es: 'Serpiente'  },
  { de: 'Turm',          en: 'Tower',     fr: 'Tour',      it: 'Torre',       es: 'Torre'      },
  { de: 'Brücke',        en: 'Bridge',    fr: 'Pont',      it: 'Ponte',       es: 'Puente'     },
  { de: 'Trommel',       en: 'Drum',      fr: 'Tambour',   it: 'Tamburo',     es: 'Tambor'     },
  { de: 'Wolke',         en: 'Cloud',     fr: 'Nuage',     it: 'Nuvola',      es: 'Nube'       },
];

// ────────────────────────────────────────────────────────────────────────────
// Pure helper functions
// ────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a string for comparison: lowercase, trim, remove accents.
 */
function normalizeWord(word) {
  return String(word)
    .trim()
    .toLowerCase()
    // Replace common ligatures before NFD decomposition
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Check whether a guess matches the answer.
 * Case-insensitive, accent-insensitive, partial substring match.
 */
function checkGuess(guess, answer) {
  const g = normalizeWord(guess);
  const a = normalizeWord(answer);
  if (!g) return false;
  return g === a || a.includes(g) || g.includes(a);
}

/**
 * Return points for a correct guess on the given attempt number.
 * attempt = 1 | 2 | 3; attempt = 0 means failed entirely.
 * Returns { guesser, drawer }
 */
function calculatePoints(attempt) {
  if (attempt === 1) return { guesser: 3, drawer: 2 };
  if (attempt === 2) return { guesser: 2, drawer: 2 };
  if (attempt === 3) return { guesser: 1, drawer: 2 };
  return { guesser: 0, drawer: 0 };
}

/**
 * Shuffle and select `count` unique words from wordList.
 */
function selectWords(wordList, count) {
  const shuffled = [...wordList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ────────────────────────────────────────────────────────────────────────────
// Game state class
// ────────────────────────────────────────────────────────────────────────────

class FiveStrokesGame {
  /**
   * @param {string[]} players  Array of player names
   */
  constructor(players) {
    if (!Array.isArray(players) || players.length < 2 || players.length > 4) {
      throw new Error('Need 2–4 players');
    }
    this.players = players;
    this.scores  = new Array(players.length).fill(0);

    // Total rounds: each player draws the same number of times
    const drawsEach = players.length === 3 ? 3 : (players.length === 2 ? 4 : 2);
    this.totalRounds = players.length * drawsEach;

    this.currentRound = 0;
    this._words = selectWords(WORD_PAIRS, this.totalRounds);
  }

  /** Index of the current drawer */
  get drawerIndex() {
    return this.currentRound % this.players.length;
  }

  /** Index of the current guesser (next player after drawer) */
  get guesserIndex() {
    return (this.currentRound + 1) % this.players.length;
  }

  get drawer()  { return this.players[this.drawerIndex];  }
  get guesser() { return this.players[this.guesserIndex]; }

  /** Current round's word pair */
  get currentWordPair() {
    return this._words[this.currentRound] || this._words[0];
  }

  /** Is the game over? */
  get isOver() {
    return this.currentRound >= this.totalRounds;
  }

  /** Award points for the current round */
  awardPoints(guesserPts, drawerPts) {
    this.scores[this.guesserIndex] += guesserPts;
    this.scores[this.drawerIndex]  += drawerPts;
  }

  /** Advance to the next round */
  nextRound() {
    this.currentRound++;
  }

  /** Return players sorted by score (descending) */
  getRanking() {
    return this.players
      .map((name, i) => ({ name, score: this.scores[i] }))
      .sort((a, b) => b.score - a.score);
  }

  /** Return winner(s) and max score */
  getWinner() {
    const maxScore = Math.max(...this.scores);
    const winners  = this.players.filter((_, i) => this.scores[i] === maxScore);
    return { winners, maxScore };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Exports (for bun test)
// ────────────────────────────────────────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { FiveStrokesGame, checkGuess, calculatePoints, selectWords, normalizeWord, WORD_PAIRS };
}
