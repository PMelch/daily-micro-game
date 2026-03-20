/**
 * Treasure Vault – core game logic (pure functions, no DOM)
 */

/**
 * Given an array of bids (one per player), determine who wins the auction.
 * Rules: highest UNIQUE bid wins. Tied bids cancel each other.
 * bid=0 means "pass" and never wins.
 * Returns { winnerIdx, paid, tie }
 */
export function resolveAuction(bids) {
  // Count occurrences of each bid
  const counts = {};
  for (const b of bids) {
    counts[b] = (counts[b] || 0) + 1;
  }

  // Unique bids sorted descending, excluding 0
  const uniqueBids = Object.keys(counts)
    .map(Number)
    .filter(b => b > 0 && counts[b] === 1)
    .sort((a, b) => b - a);

  if (uniqueBids.length === 0) {
    return { winnerIdx: -1, paid: 0, tie: true };
  }

  const winningBid = uniqueBids[0];
  const winnerIdx = bids.indexOf(winningBid);
  return { winnerIdx, paid: winningBid, tie: false };
}

const TREASURE_POOL = [
  { emoji: '👑', name: 'crown', value: 10 },
  { emoji: '💎', name: 'diamond', value: 9 },
  { emoji: '🏺', name: 'vase', value: 8 },
  { emoji: '⚔️', name: 'sword', value: 7 },
  { emoji: '📜', name: 'scroll', value: 7 },
  { emoji: '🪙', name: 'coin', value: 6 },
  { emoji: '💍', name: 'ring', value: 6 },
  { emoji: '🗝️', name: 'key', value: 5 },
  { emoji: '🪬', name: 'amulet', value: 5 },
  { emoji: '🏵️', name: 'medallion', value: 4 },
  { emoji: '🎭', name: 'mask', value: 4 },
  { emoji: '🪨', name: 'gem', value: 3 },
  { emoji: '🧿', name: 'eye', value: 3 },
  { emoji: '🎲', name: 'dice', value: 2 },
  { emoji: '🪶', name: 'feather', value: 2 },
  { emoji: '🍀', name: 'clover', value: 1 },
];

/**
 * Generate 8 unique treasures for a game session.
 * Uses seed for determinism in tests (seed affects shuffle order).
 */
export function generateTreasures(seed = Date.now()) {
  // Seeded shuffle (mulberry32)
  let s = seed >>> 0;
  const rand = () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const pool = [...TREASURE_POOL];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 8).map((item, idx) => ({ ...item, id: idx }));
}

/**
 * Check if a player can place a bid.
 */
export function canBid(tokensRemaining, bidAmount) {
  return bidAmount >= 0 && bidAmount <= tokensRemaining;
}

/**
 * Calculate final scores. Score = treasure values + remaining tokens.
 * Returns players sorted descending by score.
 */
export function calculateFinalScores(players) {
  const scored = players.map(p => {
    const treasureValue = p.treasuresWon.reduce((sum, t) => sum + t.value, 0);
    const score = treasureValue + p.tokens;
    return { ...p, score, treasureValue };
  });
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Returns the name of the current leader by treasure value, or null if no treasures won.
 */
export function getLeader(players) {
  const hasTreasures = players.some(p => p.treasuresWon.length > 0);
  if (!hasTreasures) return null;

  let best = null;
  let bestVal = -1;
  for (const p of players) {
    const val = p.treasuresWon.reduce((s, t) => s + t.value, 0);
    if (val > bestVal) {
      bestVal = val;
      best = p.name;
    }
  }
  return best;
}
