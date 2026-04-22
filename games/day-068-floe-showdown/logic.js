(function (global) {
  const BOARD_SIZE = 7;
  const MAX_ROUNDS = 4;
  const START_POSITIONS = [
    { x: 0, y: 0 },
    { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 },
    { x: BOARD_SIZE - 1, y: 0 },
    { x: 0, y: BOARD_SIZE - 1 },
  ];
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
  };

  function createRng(seed = 1) {
    let state = seed >>> 0;
    return function rand() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  }

  function createBoard(seed = 1) {
    const rand = createRng(seed);
    return Array.from({ length: BOARD_SIZE }, () => (
      Array.from({ length: BOARD_SIZE }, () => ({
        sunk: false,
        fish: rand() < 0.18 ? 0 : 1 + Math.floor(rand() * 3),
      }))
    ));
  }

  function cloneBoard(board) {
    return board.map((row) => row.map((cell) => ({ ...cell })));
  }

  function createPlayers(names) {
    return names.map((name, index) => ({
      id: index,
      name,
      score: 0,
      pos: { ...START_POSITIONS[index] },
      trapped: false,
    }));
  }

  function createGame(names, seed = 1) {
    const board = createBoard(seed);
    const players = createPlayers(names);
    players.forEach((player) => {
      board[player.pos.y][player.pos.x].fish = 0;
    });
    return {
      board,
      players,
      currentPlayerIndex: 0,
      turnNumber: 0,
      round: 1,
      maxRounds: MAX_ROUNDS,
      winner: null,
      status: 'setup',
      lastMove: null,
    };
  }

  function isOccupied(players, x, y, ignoreIndex = -1) {
    return players.some((player, index) => index !== ignoreIndex && player.pos.x === x && player.pos.y === y);
  }

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
  }

  function getSlideDestination(game, playerIndex, direction) {
    const player = game.players[playerIndex];
    const delta = DIRECTIONS[direction];
    if (!delta) return null;

    let x = player.pos.x;
    let y = player.pos.y;
    const path = [];

    while (true) {
      const nx = x + delta.x;
      const ny = y + delta.y;
      if (!inBounds(nx, ny)) break;
      if (game.board[ny][nx].sunk) break;
      if (isOccupied(game.players, nx, ny, playerIndex)) break;
      x = nx;
      y = ny;
      path.push({ x, y });
    }

    if (!path.length) return null;
    return {
      direction,
      landing: { x, y },
      path,
    };
  }

  function getValidMoves(game, playerIndex = game.currentPlayerIndex) {
    return Object.keys(DIRECTIONS)
      .map((direction) => getSlideDestination(game, playerIndex, direction))
      .filter(Boolean)
      .map((move) => ({
        ...move,
        fish: move.path.reduce((sum, step) => sum + game.board[step.y][step.x].fish, 0),
        distance: move.path.length,
      }));
  }

  function markTrappedPlayers(game) {
    game.players.forEach((player, index) => {
      player.trapped = getValidMoves(game, index).length === 0;
    });
  }

  function computeWinner(players) {
    return players
      .map((player) => ({ name: player.name, score: player.score }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  }

  function advanceTurn(game) {
    game.turnNumber += 1;
    game.round = Math.floor(game.turnNumber / game.players.length) + 1;
    markTrappedPlayers(game);

    if (game.round > game.maxRounds || game.players.every((player) => player.trapped)) {
      game.status = 'finished';
      game.winner = computeWinner(game.players);
      return game;
    }

    for (let offset = 1; offset <= game.players.length; offset += 1) {
      const candidate = (game.currentPlayerIndex + offset) % game.players.length;
      if (!game.players[candidate].trapped) {
        game.currentPlayerIndex = candidate;
        game.status = 'transition';
        return game;
      }
    }

    game.status = 'finished';
    game.winner = computeWinner(game.players);
    return game;
  }

  function applyMove(game, direction) {
    const move = getSlideDestination(game, game.currentPlayerIndex, direction);
    if (!move) {
      return { ok: false, reason: 'invalid-move' };
    }

    const player = game.players[game.currentPlayerIndex];
    const cracked = [{ ...player.pos }, ...move.path.slice(0, -1)];
    const gained = move.path.reduce((sum, step) => sum + game.board[step.y][step.x].fish, 0);

    cracked.forEach(({ x, y }) => {
      game.board[y][x].fish = 0;
      game.board[y][x].sunk = true;
    });
    move.path.forEach(({ x, y }) => {
      game.board[y][x].fish = 0;
    });

    player.pos = { ...move.landing };
    player.score += gained;
    game.lastMove = {
      player: player.name,
      direction,
      gained,
      landing: { ...move.landing },
      cracked,
    };

    advanceTurn(game);
    return { ok: true, gained, landing: { ...move.landing } };
  }

  const api = {
    BOARD_SIZE,
    MAX_ROUNDS,
    DIRECTIONS,
    createBoard,
    createGame,
    getSlideDestination,
    getValidMoves,
    applyMove,
    markTrappedPlayers,
    computeWinner,
    cloneBoard,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.FloeShowdown = api;
})(typeof window !== 'undefined' ? window : globalThis);
