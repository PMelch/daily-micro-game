/**
 * Ballpark! - Game Logic (pure, no DOM)
 * Pass & Play estimation duel
 */

const QUESTIONS = [
  { key: 'q_bones', answer: 206, unit: '', unitKey: 'unit_bones' },
  { key: 'q_moon_km', answer: 384400, unit: 'km', unitKey: 'unit_km' },
  { key: 'q_eiffel', answer: 1889, unit: '', unitKey: 'unit_year' },
  { key: 'q_great_wall', answer: 21196, unit: 'km', unitKey: 'unit_km' },
  { key: 'q_amazon_length', answer: 6992, unit: 'km', unitKey: 'unit_km' },
  { key: 'q_population_berlin', answer: 3645000, unit: '', unitKey: 'unit_people' },
  { key: 'q_everest_m', answer: 8849, unit: 'm', unitKey: 'unit_m' },
  { key: 'q_olympic_pool_liters', answer: 2500000, unit: 'L', unitKey: 'unit_liters' },
  { key: 'q_iphone_launch', answer: 2007, unit: '', unitKey: 'unit_year' },
  { key: 'q_speed_light', answer: 299792, unit: 'km/s', unitKey: 'unit_kms' },
  { key: 'q_vienna_paris', answer: 1233, unit: 'km', unitKey: 'unit_km' },
  { key: 'q_human_teeth', answer: 32, unit: '', unitKey: 'unit_teeth' },
  { key: 'q_countries_world', answer: 195, unit: '', unitKey: 'unit_countries' },
  { key: 'q_height_statue_liberty', answer: 93, unit: 'm', unitKey: 'unit_m' },
  { key: 'q_mona_lisa_year', answer: 1503, unit: '', unitKey: 'unit_year' },
  { key: 'q_seconds_day', answer: 86400, unit: '', unitKey: 'unit_seconds' },
  { key: 'q_piano_keys', answer: 88, unit: '', unitKey: 'unit_keys' },
  { key: 'q_soccer_field_m', answer: 105, unit: 'm', unitKey: 'unit_m' },
  { key: 'q_great_barrier_reef', answer: 2300, unit: 'km', unitKey: 'unit_km' },
  { key: 'q_dna_letters', answer: 3200000000, unit: '', unitKey: 'unit_basepairs' },
];

/**
 * Shuffle an array (Fisher-Yates). Takes optional seed for testing.
 */
function shuffleArray(arr, rng = Math.random) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pick N random questions from the pool
 */
function pickQuestions(count = 7, rng = Math.random) {
  return shuffleArray(QUESTIONS, rng).slice(0, count);
}

/**
 * Calculate percentage error (lower = better)
 * Returns Infinity if guess is 0 and answer is 0
 */
function calcError(guess, answer) {
  if (answer === 0) return guess === 0 ? 0 : Infinity;
  return Math.abs(guess - answer) / answer;
}

/**
 * Rank players for a round based on their guesses.
 * Returns array of { playerIndex, guess, error, points }
 * sorted by error ascending.
 * Points: 1st = 3, 2nd = 1, rest = 0
 */
function rankRound(guesses, answer) {
  const ranked = guesses.map((guess, idx) => ({
    playerIndex: idx,
    guess,
    error: calcError(guess, answer),
  }));
  ranked.sort((a, b) => a.error - b.error);
  const points = [3, 1];
  return ranked.map((r, rank) => ({
    ...r,
    points: points[rank] ?? 0,
  }));
}

/**
 * Calculate final totals from rounds history
 * rounds: array of rankRound() results
 * numPlayers: int
 * Returns: array of { playerIndex, total } sorted by total desc
 */
function calcTotals(rounds, numPlayers) {
  const totals = Array.from({ length: numPlayers }, (_, i) => ({
    playerIndex: i,
    total: 0,
  }));
  for (const round of rounds) {
    for (const { playerIndex, points } of round) {
      totals[playerIndex].total += points;
    }
  }
  return totals.sort((a, b) => b.total - a.total);
}

/**
 * Format a number nicely (with thousands separators)
 */
function formatNumber(n) {
  if (n === null || n === undefined) return '?';
  return Number(n).toLocaleString('de-AT');
}

// Export for both Node (test) and browser usage
if (typeof module !== 'undefined') {
  module.exports = { QUESTIONS, pickQuestions, calcError, rankRound, calcTotals, formatNumber, shuffleArray };
}
