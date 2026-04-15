const TRANSLATIONS = {
  de: {
    title: 'Bank Shot', setupLead: 'Ein Pass-and-Play-Ricochetspiel. Jede Runde bekommt ihr dasselbe Brett, zielt einen einzigen Schuss und kassiert Glitzer-Gems mit Banden-Bonus.', playerCount: 'Anzahl Spieler', startGame: 'Spiel starten', handoffTitle: 'Gerät weitergeben', handoffHint: 'Nur diese Person schaut jetzt aufs Display.', readyBtn: 'Ich bin bereit', shoot: 'Schuss abfeuern', aimHint: 'Tippe ins Feld, um zu zielen. Je besser der Winkel, desto mehr Gems.', turnResult: 'Rundenergebnis', nextTurn: 'Weiter', finalTitle: 'Endstand', playAgain: 'Nochmal spielen', roundLabel: 'Runde {round} / {rounds}', handoffText: 'Gib das Gerät an {name}!', activeTurn: '{name} ist am Zug', scoreLine: '{name}: {score} Punkte', summaryScore: '+{score} Punkte', summaryDetail: '{gems} Gems, {banks} Banden', winner: 'Gewinner', playerName: 'Spieler {n}', tieLabel: 'Unentschieden an der Spitze', back: '← Zurück zu den Spielen' },
  en: {
    title: 'Bank Shot', setupLead: 'A pass-and-play ricochet game. Everyone gets the same board, aims one shot, and chases gems plus bank bonuses.', playerCount: 'Number of players', startGame: 'Start game', handoffTitle: 'Pass the device', handoffHint: 'Only this player should look now.', readyBtn: 'I am ready', shoot: 'Take shot', aimHint: 'Tap the board to aim. Better angles mean more gems.', turnResult: 'Turn result', nextTurn: 'Continue', finalTitle: 'Final standings', playAgain: 'Play again', roundLabel: 'Round {round} / {rounds}', handoffText: 'Pass the device to {name}!', activeTurn: '{name} is up', scoreLine: '{name}: {score} points', summaryScore: '+{score} points', summaryDetail: '{gems} gems, {banks} banks', winner: 'Winner', playerName: 'Player {n}', tieLabel: 'Tie at the top', back: '← Back to Games' },
  fr: {
    title: 'Bank Shot', setupLead: 'Un jeu pass and play de ricochets. Même plateau pour tout le monde, un seul tir, et des gemmes à ramasser avec bonus de rebond.', playerCount: 'Nombre de joueurs', startGame: 'Lancer la partie', handoffTitle: 'Passe l’appareil', handoffHint: 'Seule cette personne doit regarder maintenant.', readyBtn: 'Je suis prêt', shoot: 'Tirer', aimHint: 'Touchez le plateau pour viser. Les meilleurs angles rapportent plus.', turnResult: 'Résultat du tour', nextTurn: 'Continuer', finalTitle: 'Classement final', playAgain: 'Rejouer', roundLabel: 'Manche {round} / {rounds}', handoffText: 'Passe l’appareil à {name} !', activeTurn: 'Tour de {name}', scoreLine: '{name} : {score} points', summaryScore: '+{score} points', summaryDetail: '{gems} gemmes, {banks} rebonds', winner: 'Gagnant', playerName: 'Joueur {n}', tieLabel: 'Égalité en tête', back: '← Retour aux jeux' },
  it: {
    title: 'Bank Shot', setupLead: 'Un gioco pass and play di rimbalzi. Tutti ricevono la stessa plancia, fanno un solo tiro e raccolgono gemme con bonus sponda.', playerCount: 'Numero di giocatori', startGame: 'Avvia gioco', handoffTitle: 'Passa il dispositivo', handoffHint: 'Ora dovrebbe guardare solo questo giocatore.', readyBtn: 'Sono pronto', shoot: 'Tira', aimHint: 'Tocca il campo per mirare. Gli angoli migliori rendono di più.', turnResult: 'Risultato del turno', nextTurn: 'Continua', finalTitle: 'Classifica finale', playAgain: 'Gioca ancora', roundLabel: 'Round {round} / {rounds}', handoffText: 'Passa il dispositivo a {name}!', activeTurn: 'Tocca a {name}', scoreLine: '{name}: {score} punti', summaryScore: '+{score} punti', summaryDetail: '{gems} gemme, {banks} sponde', winner: 'Vincitore', playerName: 'Giocatore {n}', tieLabel: 'Parità in testa', back: '← Torna ai giochi' },
  es: {
    title: 'Bank Shot', setupLead: 'Un juego pass and play de rebotes. Todos reciben el mismo tablero, hacen un solo disparo y cazan gemas con bonus por banda.', playerCount: 'Número de jugadores', startGame: 'Empezar juego', handoffTitle: 'Pasa el dispositivo', handoffHint: 'Ahora solo debe mirar esa persona.', readyBtn: 'Estoy listo', shoot: 'Disparar', aimHint: 'Toca el tablero para apuntar. Los buenos ángulos dan más.', turnResult: 'Resultado del turno', nextTurn: 'Continuar', finalTitle: 'Clasificación final', playAgain: 'Jugar otra vez', roundLabel: 'Ronda {round} / {rounds}', handoffText: '¡Pasa el dispositivo a {name}!', activeTurn: 'Turno de {name}', scoreLine: '{name}: {score} puntos', summaryScore: '+{score} puntos', summaryDetail: '{gems} gemas, {banks} rebotes', winner: 'Ganador', playerName: 'Jugador {n}', tieLabel: 'Empate en cabeza', back: '← Volver a los juegos' }
};

