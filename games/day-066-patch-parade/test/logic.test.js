const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createGame,
  rotateCells,
  canPlacePatch,
  placePatch,
  getScores,
  createRoundOffer,
} = require('../logic.js');

test('createGame builds players with empty 6x6 boards', () => {
  const game = createGame(['Ada', 'Bob']);
  assert.equal(game.players.length, 2);
  assert.equal(game.players[0].board.length, 6);
  assert.equal(game.players[0].board[0].length, 6);
  assert.equal(game.players[0].board.flat().every((cell) => cell === null), true);
});

test('rotateCells turns an L patch clockwise', () => {
  const shape = [[0, 0], [0, 1], [1, 1]];
  assert.deepEqual(rotateCells(shape, 1), [[1, 0], [0, 0], [0, 1]]);
});

test('canPlacePatch rejects overlaps and out-of-bounds placement', () => {
  const game = createGame(['Ada', 'Bob']);
  const patch = { color: 'gold', cells: [[0, 0], [1, 0], [0, 1]] };
  assert.equal(canPlacePatch(game.players[0].board, patch, 5, 5), false);
  placePatch(game, 0, patch, 0, 0);
  assert.equal(canPlacePatch(game.players[0].board, patch, 0, 0), false);
});

test('placePatch updates board and awards row, star, and adjacency points', () => {
  const game = createGame(['Ada']);
  const player = game.players[0];
  player.board[0][0] = 'gold';
  player.board[0][1] = 'gold';
  player.board[0][2] = 'gold';
  player.board[0][3] = 'gold';
  player.stars = [{ x: 4, y: 0 }];

  const patch = { color: 'gold', cells: [[0, 0], [1, 0]] };
  const result = placePatch(game, 0, patch, 4, 0);

  assert.equal(result.placed, true);
  assert.equal(player.score, 8);
  assert.equal(player.board[0][4], 'gold');
  assert.equal(player.board[0][5], 'gold');
});

test('getScores adds biggest color parade bonus at the end', () => {
  const game = createGame(['Ada']);
  const player = game.players[0];
  player.score = 5;
  player.board[0][0] = 'mint';
  player.board[0][1] = 'mint';
  player.board[1][0] = 'mint';
  player.board[5][5] = 'rose';

  const scores = getScores(game);
  assert.deepEqual(scores, [{ name: 'Ada', score: 8, bonus: 3 }]);
});

test('createRoundOffer returns three placeable patch options', () => {
  const offer = createRoundOffer(2, 1234);
  assert.equal(offer.length, 3);
  assert.equal(offer.every((patch) => patch.cells.length >= 3 && patch.cells.length <= 4), true);
});
