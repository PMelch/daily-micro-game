const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const STORE_PATH = path.join(__dirname, '..', 'test-data.json');

// Clean before requiring so the store uses our test path
beforeEach(() => {
  if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
});

describe('GameStore', () => {
  function loadStore() {
    // Clear require cache so we get a fresh module
    const storePath = require.resolve('../store');
    delete require.cache[storePath];
    process.env.GAMES_DATA_PATH = STORE_PATH;
    return require('../store');
  }

  it('returns empty array when no games exist', () => {
    const store = loadStore();
    assert.deepStrictEqual(store.listGames(), []);
  });

  it('can add a game', () => {
    const store = loadStore();
    store.addGame({ id: 'day-001-snake', name: 'Snake Remix', description: 'Classic snake with a twist', date: '2026-02-18' });
    const games = store.listGames();
    assert.equal(games.length, 1);
    assert.equal(games[0].id, 'day-001-snake');
    assert.equal(games[0].name, 'Snake Remix');
  });

  it('can rate a game', () => {
    const store = loadStore();
    store.addGame({ id: 'day-001-snake', name: 'Snake Remix', description: 'Test', date: '2026-02-18' });
    store.rateGame('day-001-snake', 4);
    store.rateGame('day-001-snake', 2);
    const game = store.listGames().find(g => g.id === 'day-001-snake');
    assert.deepStrictEqual(game.ratings, [4, 2]);
    assert.equal(game.averageRating, 3);
  });

  it('throws when rating non-existent game', () => {
    const store = loadStore();
    assert.throws(() => store.rateGame('nope', 5), /not found/i);
  });

  it('rejects invalid ratings', () => {
    const store = loadStore();
    store.addGame({ id: 'g1', name: 'G1', description: 'Test', date: '2026-02-18' });
    assert.throws(() => store.rateGame('g1', 0), /between 1 and 5/i);
    assert.throws(() => store.rateGame('g1', 6), /between 1 and 5/i);
  });

  it('persists data to disk', () => {
    const store = loadStore();
    store.addGame({ id: 'g1', name: 'G1', description: 'Test', date: '2026-02-18' });
    // Reload
    const store2 = loadStore();
    assert.equal(store2.listGames().length, 1);
  });
});
