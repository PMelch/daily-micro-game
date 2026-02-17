const fs = require('node:fs');
const path = require('node:path');

function createStore(overridePath) {
  const dataPath = overridePath || process.env.GAMES_DATA_PATH || path.join(__dirname, 'data.json');

  function load() {
    if (!fs.existsSync(dataPath)) return { games: [] };
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  function save(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  }

  function listGames() {
    const { games } = load();
    return games.map(g => ({
      ...g,
      averageRating: g.ratings && g.ratings.length > 0
        ? Math.round(g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length * 10) / 10
        : null
    }));
  }

  function addGame({ id, name, description, date }) {
    const data = load();
    data.games.push({ id, name, description, date, ratings: [] });
    save(data);
  }

  function rateGame(id, rating) {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    const data = load();
    const game = data.games.find(g => g.id === id);
    if (!game) throw new Error(`Game not found: ${id}`);
    game.ratings.push(rating);
    save(data);
  }

  return { listGames, addGame, rateGame };
}

// Default singleton for server use
const defaultStore = createStore();

module.exports = defaultStore;
module.exports.createStore = createStore;
