import { describe, it, beforeEach, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(import.meta.dir, '..', 'test-data.json');

beforeEach(() => {
  if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
});

describe('GameStore', () => {
  function loadStore() {
    // Clear module cache not easily done in Bun, so we re-instantiate
    process.env.GAMES_DATA_PATH = STORE_PATH;
    // Dynamic import with cache bust
    const { createStore } = require('../store');
    return createStore();
  }

  it('returns empty array when no games exist', () => {
    const store = loadStore();
    expect(store.listGames()).toEqual([]);
  });

  it('can add a game', () => {
    const store = loadStore();
    store.addGame({ id: 'day-001-snake', name: 'Snake Remix', description: 'Classic snake with a twist', date: '2026-02-18' });
    const games = store.listGames();
    expect(games.length).toBe(1);
    expect(games[0].id).toBe('day-001-snake');
    expect(games[0].name).toBe('Snake Remix');
  });

  it('can rate a game', () => {
    const store = loadStore();
    store.addGame({ id: 'day-001-snake', name: 'Snake Remix', description: 'Test', date: '2026-02-18' });
    store.rateGame('day-001-snake', 4);
    store.rateGame('day-001-snake', 2);
    const game = store.listGames().find(g => g.id === 'day-001-snake');
    expect(game.ratings).toEqual([4, 2]);
    expect(game.averageRating).toBe(3);
  });

  it('throws when rating non-existent game', () => {
    const store = loadStore();
    expect(() => store.rateGame('nope', 5)).toThrow(/not found/i);
  });

  it('rejects invalid ratings', () => {
    const store = loadStore();
    store.addGame({ id: 'g1', name: 'G1', description: 'Test', date: '2026-02-18' });
    expect(() => store.rateGame('g1', 0)).toThrow(/between 1 and 5/i);
    expect(() => store.rateGame('g1', 6)).toThrow(/between 1 and 5/i);
  });

  it('stores tags, howToPlay, and whyFun', () => {
    const store = loadStore();
    store.addGame({ id: 'g1', name: 'G1', description: 'Test', date: '2026-02-18', tags: ['action', 'fun'], howToPlay: 'Click things', whyFun: 'Because explosions' });
    const game = store.listGames()[0];
    expect(game.tags).toEqual(['action', 'fun']);
    expect(game.howToPlay).toBe('Click things');
    expect(game.whyFun).toBe('Because explosions');
  });

  it('returns all unique tags', () => {
    const store = loadStore();
    store.addGame({ id: 'g1', name: 'G1', description: 'T', date: '2026-02-18', tags: ['action', 'logic'] });
    store.addGame({ id: 'g2', name: 'G2', description: 'T', date: '2026-02-18', tags: ['action', 'multiplayer'] });
    expect(store.allTags()).toEqual(['action', 'logic', 'multiplayer']);
  });

  it('persists data to disk', () => {
    const store = loadStore();
    store.addGame({ id: 'g1', name: 'G1', description: 'Test', date: '2026-02-18' });
    const store2 = loadStore();
    expect(store2.listGames().length).toBe(1);
  });
});
