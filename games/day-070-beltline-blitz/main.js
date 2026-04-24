import { BOARD_SIZE, createGame, applyTurn } from './logic.js';

const ARROWS = { up: '↑', right: '→', down: '↓', left: '←' };
const TRANSLATIONS = {
  de: {
    title: 'Beltline Blitz',
    subtitle: 'Pass & Play Förderband-Sabotage! Drehe pro Zug genau ein Band, dann rollen ALLE Kisten gleichzeitig weiter. Liefere deine Farbe ab und schieb die anderen ins Chaos.',
    playerCount: 'Spieleranzahl',
    start: 'Schicht starten',
    ready: 'Bereit',
    boardTitle: 'Werkhalle',
    scoreboard: 'Punktestand',
    logTitle: 'Letzter Zug',
    resultTitle: 'Schicht beendet',
    playAgain: 'Nochmal spielen',
    boardHint: 'Tippe ein Feld: Es dreht sich im Uhrzeigersinn, dann laufen alle Kisten 1 Schritt.',
    turnLabel: 'Zug {turn} / {max}',
    statusLabel: '{name} ist am Zug',
    transitionTitle: 'Nächste Schicht',
    transitionCopy: 'Gib das Gerät an {name}!',
    turnLine: '{name} dreht jetzt ein Förderband.',
    winnerSingle: '{name} gewinnt mit {score} Punkten.',
    winnerTie: '{names} teilen sich den Sieg mit {score} Punkten.',
    scoreLine: '{score} Punkte',
    energyHint: '⚡ = Bonuspunkt, Ausfahrt = 3 Punkte',
    logIdle: 'Noch kein Zug gespielt. Gleich dreht hier jemand die Halle auf links.',
    logRotate: '{name} drehte Feld ({x}, {y}).',
    logDeliveryOne: '{name} lieferte eine Kiste ab (+3).',
    logDeliveryMany: '{count} Lieferungen in diesem Zug.',
    logJam: 'Stau bei Feld ({x}, {y}) — niemand kam durch.',
    logEnergy: '{name} schnappte sich einen Bonusfunken (+1).',
    playerRole: 'Ausfahrt {icon}',
  },
  en: {
    title: 'Beltline Blitz',
    subtitle: 'Pass-and-play conveyor sabotage! Rotate exactly one belt per turn, then EVERY crate moves at once. Deliver your color and nudge everyone else into trouble.',
    playerCount: 'Number of players',
    start: 'Start shift',
    ready: 'Ready',
    boardTitle: 'Factory floor',
    scoreboard: 'Scoreboard',
    logTitle: 'Last turn',
    resultTitle: 'Shift complete',
    playAgain: 'Play again',
    boardHint: 'Tap any tile: it rotates clockwise, then all crates move 1 step.',
    turnLabel: 'Turn {turn} / {max}',
    statusLabel: '{name} is up',
    transitionTitle: 'Next operator',
    transitionCopy: 'Pass the device to {name}!',
    turnLine: '{name} is rotating a conveyor now.',
    winnerSingle: '{name} wins with {score} points.',
    winnerTie: '{names} share the win with {score} points.',
    scoreLine: '{score} points',
    energyHint: '⚡ = bonus point, exit = 3 points',
    logIdle: 'No turn yet. Someone is about to reroute the whole factory.',
    logRotate: '{name} rotated tile ({x}, {y}).',
    logDeliveryOne: '{name} delivered a crate (+3).',
    logDeliveryMany: '{count} deliveries happened this turn.',
    logJam: 'Jam at tile ({x}, {y}) — nobody got through.',
    logEnergy: '{name} grabbed a spark bonus (+1).',
    playerRole: 'Exit {icon}',
  },
  fr: {
    title: 'Beltline Blitz',
    subtitle: 'Sabotage de convoyeurs en pass & play ! Tourne exactement une case par tour, puis TOUTES les caisses avancent ensemble. Livre ta couleur et dérègle les autres.',
    playerCount: 'Nombre de joueurs',
    start: 'Lancer la rotation',
    ready: 'Prêt',
    boardTitle: 'Atelier',
    scoreboard: 'Scores',
    logTitle: 'Dernier tour',
    resultTitle: 'Service terminé',
    playAgain: 'Rejouer',
    boardHint: 'Touche une case : elle tourne dans le sens horaire, puis toutes les caisses avancent d’une case.',
    turnLabel: 'Tour {turn} / {max}',
    statusLabel: '{name} joue',
    transitionTitle: 'Opérateur suivant',
    transitionCopy: 'Passe l’appareil à {name} !',
    turnLine: '{name} va tourner un convoyeur.',
    winnerSingle: '{name} gagne avec {score} points.',
    winnerTie: '{names} partagent la victoire avec {score} points.',
    scoreLine: '{score} points',
    energyHint: '⚡ = point bonus, sortie = 3 points',
    logIdle: 'Aucun tour pour le moment. Quelqu’un va bientôt dérégler toute l’usine.',
    logRotate: '{name} a tourné la case ({x}, {y}).',
    logDeliveryOne: '{name} a livré une caisse (+3).',
    logDeliveryMany: '{count} livraisons pendant ce tour.',
    logJam: 'Bouchon sur la case ({x}, {y}) — personne ne passe.',
    logEnergy: '{name} a récupéré une étincelle bonus (+1).',
    playerRole: 'Sortie {icon}',
  },
  it: {
    title: 'Beltline Blitz',
    subtitle: 'Sabotaggio pass-and-play sui nastri! Ruota esattamente una casella per turno, poi TUTTE le casse si muovono insieme. Consegna il tuo colore e manda gli altri in tilt.',
    playerCount: 'Numero di giocatori',
    start: 'Avvia il turno',
    ready: 'Pronto',
    boardTitle: 'Officina',
    scoreboard: 'Punteggio',
    logTitle: 'Ultimo turno',
    resultTitle: 'Turno finito',
    playAgain: 'Gioca ancora',
    boardHint: 'Tocca una casella: ruota in senso orario, poi tutte le casse avanzano di 1 passo.',
    turnLabel: 'Turno {turn} / {max}',
    statusLabel: 'Tocca a {name}',
    transitionTitle: 'Prossimo operatore',
    transitionCopy: 'Passa il dispositivo a {name}!',
    turnLine: '{name} sta ruotando un nastro.',
    winnerSingle: '{name} vince con {score} punti.',
    winnerTie: '{names} condividono la vittoria con {score} punti.',
    scoreLine: '{score} punti',
    energyHint: '⚡ = punto bonus, uscita = 3 punti',
    logIdle: 'Nessun turno ancora. Qualcuno sta per ribaltare tutta la fabbrica.',
    logRotate: '{name} ha ruotato la casella ({x}, {y}).',
    logDeliveryOne: '{name} ha consegnato una cassa (+3).',
    logDeliveryMany: '{count} consegne in questo turno.',
    logJam: 'Ingorgo sulla casella ({x}, {y}) — nessuno passa.',
    logEnergy: '{name} ha preso una scintilla bonus (+1).',
    playerRole: 'Uscita {icon}',
  },
  es: {
    title: 'Beltline Blitz',
    subtitle: '¡Sabotaje pass and play de cintas! Gira exactamente una casilla por turno y luego TODAS las cajas avanzan a la vez. Entrega tu color y mete al resto en problemas.',
    playerCount: 'Número de jugadores',
    start: 'Empezar turno',
    ready: 'Listo',
    boardTitle: 'Fábrica',
    scoreboard: 'Marcador',
    logTitle: 'Último turno',
    resultTitle: 'Turno terminado',
    playAgain: 'Jugar otra vez',
    boardHint: 'Toca cualquier casilla: gira en sentido horario y luego todas las cajas avanzan 1 paso.',
    turnLabel: 'Turno {turn} / {max}',
    statusLabel: 'Le toca a {name}',
    transitionTitle: 'Siguiente operario',
    transitionCopy: '¡Pasa el dispositivo a {name}!',
    turnLine: '{name} va a girar una cinta ahora.',
    winnerSingle: '{name} gana con {score} puntos.',
    winnerTie: '{names} comparten la victoria con {score} puntos.',
    scoreLine: '{score} puntos',
    energyHint: '⚡ = punto extra, salida = 3 puntos',
    logIdle: 'Todavía no hay turnos. Alguien está a punto de desordenar toda la fábrica.',
    logRotate: '{name} giró la casilla ({x}, {y}).',
    logDeliveryOne: '{name} entregó una caja (+3).',
    logDeliveryMany: 'Hubo {count} entregas en este turno.',
    logJam: 'Atasco en la casilla ({x}, {y}) — nadie pasó.',
    logEnergy: '{name} recogió una chispa bonus (+1).',
    playerRole: 'Salida {icon}',
  },
};

