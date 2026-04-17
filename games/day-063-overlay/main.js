const TRANSLATIONS = {
  de: {
    title: 'Overlay', setupLead: 'Pass & Play Stempelduell. Alle bekommen dieselben Zielmuster und dieselben drei Formen. Wer am saubersten überlagert, gewinnt.', playerCount: 'Spieleranzahl', startGame: 'Spiel starten', handoffTitle: 'Gerät weitergeben', handoffHint: 'Nur die aktive Person soll jetzt hinschauen.', readyBtn: 'Ich bin bereit', submitTurn: 'Zug werten', targetBoard: 'Ziel', workBoard: 'Dein Overlay', chooseStamp: 'Stempel', rotate: 'Drehen', clear: 'Neu legen', turnSummary: 'Rundenergebnis', nextTurn: 'Weiter', finalTitle: 'Endstand', playAgain: 'Nochmal spielen', stampLabel: 'Form', setupName: 'Name', scorePreview: 'Vorschau', instruction: 'Tippe auf ein Feld, um den ausgewählten Stempel dort oben links zu platzieren.', perfect: 'Perfekt!', scoreLine: '{name}: {score} Punkte', summaryDetail: '{hits} Treffer, {spill} Spill, {missed} offen', roundLabel: 'Runde {round} / {total}', handoffText: 'Gib das Gerät an {name}!', activeTurn: '{name} ist dran', submitNeed: 'Lege zuerst alle drei Stempel.', rankings: 'Punktestand', defaultPlayer: 'Spieler {n}' },
  en: { title: 'Overlay', setupLead: 'Pass-and-play stencil duel. Everyone gets the same target pattern and the same three shapes. Cleanest overlay wins.', playerCount: 'Player count', startGame: 'Start game', handoffTitle: 'Pass the device', handoffHint: 'Only the active player should look now.', readyBtn: 'I am ready', submitTurn: 'Score turn', targetBoard: 'Target', workBoard: 'Your overlay', chooseStamp: 'Stamp', rotate: 'Rotate', clear: 'Reset layout', turnSummary: 'Round result', nextTurn: 'Continue', finalTitle: 'Final standings', playAgain: 'Play again', stampLabel: 'Shape', setupName: 'Name', scorePreview: 'Preview', instruction: 'Tap a tile to place the selected stamp with its top-left corner there.', perfect: 'Perfect!', scoreLine: '{name}: {score} points', summaryDetail: '{hits} hits, {spill} spill, {missed} open', roundLabel: 'Round {round} / {total}', handoffText: 'Pass the device to {name}!', activeTurn: '{name} is up', submitNeed: 'Place all three stamps first.', rankings: 'Scoreboard', defaultPlayer: 'Player {n}' },
  fr: { title: 'Overlay', setupLead: 'Duel pass & play avec pochoirs. Tout le monde reçoit le même motif cible et les mêmes trois formes. Le recouvrement le plus propre gagne.', playerCount: 'Nombre de joueurs', startGame: 'Commencer', handoffTitle: 'Passez l’appareil', handoffHint: 'Seule la personne active doit regarder maintenant.', readyBtn: 'Je suis prêt', submitTurn: 'Évaluer le tour', targetBoard: 'Cible', workBoard: 'Ton overlay', chooseStamp: 'Pochoir', rotate: 'Pivoter', clear: 'Réinitialiser', turnSummary: 'Résultat du tour', nextTurn: 'Continuer', finalTitle: 'Classement final', playAgain: 'Rejouer', stampLabel: 'Forme', setupName: 'Nom', scorePreview: 'Aperçu', instruction: 'Touchez une case pour placer le pochoir choisi avec son coin supérieur gauche ici.', perfect: 'Parfait !', scoreLine: '{name} : {score} points', summaryDetail: '{hits} touches, {spill} débordement, {missed} vides', roundLabel: 'Manche {round} / {total}', handoffText: 'Passe l’appareil à {name} !', activeTurn: '{name} joue', submitNeed: 'Place d’abord les trois pochoirs.', rankings: 'Scores', defaultPlayer: 'Joueur {n}' },
  it: { title: 'Overlay', setupLead: 'Duello pass-and-play con stencil. Tutti ricevono lo stesso bersaglio e le stesse tre forme. Vince la sovrapposizione più pulita.', playerCount: 'Numero di giocatori', startGame: 'Inizia', handoffTitle: 'Passa il dispositivo', handoffHint: 'Ora deve guardare solo il giocatore attivo.', readyBtn: 'Sono pronto', submitTurn: 'Valuta turno', targetBoard: 'Bersaglio', workBoard: 'Il tuo overlay', chooseStamp: 'Stencil', rotate: 'Ruota', clear: 'Azzera', turnSummary: 'Risultato del round', nextTurn: 'Continua', finalTitle: 'Classifica finale', playAgain: 'Gioca ancora', stampLabel: 'Forma', setupName: 'Nome', scorePreview: 'Anteprima', instruction: 'Tocca una casella per posizionare lo stencil scelto con l’angolo in alto a sinistra lì.', perfect: 'Perfetto!', scoreLine: '{name}: {score} punti', summaryDetail: '{hits} colpi, {spill} eccesso, {missed} vuoti', roundLabel: 'Round {round} / {total}', handoffText: 'Passa il dispositivo a {name}!', activeTurn: 'Tocca a {name}', submitNeed: 'Posiziona prima tutti e tre gli stencil.', rankings: 'Punteggi', defaultPlayer: 'Giocatore {n}' },
  es: { title: 'Overlay', setupLead: 'Duelo pass and play de plantillas. Todos reciben el mismo patrón objetivo y las mismas tres formas. Gana la superposición más limpia.', playerCount: 'Número de jugadores', startGame: 'Empezar', handoffTitle: 'Pasa el dispositivo', handoffHint: 'Ahora solo debe mirar la persona activa.', readyBtn: 'Estoy listo', submitTurn: 'Puntuar turno', targetBoard: 'Objetivo', workBoard: 'Tu overlay', chooseStamp: 'Plantilla', rotate: 'Girar', clear: 'Reiniciar', turnSummary: 'Resultado de la ronda', nextTurn: 'Seguir', finalTitle: 'Clasificación final', playAgain: 'Jugar otra vez', stampLabel: 'Forma', setupName: 'Nombre', scorePreview: 'Vista previa', instruction: 'Toca una casilla para colocar la plantilla elegida con su esquina superior izquierda ahí.', perfect: '¡Perfecto!', scoreLine: '{name}: {score} puntos', summaryDetail: '{hits} aciertos, {spill} exceso, {missed} libres', roundLabel: 'Ronda {round} / {total}', handoffText: '¡Pasa el dispositivo a {name}!', activeTurn: 'Turno de {name}', submitNeed: 'Coloca antes las tres plantillas.', rankings: 'Puntuación', defaultPlayer: 'Jugador {n}' }
};

