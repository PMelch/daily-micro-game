/**
 * Bluff! — Pure game logic module (no DOM dependencies)
 * Can be imported by tests and the main game.
 */

/**
 * Creates an unshuffled deck.
 * @param {number} maxValue - Highest card value (1..maxValue)
 * @param {number} copies   - How many copies of each value
 * @returns {number[]}
 */
export function createDeck(maxValue = 8, copies = 4) {
  const deck = [];
  for (let v = 1; v <= maxValue; v++) {
    for (let c = 0; c < copies; c++) {
      deck.push(v);
    }
  }
  return deck;
}

/**
 * Shuffles an array using Fisher-Yates. Returns a NEW array.
 * @param {number[]} arr
 * @returns {number[]}
 */
export function shuffleDeck(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Deals cards from the deck into N hands as evenly as possible.
 * @param {number[]} deck
 * @param {number} numPlayers
 * @returns {number[][]}
 */
export function dealCards(deck, numPlayers) {
  const hands = Array.from({ length: numPlayers }, () => []);
  for (let i = 0; i < deck.length; i++) {
    hands[i % numPlayers].push(deck[i]);
  }
  return hands;
}

/**
 * Resolves a challenge: were ALL played cards what was claimed?
 * @param {number[]} playedCards  - Actual cards that were played face-down
 * @param {number}   claimedValue - The number the player claimed they all were
 * @returns {{ bluffCaught: boolean, revealedCards: number[] }}
 */
export function resolveChallenge(playedCards, claimedValue) {
  const bluffCaught = playedCards.some(c => c !== claimedValue);
  return { bluffCaught, revealedCards: playedCards };
}

/**
 * Returns true when a player has no cards left (they win!).
 * @param {number[]} hand
 * @returns {boolean}
 */
export function isHandEmpty(hand) {
  return hand.length === 0;
}

/**
 * Advances the claim value by 1, wrapping from max back to 1.
 * @param {number} current
 * @param {number} max
 * @returns {number}
 */
export function nextClaimValue(current, max = 8) {
  return current >= max ? 1 : current + 1;
}

/**
 * Determines whether a challenge is possible given the current pile state.
 * @param {null | { cards: number[], claimed: number|null, playerIndex: number }} lastPlay
 * @returns {boolean}
 */
export function canChallengePlay(lastPlay) {
  if (!lastPlay) return false;
  if (!lastPlay.cards || lastPlay.cards.length === 0) return false;
  return true;
}