const { t, translatePage, onLangChange } = initI18n(TRANSLATIONS);
document.querySelector('.back-bar a').textContent = t('back');

const ROUNDS = 3;
const screens = {
  setup: document.getElementById('setup-screen'),
  handoff: document.getElementById('handoff-screen'),
  game: document.getElementById('game-screen'),
  summary: document.getElementById('turn-summary'),
  final: document.getElementById('final-screen'),
};
const playerCountEl = document.getElementById('player-count');
const playerInputsEl = document.getElementById('player-inputs');
const roundPill = document.getElementById('round-pill');
const handoffText = document.getElementById('handoff-text');
const roundLabel = document.getElementById('round-label');
const activePlayer = document.getElementById('active-player');
const scoreBoard = document.getElementById('score-board');
const shootBtn = document.getElementById('shoot-btn');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const summaryScore = document.getElementById('summary-score');
const summaryDetail = document.getElementById('summary-detail');
const finalStandings = document.getElementById('final-standings');

let state = null;
let board = null;
let aim = { x: 160, y: 140 };
let shotResult = null;
let animFrame = 0;
let animIndex = 0;

function fmt(key, vars) {
  let text = t(key);
  Object.entries(vars || {}).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
  return text;
}

function showScreen(name) {
  Object.values(screens).forEach(el => el.classList.remove('active'));
  screens[name].classList.add('active');
}

function renderPlayerInputs() {
  const count = Number(playerCountEl.value);
  playerInputsEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'player-row';
    const label = document.createElement('label');
    label.setAttribute('for', `player-${i}`);
    label.textContent = fmt('playerName', { n: i + 1 });
    const input = document.createElement('input');
    input.id = `player-${i}`;
    input.value = fmt('playerName', { n: i + 1 });
    wrap.append(label, input);
    playerInputsEl.appendChild(wrap);
  }
}

function currentPlayer() { return state.players[state.currentPlayerIndex]; }

function boardSeed() {
  return 6100 + (state.round * 10) + state.currentPlayerIndex;
}

function startTurn() {
  board = BankShotLogic.createBoard(boardSeed());
  aim = { x: 160, y: 140 };
  shotResult = null;
  renderHud();
  drawBoard();
  shootBtn.disabled = false;
  showScreen('game');
}

function renderHud() {
  roundPill.textContent = fmt('roundLabel', { round: state.round, rounds: state.rounds });
  roundLabel.textContent = fmt('roundLabel', { round: state.round, rounds: state.rounds });
  activePlayer.textContent = fmt('activeTurn', { name: currentPlayer().name });
  scoreBoard.innerHTML = '';
  state.players.forEach((player, index) => {
    const row = document.createElement('div');
    row.className = 'score-row' + (index === state.currentPlayerIndex ? ' active' : '');
    row.innerHTML = `<span>${player.name}</span><strong>${player.score}</strong>`;
    scoreBoard.appendChild(row);
  });
}

