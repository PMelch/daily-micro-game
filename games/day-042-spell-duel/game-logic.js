// game-logic.js — Spell Duel core logic

export const SPELLS = [
  { id: "fire",      emoji: "🔥", name: "Fire",      color: "#ff4500" },
  { id: "water",     emoji: "💧", name: "Water",     color: "#00bfff" },
  { id: "lightning", emoji: "⚡", name: "Lightning", color: "#ffd700" },
  { id: "nature",    emoji: "🌿", name: "Nature",    color: "#32cd32" },
  { id: "void",      emoji: "☄️", name: "Void",      color: "#9b59b6" },
];

// Elemental effectiveness: key beats value[]
const BEATS = {
  fire:      ["nature"],
  nature:    ["water"],
  water:     ["lightning"],
  lightning: ["fire"],
  void:      ["fire", "water", "lightning", "nature"],
};

/**
 * Resolve a clash between two spells.
 * @returns "p1" | "p2" | "draw"
 */
export function resolveClash(spell1, spell2) {
  if (spell1 === spell2) return "draw";
  if (BEATS[spell1]?.includes(spell2)) return "p1";
  if (BEATS[spell2]?.includes(spell1)) return "p2";
  return "draw";
}

/**
 * Calculate damage dealt to each player from a round.
 * @returns { p1Dmg: number, p2Dmg: number }
 */
export function calcDamage(spell1, spell2) {
  const result = resolveClash(spell1, spell2);
  if (result === "draw") {
    return { p1Dmg: 5, p2Dmg: 5 };
  }
  const isVoidWin = (result === "p1" && spell1 === "void") ||
                    (result === "p2" && spell2 === "void");
  const dmg = isVoidWin ? 25 : 15;
  if (result === "p1") return { p1Dmg: 0, p2Dmg: dmg };
  return { p1Dmg: dmg, p2Dmg: 0 };
}

/**
 * Check if the game is over (any player at or below 0 HP).
 * @returns boolean
 */
export function isGameOver(p1hp, p2hp) {
  return p1hp <= 0 || p2hp <= 0;
}

/**
 * Get winner when game is over.
 * @returns "p1" | "p2" | "draw" | null (if game not over)
 */
export function getWinner(p1hp, p2hp) {
  if (p1hp > 0 && p2hp > 0) return null;
  if (p1hp <= 0 && p2hp <= 0) return "draw";
  if (p1hp <= 0) return "p2";
  return "p1";
}
