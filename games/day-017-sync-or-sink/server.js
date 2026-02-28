const { WebSocketServer } = require('ws');
const { createRoom, addPlayer, removePlayer, startGame, startRound, recordPress, finalizeRound, getLeaderboard, TOTAL_ROUNDS } = require('./game.js');

const PORT = process.env.PORT || 3017;
const wss = new WebSocketServer({ port: PORT });

const rooms = {}; // code -> room
const clients = {}; // playerId -> ws

function broadcast(room, msg) {
  room.players.forEach(p => {
    const ws = clients[p.id];
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
  });
}

function sendTo(playerId, msg) {
  const ws = clients[playerId];
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function broadcastLobby(room) {
  broadcast(room, {
    type: 'lobby',
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    hostId: room.hostId,
    code: room.code,
  });
}

let roundTimers = {}; // code -> timeout

function doRound(room) {
  const { round, startTime } = startRound(room);
  broadcast(room, { type: 'round_start', round, totalRounds: TOTAL_ROUNDS, startTime });

  // Auto-finalize after 5 seconds
  roundTimers[room.code] = setTimeout(() => {
    if (room.state === 'active') {
      const result = finalizeRound(room);
      broadcast(room, {
        type: 'round_result',
        round: room.round,
        result: {
          syncScore: result.syncScore,
          spreadMs: result.spreadMs,
          grade: result.grade,
          missedPlayers: result.missedPlayers,
          pressDetails: result.pressDetails,
        },
        players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
        state: room.state,
      });

      if (room.state === 'finished') {
        broadcast(room, {
          type: 'game_over',
          leaderboard: getLeaderboard(room),
          roundResults: room.roundResults,
        });
      }
    }
  }, 5000);
}

wss.on('connection', (ws) => {
  let myId = null;
  let myRoom = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'create_room') {
      myId = 'p_' + Math.random().toString(36).slice(2, 8);
      myRoom = createRoom(myId, msg.name || 'Host');
      clients[myId] = ws;
      rooms[myRoom.code] = myRoom;
      sendTo(myId, { type: 'joined', playerId: myId, isHost: true, code: myRoom.code });
      broadcastLobby(myRoom);
    }

    else if (msg.type === 'join_room') {
      const room = rooms[msg.code?.toUpperCase()];
      if (!room) return sendTo(myId || '_', { type: 'error', message: 'Room not found' });
      myId = 'p_' + Math.random().toString(36).slice(2, 8);
      myRoom = room;
      clients[myId] = ws;
      const res = addPlayer(room, myId, msg.name || 'Player');
      if (res.error) {
        return ws.send(JSON.stringify({ type: 'error', message: res.error }));
      }
      sendTo(myId, { type: 'joined', playerId: myId, isHost: false, code: room.code });
      broadcastLobby(room);
    }

    else if (msg.type === 'start_game') {
      if (!myRoom) return;
      const res = startGame(myRoom, myId);
      if (res.error) return sendTo(myId, { type: 'error', message: res.error });
      broadcast(myRoom, { type: 'game_starting', totalRounds: TOTAL_ROUNDS });
      // Countdown 3s then start round 1
      setTimeout(() => doRound(myRoom), 3000);
    }

    else if (msg.type === 'press') {
      if (!myRoom) return;
      const res = recordPress(myRoom, myId);
      if (res.ok) {
        // Broadcast press count so everyone knows someone pressed
        broadcast(myRoom, { type: 'press_update', pressCount: res.pressCount, total: myRoom.players.length });
        // If all players pressed, finalize early
        if (res.pressCount >= myRoom.players.length) {
          clearTimeout(roundTimers[myRoom.code]);
          setTimeout(() => {
            if (myRoom.state === 'active') {
              const result = finalizeRound(myRoom);
              broadcast(myRoom, {
                type: 'round_result',
                round: myRoom.round,
                result: {
                  syncScore: result.syncScore,
                  spreadMs: result.spreadMs,
                  grade: result.grade,
                  missedPlayers: result.missedPlayers,
                  pressDetails: result.pressDetails,
                },
                players: myRoom.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
                state: myRoom.state,
              });
              if (myRoom.state === 'finished') {
                broadcast(myRoom, { type: 'game_over', leaderboard: getLeaderboard(myRoom), roundResults: myRoom.roundResults });
              }
            }
          }, 300); // small delay for drama
        }
      }
    }

    else if (msg.type === 'next_round') {
      if (!myRoom || myId !== myRoom.hostId) return;
      if (myRoom.state === 'results') {
        setTimeout(() => doRound(myRoom), 2000);
        broadcast(myRoom, { type: 'next_round_starting' });
      }
    }

    else if (msg.type === 'play_again') {
      if (!myRoom || myId !== myRoom.hostId) return;
      myRoom.state = 'lobby';
      myRoom.round = 0;
      myRoom.roundResults = [];
      myRoom.players.forEach(p => { p.score = 0; });
      broadcastLobby(myRoom);
    }
  });

  ws.on('close', () => {
    if (!myId || !myRoom) return;
    delete clients[myId];
    removePlayer(myRoom, myId);
    if (myRoom.players.length === 0) {
      delete rooms[myRoom.code];
    } else {
      broadcastLobby(myRoom);
    }
  });
});

console.log(`Sync or Sink WS server running on port ${PORT}`);
