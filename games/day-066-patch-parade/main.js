const TRANSLATIONS = {
  de: {
    title: 'Patch Parade', subtitle: 'Pass & Play Polyomino-Duell: Baut nacheinander eure kleine Paradefläche. Wählt Patches, dreht sie clever und sammelt Reihen-, Stern- und Farb-Boni.', playerCount: 'Wie viele Spieler?', start: 'Spiel starten', continue: 'Weiter', choosePatch: 'Patch wählen', rotate: 'Patch drehen', skip: 'Neu mischen', board: 'Dein Paradebrett', scoreboard: 'Zwischenstand', resultTitle: 'Parade vorbei!', playAgain: 'Noch eine Runde', gold: 'Gold', mint: 'Mint', violet: 'Violett', coral: 'Koralle', starBonus: 'Sternfeld +2', transitionPass: 'Gib das Gerät an {name}!', transitionReady: '{name} ist am Zug. Niemand spicken 😇', roundLabel: 'Runde {round}/{max}', scoreLabel: '{name}: {score} Punkte', placementHint: 'Wähle einen Patch, drehe ihn bei Bedarf und tippe aufs Brett.', boardTip: 'Voller Reihe/Spalte = +2. Größte Farbgruppe am Ende = Bonus.', patchSize: '{count} Felder', patchScore: 'Farbe: {color}', skipLabel: 'Drei neue Patches', winnerLine: '{name} gewinnt mit {score} Punkten!', bonusLine: 'Farbbonus: +{bonus}', emptyHint: 'Tippe zuerst einen Patch an.', invalidHint: 'Der Patch passt dort nicht.', placedHint: '+{score} Punkte für {name}!', nextRoundHint: 'Nächster Spieler ist dran.', startNames: 'Namen eingeben', namePlaceholder: 'Spieler {n}'
  },
  en: {
    title: 'Patch Parade', subtitle: 'Pass & Play polyomino duel. Build your tiny parade board one turn at a time, rotate patches, and chase row, star, and color bonuses.', playerCount: 'How many players?', start: 'Start game', continue: 'Continue', choosePatch: 'Choose a patch', rotate: 'Rotate patch', skip: 'Refresh offer', board: 'Your parade board', scoreboard: 'Scoreboard', resultTitle: 'Parade over!', playAgain: 'Play again', gold: 'Gold', mint: 'Mint', violet: 'Violet', coral: 'Coral', starBonus: 'Star tile +2', transitionPass: 'Pass the device to {name}!', transitionReady: '{name} is up. No peeking 😇', roundLabel: 'Round {round}/{max}', scoreLabel: '{name}: {score} pts', placementHint: 'Pick a patch, rotate it if needed, then tap the board.', boardTip: 'Full row/column = +2. Biggest color group scores a bonus at the end.', patchSize: '{count} cells', patchScore: 'Color: {color}', skipLabel: 'Three fresh patches', winnerLine: '{name} wins with {score} points!', bonusLine: 'Color bonus: +{bonus}', emptyHint: 'Pick a patch first.', invalidHint: 'That patch does not fit there.', placedHint: '+{score} points for {name}!', nextRoundHint: 'Next player up.', startNames: 'Enter player names', namePlaceholder: 'Player {n}'
  },
  fr: {
    title: 'Patch Parade', subtitle: 'Duel polyomino pass & play. Construisez chacun votre mini plateau de parade, tournez les patchs et chassez les bonus de lignes, étoiles et couleurs.', playerCount: 'Combien de joueurs ?', start: 'Lancer la partie', continue: 'Continuer', choosePatch: 'Choisir un patch', rotate: 'Tourner le patch', skip: 'Nouveaux patchs', board: 'Ton plateau', scoreboard: 'Scores', resultTitle: 'Parade terminée !', playAgain: 'Rejouer', gold: 'Or', mint: 'Menthe', violet: 'Violet', coral: 'Corail', starBonus: 'Case étoile +2', transitionPass: 'Passe l’appareil à {name} !', transitionReady: 'C’est à {name}. Pas de triche 😇', roundLabel: 'Manche {round}/{max}', scoreLabel: '{name} : {score} pts', placementHint: 'Choisis un patch, tourne-le si besoin, puis touche le plateau.', boardTip: 'Ligne/colonne complète = +2. Le plus grand groupe de couleur donne un bonus final.', patchSize: '{count} cases', patchScore: 'Couleur : {color}', skipLabel: 'Trois nouveaux patchs', winnerLine: '{name} gagne avec {score} points !', bonusLine: 'Bonus couleur : +{bonus}', emptyHint: 'Choisis d’abord un patch.', invalidHint: 'Ce patch ne rentre pas ici.', placedHint: '+{score} points pour {name} !', nextRoundHint: 'Au joueur suivant.', startNames: 'Entrez les noms', namePlaceholder: 'Joueur {n}'
  },
  it: {
    title: 'Patch Parade', subtitle: 'Duello polyomino pass & play. Costruite il vostro piccolo tabellone da parata, ruotate i patch e inseguite bonus di righe, stelle e colori.', playerCount: 'Quanti giocatori?', start: 'Avvia partita', continue: 'Continua', choosePatch: 'Scegli un patch', rotate: 'Ruota patch', skip: 'Nuova offerta', board: 'La tua plancia', scoreboard: 'Punteggi', resultTitle: 'Parata finita!', playAgain: 'Gioca ancora', gold: 'Oro', mint: 'Menta', violet: 'Viola', coral: 'Corallo', starBonus: 'Casella stella +2', transitionPass: 'Passa il dispositivo a {name}!', transitionReady: 'Tocca a {name}. Niente sbirciate 😇', roundLabel: 'Round {round}/{max}', scoreLabel: '{name}: {score} pt', placementHint: 'Scegli un patch, ruotalo se serve, poi tocca la plancia.', boardTip: 'Riga/colonna completa = +2. Il gruppo colore più grande dà un bonus finale.', patchSize: '{count} celle', patchScore: 'Colore: {color}', skipLabel: 'Tre nuovi patch', winnerLine: '{name} vince con {score} punti!', bonusLine: 'Bonus colore: +{bonus}', emptyHint: 'Prima scegli un patch.', invalidHint: 'Quel patch non entra lì.', placedHint: '+{score} punti per {name}!', nextRoundHint: 'Tocca al prossimo.', startNames: 'Inserisci i nomi', namePlaceholder: 'Giocatore {n}'
  },
  es: {
    title: 'Patch Parade', subtitle: 'Duelo de poliminós pass & play. Construid vuestro pequeño tablero de desfile, girad parches y buscad bonus de filas, estrellas y colores.', playerCount: '¿Cuántos jugadores?', start: 'Empezar partida', continue: 'Continuar', choosePatch: 'Elegir parche', rotate: 'Girar parche', skip: 'Nueva oferta', board: 'Tu tablero', scoreboard: 'Marcador', resultTitle: '¡Desfile terminado!', playAgain: 'Jugar otra vez', gold: 'Oro', mint: 'Menta', violet: 'Violeta', coral: 'Coral', starBonus: 'Casilla estrella +2', transitionPass: '¡Pasa el dispositivo a {name}!', transitionReady: 'Le toca a {name}. Nada de mirar 😇', roundLabel: 'Ronda {round}/{max}', scoreLabel: '{name}: {score} pts', placementHint: 'Elige un parche, gíralo si hace falta y toca el tablero.', boardTip: 'Fila/columna completa = +2. El grupo de color más grande da bonus final.', patchSize: '{count} casillas', patchScore: 'Color: {color}', skipLabel: 'Tres parches nuevos', winnerLine: '¡{name} gana con {score} puntos!', bonusLine: 'Bonus de color: +{bonus}', emptyHint: 'Primero elige un parche.', invalidHint: 'Ese parche no cabe ahí.', placedHint: '¡+{score} puntos para {name}!', nextRoundHint: 'Turno del siguiente.', startNames: 'Introduce los nombres', namePlaceholder: 'Jugador {n}'
  }
};

