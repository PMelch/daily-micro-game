const TRANSLATIONS = {
  de: {
    title: 'Floe Showdown',
    subtitle: 'Pass & Play auf brechendem Eis: Rutsch über die Schollen, schnapp dir Fische und lass den anderen nur noch Löcher übrig.',
    playerCount: 'Spieleranzahl',
    playerName: 'Name von Spieler {n}',
    start: 'Spiel starten',
    ready: 'Ich bin bereit',
    boardTitle: 'Eisfeld',
    movesTitle: 'Züge',
    scoreboard: 'Punktestand',
    resultTitle: 'Ergebnis',
    playAgain: 'Nochmal spielen',
    round: 'Runde {current}/{max}',
    currentTurn: '{name} ist dran.',
    transitionTitle: 'Gerät weitergeben',
    transitionCopy: 'Gib das Gerät an {name}! Nur dann auf „Ich bin bereit“ tippen.',
    boardHint: 'Deine Spur bricht hinter dir weg. Jeder Zug verändert das ganze Brett.',
    moveHint: 'Du rutschst immer bis zum nächsten Hindernis. Wähle clever.',
    noMoves: 'Keine Züge mehr.',
    moveUp: 'Nach oben',
    moveRight: 'Nach rechts',
    moveDown: 'Nach unten',
    moveLeft: 'Nach links',
    moveStats: '{distance} Felder · {fish} Fische',
    lastMove: '{name} bekam gerade {fish} Fische.',
    scoreLine: '{score} Fische',
    trapped: 'festgefahren',
    winner: '{name} gewinnt mit {score} Fischen!',
    tied: 'Gleichstand an der Spitze mit {score} Fischen!',
  },
  en: {
    title: 'Floe Showdown', subtitle: 'Pass-and-play on cracking ice: slide across the floes, grab fish, and leave nothing but holes behind.',
    playerCount: 'Player count', playerName: 'Player {n} name', start: 'Start game', ready: 'I am ready', boardTitle: 'Ice field', movesTitle: 'Moves', scoreboard: 'Scoreboard', resultTitle: 'Results', playAgain: 'Play again', round: 'Round {current}/{max}', currentTurn: '{name} is up.', transitionTitle: 'Pass the device', transitionCopy: 'Pass the device to {name}! Only then tap “I am ready”.', boardHint: 'Your trail breaks behind you. Every move changes the whole board.', moveHint: 'You always slide until the next obstacle. Choose wisely.', noMoves: 'No moves left.', moveUp: 'Up', moveRight: 'Right', moveDown: 'Down', moveLeft: 'Left', moveStats: '{distance} tiles · {fish} fish', lastMove: '{name} just grabbed {fish} fish.', scoreLine: '{score} fish', trapped: 'stuck', winner: '{name} wins with {score} fish!', tied: 'Tie at the top with {score} fish!',
  },
  fr: {
    title: 'Floe Showdown', subtitle: 'Pass & play sur une banquise fragile : glisse sur les plaques, attrape des poissons et laisse des trous derrière toi.',
    playerCount: 'Nombre de joueurs', playerName: 'Nom du joueur {n}', start: 'Lancer la partie', ready: 'Je suis prêt', boardTitle: 'Banquise', movesTitle: 'Déplacements', scoreboard: 'Scores', resultTitle: 'Résultat', playAgain: 'Rejouer', round: 'Manche {current}/{max}', currentTurn: 'Au tour de {name}.', transitionTitle: 'Passe l’appareil', transitionCopy: 'Passe l’appareil à {name} ! Appuie ensuite sur « Je suis prêt ».', boardHint: 'Ta trace casse derrière toi. Chaque déplacement transforme le plateau.', moveHint: 'Tu glisses toujours jusqu’au prochain obstacle. Choisis bien.', noMoves: 'Plus aucun déplacement.', moveUp: 'Haut', moveRight: 'Droite', moveDown: 'Bas', moveLeft: 'Gauche', moveStats: '{distance} cases · {fish} poissons', lastMove: '{name} vient de prendre {fish} poissons.', scoreLine: '{score} poissons', trapped: 'bloqué', winner: '{name} gagne avec {score} poissons !', tied: 'Égalité en tête avec {score} poissons !',
  },
  it: {
    title: 'Floe Showdown', subtitle: 'Pass & play sul ghiaccio che si spezza: scivola tra le lastre, prendi pesci e lascia solo buchi dietro di te.',
    playerCount: 'Numero di giocatori', playerName: 'Nome del giocatore {n}', start: 'Inizia partita', ready: 'Sono pronto', boardTitle: 'Campo di ghiaccio', movesTitle: 'Mosse', scoreboard: 'Punteggio', resultTitle: 'Risultato', playAgain: 'Gioca ancora', round: 'Round {current}/{max}', currentTurn: 'Tocca a {name}.', transitionTitle: 'Passa il dispositivo', transitionCopy: 'Passa il dispositivo a {name}! Poi tocca “Sono pronto”.', boardHint: 'La tua scia si rompe dietro di te. Ogni mossa cambia tutta la plancia.', moveHint: 'Scivoli sempre fino al prossimo ostacolo. Scegli bene.', noMoves: 'Nessuna mossa disponibile.', moveUp: 'Su', moveRight: 'Destra', moveDown: 'Giù', moveLeft: 'Sinistra', moveStats: '{distance} caselle · {fish} pesci', lastMove: '{name} ha appena preso {fish} pesci.', scoreLine: '{score} pesci', trapped: 'bloccato', winner: '{name} vince con {score} pesci!', tied: 'Parità in testa con {score} pesci!',
  },
  es: {
    title: 'Floe Showdown', subtitle: 'Pass & play sobre hielo quebradizo: deslízate por las placas, atrapa peces y deja agujeros detrás.',
    playerCount: 'Número de jugadores', playerName: 'Nombre del jugador {n}', start: 'Empezar partida', ready: 'Estoy listo', boardTitle: 'Campo de hielo', movesTitle: 'Movimientos', scoreboard: 'Marcador', resultTitle: 'Resultado', playAgain: 'Jugar otra vez', round: 'Ronda {current}/{max}', currentTurn: 'Turno de {name}.', transitionTitle: 'Pasa el dispositivo', transitionCopy: 'Pasa el dispositivo a {name}. Después toca «Estoy listo».', boardHint: 'Tu rastro se rompe detrás de ti. Cada movimiento cambia todo el tablero.', moveHint: 'Siempre te deslizas hasta el siguiente obstáculo. Elige bien.', noMoves: 'No quedan movimientos.', moveUp: 'Arriba', moveRight: 'Derecha', moveDown: 'Abajo', moveLeft: 'Izquierda', moveStats: '{distance} casillas · {fish} peces', lastMove: '{name} acaba de conseguir {fish} peces.', scoreLine: '{score} peces', trapped: 'atascado', winner: '¡{name} gana con {score} peces!', tied: '¡Empate en cabeza con {score} peces!',
  },
};

