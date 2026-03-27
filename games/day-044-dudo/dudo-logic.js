/**
 * Dudo (Liar's Dice) game logic — pure functions, no DOM.
 */

/** Roll n dice, return array of values 1-6 */
export function rollDice(n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(Math.floor(Math.random() * 6) + 1);
  }
  return result;
}

/** Count exact face across all cups */
export function countFace(cups, face) {
  return cups.reduce((sum, cup) => sum + cup.filter(d => d === face).length, 0);
}

/** 
 * Count face with wilds: 1s are jokers for any non-1 bid.
 * When bidding on 1s, no wilds.
 */
export function countFaceWithWilds(cups, face) {
  if (face === 1) {
    return countFace(cups, 1);
  }
  // 1s are wild
  const faceCount = countFace(cups, face);
  const wildCount = countFace(cups, 1);
  return faceCount + wildCount;
}

/** 
 * Check if a bid is valid given the previous bid and total dice.
 * Rules: quantity >= 1, face 1-6, quantity <= totalDice.
 * Must beat prev bid: higher quantity OR same quantity + higher face.
 */
export function isValidBid(bid, prevBid, totalDice) {
  const { quantity, face } = bid;
  if (quantity < 1 || quantity > totalDice) return false;
  if (face < 1 || face > 6) return false;
  if (!prevBid) return true;
  // Must be strictly higher
  if (quantity > prevBid.quantity) return true;
  if (quantity === prevBid.quantity && face > prevBid.face) return true;
  return false;
}

/**
 * Resolve a Dudo challenge.
 * cups: array of dice arrays (per player)
 * bid: { quantity, face }
 * bidderId: index of player who made the bid
 * challengerId: index of player who called Dudo
 * 
 * If actualCount >= bid.quantity → bid survives → challenger loses
 * If actualCount < bid.quantity → bid fails → bidder loses
 * 
 * Returns { loser, actualCount, bidSurvived }
 */
export function resolveDudo(cups, bid, bidderId, challengerId) {
  const actualCount = countFaceWithWilds(cups, bid.face);
  const bidSurvived = actualCount >= bid.quantity;
  const loser = bidSurvived ? challengerId : bidderId;
  return { loser, actualCount, bidSurvived };
}

/**
 * Calculate the minimum valid next bid given the current bid.
 * If no prev, returns { quantity: 1, face: 1 }.
 */
export function calcNextMinBid(prevBid) {
  if (!prevBid) return { quantity: 1, face: 1 };
  if (prevBid.face < 6) {
    return { quantity: prevBid.quantity, face: prevBid.face + 1 };
  }
  return { quantity: prevBid.quantity + 1, face: 1 };
}

/** Check if a face is the wild face (1) */
export function isWildFace(face) {
  return face === 1;
}