const { t, onLangChange } = initI18n(TRANSLATIONS);
const screens = {
  setup: document.getElementById('setup-screen'),
  transition: document.getElementById('transition-screen'),
  game: document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};
const state = { game: null, turnIndex: 0, selectedPatchIndex: null, rotation: 0, offer: [], phase: 'setup', seed: 6601, message: '' };
const playerCountSelect = document.getElementById('player-count');
const nameFields = document.getElementById('name-fields');
const offerList = document.getElementById('offer-list');
const boardEl = document.getElementById('board');
const scoreboardEl = document.getElementById('scoreboard');

function fmt(key, vars = {}) { return Object.entries(vars).reduce((text, [k, v]) => text.replaceAll(`{${k}}`, v), t(key)); }
function show(name) { Object.values(screens).forEach((el) => el.classList.remove('active')); screens[name].classList.add('active'); }
function currentPlayer() { return state.game.players[state.turnIndex]; }
function patchWithRotation() {
  if (state.selectedPatchIndex == null) return null;
  const patch = state.offer[state.selectedPatchIndex];
  return { ...patch, cells: rotateCells(patch.cells, state.rotation) };
}
function colorLabel(color) { return t(color); }

function buildSetup() {
  for (let count = 2; count <= 4; count++) {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = String(count);
    playerCountSelect.appendChild(option);
  }
  playerCountSelect.value = '2';
  renderNameFields();
}