function drawBoard(trailProgress = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#091024';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }

  board.bumpers.forEach(b => {
    ctx.fillStyle = '#6fd3ff';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dff7ff';
    ctx.beginPath(); ctx.arc(b.x - 4, b.y - 4, 4, 0, Math.PI * 2); ctx.fill();
  });

  board.gems.forEach(g => {
    if (shotResult && shotResult.collected.includes(g.id)) return;
    ctx.fillStyle = g.value >= 5 ? '#ffcc00' : g.value >= 3 ? '#ff7a7a' : '#8dffb1';
    ctx.beginPath(); ctx.moveTo(g.x, g.y - g.r); ctx.lineTo(g.x + g.r, g.y); ctx.lineTo(g.x, g.y + g.r); ctx.lineTo(g.x - g.r, g.y); ctx.closePath(); ctx.fill();
  });

  ctx.fillStyle = '#f5f7ff';
  ctx.beginPath(); ctx.arc(board.start.x, board.start.y, 12, 0, Math.PI * 2); ctx.fill();

  if (!shotResult) {
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(board.start.x, board.start.y); ctx.lineTo(aim.x, aim.y); ctx.stroke();
  }

  if (shotResult) {
    const count = Math.max(1, Math.floor(shotResult.trail.length * trailProgress));
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    shotResult.trail.slice(0, count).forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    const puck = shotResult.trail[Math.min(count - 1, shotResult.trail.length - 1)] || board.start;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(puck.x, puck.y, 10, 0, Math.PI * 2); ctx.fill();
  }
}

function animateShot() {
  cancelAnimationFrame(animFrame);
  animIndex = 0;
  const total = shotResult.trail.length;
  const stepSize = Math.max(4, Math.ceil(total / 45));
  function step() {
    animIndex += stepSize;
    drawBoard(Math.min(1, animIndex / total));
    if (animIndex < total) {
      animFrame = requestAnimationFrame(step);
    } else {
      openSummary();
    }
  }
  step();
}

function openSummary() {
  summaryScore.textContent = fmt('summaryScore', { score: shotResult.score });
  summaryScore.className = 'summary-big';
  summaryDetail.textContent = fmt('summaryDetail', { gems: shotResult.collected.length, banks: shotResult.bankShots });
  showScreen('summary');
}

function openHandoff() {
  renderHud();
  handoffText.textContent = fmt('handoffText', { name: currentPlayer().name });
  showScreen('handoff');
}

function openFinal() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  finalStandings.innerHTML = '';
  const topScore = sorted[0].score;
  const winners = sorted.filter(p => p.score === topScore);
  const title = document.createElement('p');
  title.className = 'pill';
  title.textContent = winners.length === 1 ? `${t('winner')}: ${winners[0].name}` : t('tieLabel');
  finalStandings.appendChild(title);
  const wrap = document.createElement('div');
  wrap.className = 'standings';
  sorted.forEach((player, index) => {
    const row = document.createElement('div');
    row.className = 'standing';
    row.innerHTML = `<span>${index === 0 ? '<span class="trophy">🏆</span> ' : ''}${player.name}</span><strong>${player.score}</strong>`;
    wrap.appendChild(row);
  });
  finalStandings.appendChild(wrap);
  showScreen('final');
}

playerCountEl.addEventListener('change', renderPlayerInputs);
document.getElementById('start-btn').addEventListener('click', () => {
  const inputs = [...playerInputsEl.querySelectorAll('input')];
  const names = inputs.map((input, index) => input.value.trim() || fmt('playerName', { n: index + 1 }));
  state = BankShotLogic.createMatchState(names, ROUNDS);
  openHandoff();
});
document.getElementById('ready-btn').addEventListener('click', startTurn);
shootBtn.addEventListener('click', () => {
  shootBtn.disabled = true;
  shotResult = BankShotLogic.simulateShot(board, aim);
  animateShot();
});
document.getElementById('next-turn-btn').addEventListener('click', () => {
  state = BankShotLogic.applyTurnResult(state, shotResult.score);
  if (state.gameOver) {
    openFinal();
  } else {
    openHandoff();
  }
});
document.getElementById('play-again-btn').addEventListener('click', () => {
  renderPlayerInputs();
  showScreen('setup');
});
canvas.addEventListener('click', event => {
  if (!board || shotResult) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  aim = { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  drawBoard();
});

onLangChange(() => {
  document.querySelector('.back-bar a').textContent = t('back');
  translatePage();
  renderPlayerInputs();
  if (state) renderHud();
  if (state && screens.handoff.classList.contains('active')) openHandoff();
  if (state && screens.game.classList.contains('active')) drawBoard();
});

renderPlayerInputs();
showScreen('setup');