const screens = {
  setup: document.querySelector('#setup-screen'),
  transition: document.querySelector('#transition-screen'),
  game: document.querySelector('#game-screen'),
  result: document.querySelector('#result-screen'),
};

const elements = {
  playerCount: document.querySelector('#player-count'),
  nameFields: document.querySelector('#name-fields'),
  startBtn: document.querySelector('#start-btn'),
  readyBtn: document.querySelector('#ready-btn'),
  restartBtn: document.querySelector('#restart-btn'),
  transitionTitle: document.querySelector('#transition-title'),
  transitionCopy: document.querySelector('#transition-copy'),
  turnLine: document.querySelector('#turn-line'),
  turnPill: document.querySelector('#turn-pill'),
  statusPill: document.querySelector('#status-pill'),
  boardHint: document.querySelector('#board-hint'),
  board: document.querySelector('#board'),
  scoreboard: document.querySelector('#scoreboard'),
  logBox: document.querySelector('#log-box'),
  winnerLine: document.querySelector('#winner-line'),
  finalScores: document.querySelector('#final-scores'),
};

const { t, onLangChange } = window.initI18n(TRANSLATIONS);
let game = null;
let phase = 'setup';

setupPlayerCount();
renderNameFields();
render();

onLangChange(() => render());

elements.playerCount.addEventListener('change', () => renderNameFields());
elements.startBtn.addEventListener('click', startGame);
elements.readyBtn.addEventListener('click', () => {
  phase = game.status === 'finished' ? 'result' : 'game';
  render();
});
elements.restartBtn.addEventListener('click', () => {
  phase = 'setup';
  game = null;
  render();
});