const { t, translatePage, onLangChange } = initI18n(TRANSLATIONS);
const { STAMPS, cloneStamp, rotateStamp, placeStamp, scoreBoard, createRoundSet } = window.OverlayLogic;

const state = { players: [], rounds: [], roundIndex: 0, playerIndex: 0, placements: [], selectedStamp: 0, stamps: [], scores: [], lastSummary: null };
const $ = (s) => document.querySelector(s);
const screens = ['setup-screen', 'handoff-screen', 'game-screen'];
const boards = { target: $('#target-board'), work: $('#work-board') };

function format(str, vars) { return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? ''); }
function showScreen(id) { for (const name of screens) document.getElementById(name).classList.toggle('active', name === id); }
function byId(id) { return document.getElementById(id); }
function buildPlayerInputs() {
  const wrap = $('#player-inputs');
  wrap.className = 'name-list';
  wrap.innerHTML = '';
  const count = Number($('#player-count').value);
  for (let i = 0; i < count; i++) {
    const input = document.createElement('input');
    input.value = format(t('defaultPlayer'), { n: i + 1 });
    input.setAttribute('aria-label', `${t('setupName')} ${i + 1}`);
    wrap.appendChild(input);
  }
}
function makeBoard(el, clickable) {
  el.innerHTML = '';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.type = 'button';
    cell.dataset.x = x;
    cell.dataset.y = y;
    if (!clickable) cell.disabled = true;
    else cell.addEventListener('click', () => placeCurrentStamp(x, y));
    el.appendChild(cell);
  }
}
function currentRound() { return state.rounds[state.roundIndex]; }
function currentPlayer() { return state.players[state.playerIndex]; }
function refreshTargetBoard() {
  const target = new Set(currentRound().target);
  boards.target.querySelectorAll('.cell').forEach((cell) => {
    const key = `${cell.dataset.x},${cell.dataset.y}`;
    cell.className = 'cell' + (target.has(key) ? ' target' : '');
  });
}
function getCoverage() {
  const covered = new Set();
  for (const placement of state.placements) {
    const placed = placeStamp({ size: 5, target: currentRound().target }, placement.stamp, placement.x, placement.y);
    placed.covered.forEach((cell) => covered.add(cell));
  }
  return [...covered].sort();
}
function refreshWorkBoard(preview) {
  const target = new Set(currentRound().target);
  const covered = new Set(getCoverage());
  const previewSet = new Set(preview || []);
  boards.work.querySelectorAll('.cell').forEach((cell) => {
    const key = `${cell.dataset.x},${cell.dataset.y}`;
    let cls = 'cell';
    if (previewSet.has(key)) cls += ' preview';
    else if (covered.has(key)) cls += target.has(key) ? ' covered' : ' spill';
    cell.className = cls;
  });
  const result = scoreBoard({ target: currentRound().target, covered: [...covered] });
  $('#score-preview').textContent = `${t('scorePreview')}: ${result.score}`;
}
function renderStampOptions() {
  const select = $('#stamp-select');
  select.innerHTML = '';
  state.stamps.forEach((stamp, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${t('stampLabel')} ${index + 1} (${stamp.cells.length})`;
    select.appendChild(option);
  });
  state.selectedStamp = 0;
}
function placeCurrentStamp(x, y) {
  if (!state.stamps.length) return;
  const stamp = state.stamps.splice(state.selectedStamp, 1)[0];
  state.placements.push({ stamp, x, y });
  renderStampOptions();
  refreshWorkBoard();
  if (state.selectedStamp >= state.stamps.length) state.selectedStamp = Math.max(0, state.stamps.length - 1);
  $('#stamp-select').value = String(state.selectedStamp);
}
function setInstruction() {
  $('#instruction').textContent = t('instruction');
}
function startTurn() {
  state.placements = [];
  state.stamps = [cloneStamp(STAMPS[(state.roundIndex + 0) % STAMPS.length]), cloneStamp(STAMPS[(state.roundIndex + 2) % STAMPS.length]), cloneStamp(STAMPS[(state.roundIndex + 4) % STAMPS.length])];
  renderStampOptions();
  byId('round-label').textContent = format(t('roundLabel'), { round: state.roundIndex + 1, total: state.rounds.length });
  byId('active-player').textContent = format(t('activeTurn'), { name: currentPlayer().name });
  refreshTargetBoard();
  refreshWorkBoard();
  setInstruction();
  showScreen('game-screen');
}
function advanceAfterSummary() {
  byId('turn-summary').classList.remove('active');
  state.playerIndex += 1;
  if (state.playerIndex >= state.players.length) {
    state.playerIndex = 0;
    state.roundIndex += 1;
  }
  if (state.roundIndex >= state.rounds.length) return showFinal();
  showHandoff();
}
function showHandoff() {
  showScreen('handoff-screen');
  byId('round-pill').textContent = format(t('roundLabel'), { round: state.roundIndex + 1, total: state.rounds.length });
  byId('handoff-text').textContent = format(t('handoffText'), { name: currentPlayer().name });
}
function submitTurn() {
  if (state.stamps.length) return alert(t('submitNeed'));
  const result = scoreBoard({ target: currentRound().target, covered: getCoverage() });
  state.scores[state.playerIndex] += result.score;
  state.lastSummary = result;
  byId('summary-line').textContent = format(t('scoreLine'), { name: currentPlayer().name, score: result.score });
  byId('summary-detail').textContent = `${format(t('summaryDetail'), result)} ${result.perfect ? '· ' + t('perfect') : ''}`;
  updateScoreboard();
  byId('turn-summary').classList.add('active');
}
function updateScoreboard() {
  const items = state.players.map((player, index) => ({ name: player.name, score: state.scores[index] })).sort((a, b) => b.score - a.score);
  $('#score-board').innerHTML = `<h3>${t('rankings')}</h3><ul>${items.map((item) => `<li><span>${item.name}</span><strong>${item.score}</strong></li>`).join('')}</ul>`;
}
function showFinal() {
  const items = state.players.map((player, index) => ({ name: player.name, score: state.scores[index] })).sort((a, b) => b.score - a.score);
  $('#final-standings').innerHTML = `<ul>${items.map((item) => `<li><span>${item.name}</span><strong>${item.score}</strong></li>`).join('')}</ul>`;
  byId('final-screen').classList.add('active');
}
function resetGame() {
  byId('final-screen').classList.remove('active');
  byId('turn-summary').classList.remove('active');
  showScreen('setup-screen');
}

$('#player-count').addEventListener('change', buildPlayerInputs);
$('#start-btn').addEventListener('click', () => {
  const names = [...document.querySelectorAll('#player-inputs input')].map((input, index) => input.value.trim() || format(t('defaultPlayer'), { n: index + 1 }));
  state.players = names.map((name) => ({ name }));
  state.rounds = createRoundSet(63);
  state.roundIndex = 0;
  state.playerIndex = 0;
  state.scores = new Array(state.players.length).fill(0);
  updateScoreboard();
  showHandoff();
});
$('#ready-btn').addEventListener('click', startTurn);
$('#submit-btn').addEventListener('click', submitTurn);
$('#next-turn-btn').addEventListener('click', advanceAfterSummary);
$('#play-again-btn').addEventListener('click', resetGame);
$('#rotate-btn').addEventListener('click', () => {
  if (!state.stamps.length) return;
  state.stamps[state.selectedStamp] = rotateStamp(state.stamps[state.selectedStamp]);
  renderStampOptions();
  refreshWorkBoard();
});
$('#clear-btn').addEventListener('click', startTurn);
$('#stamp-select').addEventListener('change', (event) => { state.selectedStamp = Number(event.target.value); });
boards.work.addEventListener('pointermove', (event) => {
  const cell = event.target.closest('.cell');
  if (!cell || !state.stamps.length) return refreshWorkBoard();
  const preview = placeStamp({ size: 5, target: currentRound().target }, state.stamps[state.selectedStamp], Number(cell.dataset.x), Number(cell.dataset.y)).covered;
  refreshWorkBoard(preview);
});
boards.work.addEventListener('pointerleave', () => refreshWorkBoard());

makeBoard(boards.target, false); makeBoard(boards.work, true); buildPlayerInputs(); translatePage(); onLangChange(() => { buildPlayerInputs(); updateScoreboard(); setInstruction(); if (state.players.length) showHandoff(); });
