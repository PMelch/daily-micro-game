const {
  generateRoomCode, createRoom, addPlayer, removePlayer, startGame,
  startRound, recordPress, calculateRoundResult, finalizeRound, getLeaderboard,
  TOTAL_ROUNDS, MIN_PLAYERS, MAX_PLAYERS,
} = require('./game.js');

// RED phase: run these tests first, they should fail before implementation

describe('generateRoomCode', () => {
  test('generates 4-character uppercase code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
    expect(code).toMatch(/^[A-Z]+$/);
  });

  test('generates different codes each time (probabilistic)', () => {
    const codes = new Set(Array.from({ length: 10 }, generateRoomCode));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('createRoom', () => {
  test('creates room with host player', () => {
    const room = createRoom('host1', 'Alice');
    expect(room.players).toHaveLength(1);
    expect(room.players[0]).toMatchObject({ id: 'host1', name: 'Alice', score: 0 });
    expect(room.hostId).toBe('host1');
    expect(room.state).toBe('lobby');
    expect(room.code).toHaveLength(4);
  });
});

describe('addPlayer', () => {
  test('adds player to lobby', () => {
    const room = createRoom('h1', 'Host');
    const res = addPlayer(room, 'p2', 'Bob');
    expect(res.ok).toBe(true);
    expect(room.players).toHaveLength(2);
  });

  test('rejects join when game started', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    const res = addPlayer(room, 'p3', 'Charlie');
    expect(res.error).toBe('game_started');
  });

  test('rejects join when room full', () => {
    const room = createRoom('h1', 'Host');
    for (let i = 0; i < MAX_PLAYERS - 1; i++) {
      addPlayer(room, `p${i}`, `Player${i}`);
    }
    const res = addPlayer(room, 'extra', 'Extra');
    expect(res.error).toBe('room_full');
  });

  test('rejects duplicate player', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    const res = addPlayer(room, 'p2', 'Bob');
    expect(res.error).toBe('already_joined');
  });
});

describe('startGame', () => {
  test('host can start game with enough players', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    const res = startGame(room, 'h1');
    expect(res.ok).toBe(true);
    expect(room.state).toBe('countdown');
    expect(room.round).toBe(0);
  });

  test('non-host cannot start game', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    const res = startGame(room, 'p2');
    expect(res.error).toBe('not_host');
  });

  test('cannot start with too few players', () => {
    const room = createRoom('h1', 'Host');
    const res = startGame(room, 'h1');
    expect(res.error).toBe('not_enough_players');
  });
});

describe('startRound', () => {
  test('increments round and sets state active', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    const info = startRound(room);
    expect(room.round).toBe(1);
    expect(room.state).toBe('active');
    expect(info.round).toBe(1);
    expect(info.startTime).toBeGreaterThan(0);
  });
});

describe('recordPress', () => {
  test('records a valid press', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    const res = recordPress(room, 'h1');
    expect(res.ok).toBe(true);
    expect(res.pressCount).toBe(1);
  });

  test('prevents double-press from same player', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    recordPress(room, 'h1');
    const res = recordPress(room, 'h1');
    expect(res.error).toBe('already_pressed');
  });

  test('rejects press when not active', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    const res = recordPress(room, 'h1');
    expect(res.error).toBe('not_active');
  });
});

describe('calculateRoundResult', () => {
  test('returns F grade with < 2 presses', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    recordPress(room, 'h1');
    const result = calculateRoundResult(room);
    expect(result.grade).toBe('F');
    expect(result.syncScore).toBe(0);
  });

  test('gives high score for perfectly synced presses', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    // Simulate same-time presses by setting timestamps manually
    room.presses = [
      { playerId: 'h1', timestamp: 1000 },
      { playerId: 'p2', timestamp: 1000 },
    ];
    const result = calculateRoundResult(room);
    expect(result.spreadMs).toBe(0);
    expect(result.syncScore).toBe(100);
    expect(result.grade).toBe('S');
  });

  test('gives lower score for spread presses', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    room.presses = [
      { playerId: 'h1', timestamp: 1000 },
      { playerId: 'p2', timestamp: 1500 }, // 500ms spread
    ];
    const result = calculateRoundResult(room);
    expect(result.spreadMs).toBe(500);
    expect(result.syncScore).toBeLessThanOrEqual(60);
  });

  test('identifies missed players', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    // Only h1 presses
    room.presses = [{ playerId: 'h1', timestamp: 1000 }];
    const result = calculateRoundResult(room);
    expect(result.missedPlayers).toContain('p2');
  });
});

describe('finalizeRound', () => {
  test('transitions to results after round', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    room.presses = [
      { playerId: 'h1', timestamp: 1000 },
      { playerId: 'p2', timestamp: 1010 },
    ];
    finalizeRound(room);
    expect(room.state).toBe('results');
    expect(room.roundResults).toHaveLength(1);
  });

  test('transitions to finished after final round', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    room.round = TOTAL_ROUNDS - 1;
    startRound(room);
    room.presses = [
      { playerId: 'h1', timestamp: 1000 },
      { playerId: 'p2', timestamp: 1010 },
    ];
    finalizeRound(room);
    expect(room.state).toBe('finished');
  });

  test('adds score to pressing players', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    startGame(room, 'h1');
    startRound(room);
    room.presses = [
      { playerId: 'h1', timestamp: 1000 },
      { playerId: 'p2', timestamp: 1000 },
    ];
    finalizeRound(room);
    expect(room.players[0].score).toBeGreaterThan(0);
    expect(room.players[1].score).toBeGreaterThan(0);
  });
});

describe('getLeaderboard', () => {
  test('sorts players by score descending', () => {
    const room = createRoom('h1', 'Host');
    addPlayer(room, 'p2', 'Bob');
    room.players[0].score = 50;
    room.players[1].score = 80;
    const lb = getLeaderboard(room);
    expect(lb[0].score).toBe(80);
    expect(lb[1].score).toBe(50);
  });
});