function renderNameFields() {
  nameFields.innerHTML = '';
  for (let i = 0; i < Number(playerCountSelect.value); i++) {
    const row = document.createElement('label');
    row.className = 'name-row';
    const span = document.createElement('span');
    span.textContent = `${t('startNames')} ${i + 1}`;
    const input = document.createElement('input');
    input.value = fmt('namePlaceholder', { n: i + 1 });
    input.maxLength = 18;
    row.append(span, input);
    nameFields.appendChild(row);
  }
}

function createOffer() {
  state.offer = createRoundOffer(state.game.round * 10 + state.turnIndex, state.seed + state.game.round * 97 + state.turnIndex);
  state.selectedPatchIndex = null;
  state.rotation = 0;
}

function startGame() {
  const names = [...nameFields.querySelectorAll('input')].map((input, i) => input.value.trim() || fmt('namePlaceholder', { n: i + 1 }));
  state.game = createGame(names, state.seed);
  state.turnIndex = 0;
  createOffer();
  state.phase = 'transition';
  showTransition();
}

function showTransition() {
  const player = currentPlayer();
  document.getElementById('transition-title').textContent = fmt('transitionPass', { name: player.name });
  document.getElementById('transition-copy').textContent = fmt('transitionReady', { name: player.name });
  show('transition');
}

function renderOffer() {
  offerList.innerHTML = '';
  state.offer.forEach((patch, index) => {
    const card = document.createElement('button');
    card.className = 'offer-card' + (index === state.selectedPatchIndex ? ' active' : '');
    const preview = document.createElement('div');
    preview.className = 'patch-preview';
    const cells = (index === state.selectedPatchIndex ? patchWithRotation() : patch).cells;
    const keySet = new Set(cells.map(([x, y]) => `${x},${y}`));
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cell = document.createElement('div');
        cell.className = 'patch-cell' + (keySet.has(`${x},${y}`) ? ` filled ${patch.color}` : '');
        preview.appendChild(cell);
      }
    }
    const title = document.createElement('strong');
    title.textContent = colorLabel(patch.color);
    const size = document.createElement('span');
    size.textContent = fmt('patchSize', { count: patch.cells.length });
    const meta = document.createElement('span');
    meta.textContent = fmt('patchScore', { color: colorLabel(patch.color) });
    card.append(preview, title, size, meta);
    card.addEventListener('click', () => { state.selectedPatchIndex = index; state.rotation = 0; state.message = ''; renderGame(); });
    offerList.appendChild(card);
  });
}