function setupPlayerCount() {
  [2, 3, 4].forEach((count) => {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = String(count);
    elements.playerCount.appendChild(option);
  });
  elements.playerCount.value = '2';
}

function renderNameFields() {
  const count = Number(elements.playerCount.value);
  elements.nameFields.innerHTML = '';
  for (let index = 0; index < count; index += 1) {
    const input = document.createElement('input');
    input.id = `player-${index}`;
    input.value = `Spieler ${index + 1}`;
    input.placeholder = `Spieler ${index + 1}`;
    elements.nameFields.appendChild(input);
  }
}

function startGame() {
  const names = [...elements.nameFields.querySelectorAll('input')].map((input, index) => input.value.trim() || `Spieler ${index + 1}`);
  game = createGame(names, 70);
  phase = 'transition';
  render();
}

function render() {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle('active', key === phase));
  if (phase === 'setup') return;
  if (!game) return;

  const currentPlayer = game.players[game.currentPlayerIndex];
  elements.transitionTitle.textContent = t('transitionTitle');
  elements.transitionCopy.textContent = fmt('transitionCopy', { name: currentPlayer.name });
  elements.turnLine.textContent = fmt('turnLine', { name: currentPlayer.name });
  elements.turnPill.textContent = fmt('turnLabel', { turn: Math.min(game.turn, game.maxTurns), max: game.maxTurns });
  elements.statusPill.textContent = fmt('statusLabel', { name: currentPlayer.name });
  elements.boardHint.textContent = `${t('boardHint')} ${t('energyHint')}`;

  renderBoard();
  renderScoreboard(elements.scoreboard);
  renderLog();
  renderResult();
}

