// game.test.js — TDD for Spell Duel logic

import { describe, test, expect } from "bun:test";
import {
  resolveClash,
  calcDamage,
  isGameOver,
  getWinner,
  SPELLS
} from "./game-logic.js";

// Elemental cycle: Fire > Nature, Nature > Water, Water > Lightning, Lightning > Fire
// Void beats everything once, but is a one-use nuke (costs HP to use)
// Mirror match = both take 5 damage (clash)

describe("SPELLS constant", () => {
  test("has 5 spells", () => {
    expect(SPELLS.length).toBe(5);
  });
  test("includes Fire, Water, Lightning, Nature, Void", () => {
    const names = SPELLS.map(s => s.id);
    expect(names).toContain("fire");
    expect(names).toContain("water");
    expect(names).toContain("lightning");
    expect(names).toContain("nature");
    expect(names).toContain("void");
  });
});

describe("resolveClash", () => {
  // Returns: "p1" | "p2" | "draw"
  test("Fire beats Nature", () => {
    expect(resolveClash("fire", "nature")).toBe("p1");
    expect(resolveClash("nature", "fire")).toBe("p2");
  });
  test("Nature beats Water", () => {
    expect(resolveClash("nature", "water")).toBe("p1");
    expect(resolveClash("water", "nature")).toBe("p2");
  });
  test("Water beats Lightning", () => {
    expect(resolveClash("water", "lightning")).toBe("p1");
    expect(resolveClash("lightning", "water")).toBe("p2");
  });
  test("Lightning beats Fire", () => {
    expect(resolveClash("lightning", "fire")).toBe("p1");
    expect(resolveClash("fire", "lightning")).toBe("p2");
  });
  test("Mirror match is draw", () => {
    expect(resolveClash("fire", "fire")).toBe("draw");
    expect(resolveClash("water", "water")).toBe("draw");
    expect(resolveClash("nature", "nature")).toBe("draw");
    expect(resolveClash("lightning", "lightning")).toBe("draw");
  });
  test("Void beats any elemental (one-use)", () => {
    expect(resolveClash("void", "fire")).toBe("p1");
    expect(resolveClash("void", "water")).toBe("p1");
    expect(resolveClash("void", "lightning")).toBe("p1");
    expect(resolveClash("void", "nature")).toBe("p1");
    expect(resolveClash("fire", "void")).toBe("p2");
    expect(resolveClash("water", "void")).toBe("p2");
  });
  test("Void vs Void is draw", () => {
    expect(resolveClash("void", "void")).toBe("draw");
  });
});

describe("calcDamage", () => {
  // winner takes 0, loser takes damage, draw both take 5
  // Normal win: loser takes 15 damage
  // Void win: loser takes 25 damage (nuke!)
  // Draw: both take 5 (clash damage)
  test("winner takes no damage", () => {
    const { p1Dmg, p2Dmg } = calcDamage("fire", "nature");
    expect(p1Dmg).toBe(0);
  });
  test("loser takes 15 damage on normal win", () => {
    const { p1Dmg, p2Dmg } = calcDamage("fire", "nature");
    expect(p2Dmg).toBe(15);
  });
  test("void win deals 25 damage", () => {
    const { p1Dmg, p2Dmg } = calcDamage("void", "fire");
    expect(p1Dmg).toBe(0);
    expect(p2Dmg).toBe(25);
  });
  test("draw deals 5 damage to both", () => {
    const { p1Dmg, p2Dmg } = calcDamage("fire", "fire");
    expect(p1Dmg).toBe(5);
    expect(p2Dmg).toBe(5);
  });
  test("void vs void draw still 5 each", () => {
    const { p1Dmg, p2Dmg } = calcDamage("void", "void");
    expect(p1Dmg).toBe(5);
    expect(p2Dmg).toBe(5);
  });
});

describe("isGameOver", () => {
  test("returns false when both players have HP", () => {
    expect(isGameOver(100, 100)).toBe(false);
    expect(isGameOver(1, 50)).toBe(false);
  });
  test("returns true when p1 HP <= 0", () => {
    expect(isGameOver(0, 100)).toBe(true);
    expect(isGameOver(-5, 100)).toBe(true);
  });
  test("returns true when p2 HP <= 0", () => {
    expect(isGameOver(100, 0)).toBe(true);
  });
  test("returns true when both <= 0", () => {
    expect(isGameOver(0, 0)).toBe(true);
  });
});

describe("getWinner", () => {
  test("returns p1 when p2 <= 0", () => {
    expect(getWinner(50, 0)).toBe("p1");
    expect(getWinner(50, -10)).toBe("p1");
  });
  test("returns p2 when p1 <= 0", () => {
    expect(getWinner(0, 50)).toBe("p2");
  });
  test("returns draw when both <= 0", () => {
    expect(getWinner(0, 0)).toBe("draw");
    expect(getWinner(-5, -5)).toBe("draw");
  });
  test("returns null when game not over", () => {
    expect(getWinner(50, 80)).toBeNull();
  });
});