const PAWN_COLORS = ['#ffcf6b', '#7bffcc', '#f38bff', '#ff9d7a'];
const { t, translatePage } = initI18n(TRANSLATIONS);
const {
  createGame,
  getValidMoves,
  applyMove,
  computeWinner,
} = window.FloeShowdown;

const state = {
  game: null,
  previewDirection: null,
};

const screens = {
  setup: document.getElementById('setup-screen'),
  transition: document.getElementById('transition-screen'),
  game: document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

const playerCountEl = document.getElementById('player-count');
const nameFieldsEl = document.getElementById('name-fields');
const startBtn = document.getElementById('start-btn');
const readyBtn = document.getElementById('ready-btn');
const restartBtn = document.getElementById('restart-btn');
const transitionTitleEl = document.getElementById('transition-title');
const transitionCopyEl = document.getElementById('transition-copy');
const turnLineEl = document.getElementById('turn-line');
const roundPillEl = document.getElementById('round-pill');
const statusPillEl = document.getElementById('status-pill');
const boardHintEl = document.getElementById('board-hint');
const moveHintEl = document.getElementById('move-hint');
const boardEl = document.getElementById('board');
const moveListEl = document.getElementById('move-list');
const scoreboardEl = document.getElementById('scoreboard');
const finalScoresEl = document.getElementById('final-scores');
const winnerLineEl = document.getElementById('winner-line');

function format(key, vars = {}) {
  return Object.entries(vars).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key));
}

function setScreen(name) {
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle('active', key === name));
}

function buildNameFields() {
  const count = Number(playerCountEl.value);
  nameFieldsEl.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const input = document.createElement('input');
    input.id = `player-${i}`;
    input.value = `Spieler ${i + 1}`;
    input.placeholder = format('playerName', { n: i + 1 });
    input.setAttribute('data-i18n-placeholder', 'playerName');
    nameFieldsEl.appendChild(input);
  }
}

function getNames() {
  return [...nameFieldsEl.querySelectorAll('input')].map((input, index) => input.value.trim() || `Spieler ${index + 1}`);
}

function showTransition() {
  const active = state.game.players[state.game.currentPlayerIndex];
  transitionTitleEl.textContent = t('transitionTitle');
  transitionCopyEl.textContent = format('transitionCopy', { name: active.name });
  setScreen('transition');
}