function renderBoard() {
  const player = currentPlayer();
  const previewPatch = patchWithRotation();
  boardEl.innerHTML = '';
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = document.createElement('button');
      cell.className = 'board-cell';
      const color = player.board[y][x];
      if (color) cell.classList.add(color);
      if (player.stars.some((star) => star.x === x && star.y === y)) cell.classList.add('star');
      if (previewPatch && state.hoverX !== undefined && state.hoverY !== undefined) {
        const hit = previewPatch.cells.find(([dx, dy]) => x === dx + state.hoverX && y === dy + state.hoverY);
        if (hit) {
          if (canPlacePatch(player.board, previewPatch, state.hoverX, state.hoverY)) cell.classList.add('preview');
          else cell.classList.add('blocked');
        }
      }
      cell.addEventListener('click', () => { state.hoverX = x; state.hoverY = y; tryPlace(x, y); });
      boardEl.appendChild(cell);
    }
  }
}

function renderScoreboard(scores = state.game.players.map((player) => ({ name: player.name, score: player.score, bonus: 0 }))) {
  scoreboardEl.innerHTML = '';
  scores.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    const bonus = entry.bonus ? ` (${fmt('bonusLine', { bonus: entry.bonus })})` : '';
    row.innerHTML = `<span>${entry.name}</span><strong>${entry.score}${bonus}</strong>`;
    scoreboardEl.appendChild(row);
  });
}

function renderGame() {
  const player = currentPlayer();
  document.getElementById('turn-line').textContent = fmt('scoreLabel', { name: player.name, score: player.score });
  document.getElementById('round-pill').textContent = fmt('roundLabel', { round: state.game.round, max: state.game.maxRounds });
  document.getElementById('score-pill').textContent = `${player.name}`;
  document.getElementById('placement-hint').textContent = state.message || t('placementHint');
  document.getElementById('board-tip').textContent = t('boardTip');
  renderOffer();
  renderBoard();
  renderScoreboard();
  show('game');
}

function advanceTurn() {
  state.turnIndex += 1;
  if (state.turnIndex >= state.game.players.length) {
    state.turnIndex = 0;
    state.game.round += 1;
  }
  if (state.game.round > state.game.maxRounds) {
    showResults();
    return;
  }
  createOffer();
  state.message = t('nextRoundHint');
  showTransition();
}

function tryPlace(x, y) {
  const patch = patchWithRotation();
  if (!patch) {
    state.message = t('emptyHint');
    renderGame();
    return;
  }
  const result = placePatch(state.game, state.turnIndex, patch, x, y);
  if (!result.placed) {
    state.message = t('invalidHint');
    renderGame();
    return;
  }
  state.message = fmt('placedHint', { score: result.scoreDelta, name: currentPlayer().name });
  advanceTurn();
}

function showResults() {
  const scores = getScores(state.game);
  renderScoreboard(scores);
  document.getElementById('final-scores').innerHTML = scoreboardEl.innerHTML;
  document.getElementById('winner-line').textContent = fmt('winnerLine', { name: scores[0].name, score: scores[0].score });
  show('result');
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('continue-btn').addEventListener('click', () => { state.hoverX = 0; state.hoverY = 0; renderGame(); });
document.getElementById('rotate-btn').addEventListener('click', () => { if (state.selectedPatchIndex != null) { state.rotation = (state.rotation + 1) % 4; renderGame(); } });
document.getElementById('skip-btn').addEventListener('click', () => { createOffer(); state.message = t('skipLabel'); renderGame(); });
document.getElementById('restart-btn').addEventListener('click', () => { state.phase = 'setup'; show('setup'); });
playerCountSelect.addEventListener('change', renderNameFields);
onLangChange(() => { renderNameFields(); if (state.game && state.phase !== 'setup') renderGame(); });

buildSetup();