function renderBoard() {
  elements.board.innerHTML = '';
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile';
      button.dataset.x = String(x);
      button.dataset.y = String(y);
      button.setAttribute('aria-label', `tile-${x}-${y}`);
      if (phase !== 'game' || game.status === 'finished') {
        button.disabled = true;
      }
      button.innerHTML = `
        <span class="tile-arrow">${ARROWS[game.board[y][x].dir]}</span>
        ${game.energy.some((cell) => cell.x === x && cell.y === y) ? '<span class="tile-energy">⚡</span>' : ''}
        <span class="token-stack"></span>
      `;
      const stack = button.querySelector('.token-stack');
      game.players.forEach((player) => {
        if (player.pos.x === x && player.pos.y === y) {
          const token = document.createElement('span');
          token.className = 'token';
          token.style.background = player.color;
          token.title = player.name;
          stack.appendChild(token);
        }
      });
      button.addEventListener('click', () => handleTileClick(x, y));
      elements.board.appendChild(button);
    }
  }
}

function renderScoreboard(container) {
  container.innerHTML = '';
  const ordered = [...game.players].sort((a, b) => b.score - a.score);
  ordered.forEach((player) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
      <span class="score-chip" style="background:${player.color}"></span>
      <div class="score-meta">
        <strong>${player.name}</strong>
        <small>${fmt('playerRole', { icon: player.icon })}</small>
      </div>
      <strong>${fmt('scoreLine', { score: player.score })}</strong>
    `;
    container.appendChild(row);
  });
}

function renderLog() {
  elements.logBox.innerHTML = '';
  if (!game.lastTurn) {
    elements.logBox.textContent = t('logIdle');
    return;
  }
  const actor = game.players[game.lastTurn.playerIndex];
  pushLog(fmt('logRotate', { name: actor.name, x: game.lastTurn.rotated.x + 1, y: game.lastTurn.rotated.y + 1 }));
  if (game.lastTurn.deliveries.length === 1) {
    const delivery = game.lastTurn.deliveries[0];
    pushLog(fmt('logDeliveryOne', { name: game.players[delivery.playerIndex].name }));
  } else if (game.lastTurn.deliveries.length > 1) {
    pushLog(fmt('logDeliveryMany', { count: game.lastTurn.deliveries.length }));
  }
  game.lastTurn.jams.forEach((jam) => pushLog(fmt('logJam', { x: jam.x + 1, y: jam.y + 1 })));
  game.lastTurn.collected.forEach((entry) => pushLog(fmt('logEnergy', { name: game.players[entry.playerIndex].name })));
}

function renderResult() {
  renderScoreboard(elements.finalScores);
  const winners = game.winners;
  if (!winners.length) return;
  if (winners.length === 1) {
    elements.winnerLine.textContent = fmt('winnerSingle', winners[0]);
  } else {
    elements.winnerLine.textContent = fmt('winnerTie', {
      names: winners.map((winner) => winner.name).join(', '),
      score: winners[0].score,
    });
  }
}

function handleTileClick(x, y) {
  if (phase !== 'game' || game.status === 'finished') return;
  applyTurn(game, x, y);
  phase = game.status === 'finished' ? 'result' : 'transition';
  render();
}

function pushLog(text) {
  const line = document.createElement('div');
  line.textContent = `• ${text}`;
  elements.logBox.appendChild(line);
}

function fmt(key, vars) {
  return Object.entries(vars).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), t(key));
}