function renderBoard() {
  const active = state.game.players[state.game.currentPlayerIndex];
  const preview = state.previewDirection ? getValidMoves(state.game).find((move) => move.direction === state.previewDirection) : null;
  const previewCells = new Set((preview?.path || []).map((step) => `${step.x},${step.y}`));
  boardEl.innerHTML = '';

  state.game.board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const tile = document.createElement('div');
      tile.className = 'cell';
      if (cell.sunk) tile.classList.add('sunk');
      if (previewCells.has(`${x},${y}`)) tile.classList.add('preview');
      if (active.pos.x === x && active.pos.y === y) tile.classList.add('current');

      if (cell.sunk) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        tile.appendChild(hole);
      } else if (cell.fish > 0) {
        const fish = document.createElement('span');
        fish.className = 'fish';
        fish.textContent = '🐟'.repeat(Math.min(cell.fish, 3));
        tile.appendChild(fish);
      }

      state.game.players.forEach((player, index) => {
        if (player.pos.x !== x || player.pos.y !== y) return;
        const pawn = document.createElement('div');
        pawn.className = 'pawn';
        pawn.style.background = PAWN_COLORS[index % PAWN_COLORS.length];
        pawn.textContent = player.name.slice(0, 1).toUpperCase();
        tile.appendChild(pawn);
      });

      boardEl.appendChild(tile);
    });
  });
}

function renderMoves() {
  const moves = getValidMoves(state.game);
  moveListEl.innerHTML = '';
  if (!moves.length) {
    moveHintEl.textContent = t('noMoves');
    return;
  }
  moveHintEl.textContent = t('moveHint');

  moves.forEach((move) => {
    const button = document.createElement('button');
    button.className = 'move-btn';
    button.dataset.direction = move.direction;
    button.innerHTML = `<strong>${t(`move${move.direction[0].toUpperCase()}${move.direction.slice(1)}`)}</strong><span>${format('moveStats', { distance: move.distance, fish: move.fish })}</span>`;
    button.addEventListener('mouseenter', () => { state.previewDirection = move.direction; renderBoard(); });
    button.addEventListener('focus', () => { state.previewDirection = move.direction; renderBoard(); });
    button.addEventListener('click', () => {
      state.previewDirection = move.direction;
      const result = applyMove(state.game, move.direction);
      if (!result.ok) return;
      if (state.game.status === 'finished') {
        renderResults();
      } else {
        showTransition();
      }
    });
    moveListEl.appendChild(button);
  });
}

function renderScoreboard(target, includeActive = true) {
  const rows = computeWinner(state.game.players);
  target.innerHTML = '';
  rows.forEach((entry) => {
    const player = state.game.players.find((item) => item.name === entry.name);
    const row = document.createElement('div');
    row.className = 'score-row';
    if (includeActive && player && state.game.players[state.game.currentPlayerIndex]?.name === entry.name) row.classList.add('active');
    row.innerHTML = `
      <div class="score-name">
        <span class="badge" style="background:${PAWN_COLORS[player.id % PAWN_COLORS.length]}">${player.name.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>${entry.name}</strong>
          ${player.trapped ? `<div class="trapped-note">${t('trapped')}</div>` : ''}
        </div>
      </div>
      <strong>${format('scoreLine', { score: entry.score })}</strong>
    `;
    target.appendChild(row);
  });
}

function renderGame() {
  const active = state.game.players[state.game.currentPlayerIndex];
  translatePage();
  turnLineEl.textContent = format('currentTurn', { name: active.name });
  roundPillEl.textContent = format('round', { current: Math.min(state.game.round, state.game.maxRounds), max: state.game.maxRounds });
  statusPillEl.textContent = state.game.lastMove ? format('lastMove', { name: state.game.lastMove.player, fish: state.game.lastMove.gained }) : t('boardHint');
  boardHintEl.textContent = t('boardHint');
  renderBoard();
  renderMoves();
  renderScoreboard(scoreboardEl, true);
  setScreen('game');
}

function renderResults() {
  renderScoreboard(finalScoresEl, false);
  const ranking = computeWinner(state.game.players);
  if (ranking[0] && ranking[1] && ranking[0].score === ranking[1].score) {
    winnerLineEl.textContent = format('tied', { score: ranking[0].score });
  } else if (ranking[0]) {
    winnerLineEl.textContent = format('winner', { name: ranking[0].name, score: ranking[0].score });
  }
  setScreen('result');
}

playerCountEl.innerHTML = [2, 3, 4].map((count) => `<option value="${count}">${count}</option>`).join('');
playerCountEl.addEventListener('change', buildNameFields);
startBtn.addEventListener('click', () => {
  const names = getNames();
  state.game = createGame(names, 68);
  state.previewDirection = null;
  showTransition();
});
readyBtn.addEventListener('click', renderGame);
restartBtn.addEventListener('click', () => {
  state.game = null;
  state.previewDirection = null;
  buildNameFields();
  setScreen('setup');
});

buildNameFields();
translatePage();
