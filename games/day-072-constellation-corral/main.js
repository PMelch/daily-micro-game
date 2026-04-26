import { LEVELS, evaluateLoop, getPolygon, getRopeLength } from './logic.js';

const TRANSLATIONS = {
  de: {
    title: 'Constellation Corral',
    intro: 'Zieh ein Sternengehege aus Ankerpunkten. Fang alle goldenen Sterne ein, lass rote Minen draußen und bleib unter dem Seilbudget.',
    tipOne: 'Tippe Ankerpunkte in Reihenfolge an, um dein Seil zu legen.',
    tipTwo: '„Schleife schließen“ wertet deinen aktuellen Pfad aus.',
    tipThree: 'Manchmal ist die kleinere Form besser als die große, offensichtliche.',
    start: 'Mission starten',
    boardTitle: 'Sternenkarte',
    legendStar: 'Sterne einsammeln',
    legendHazard: 'Minen meiden',
    legendPeg: 'Ankerpunkt',
    undo: 'Zurück',
    reset: 'Reset',
    seal: 'Schleife schließen',
    next: 'Nächstes Feld',
    level: 'Level',
    budget: 'Budget',
    boardIdle: 'Wähle mindestens 3 Ankerpunkte.',
    boardTracing: 'Dein Seil ist noch offen — noch nicht verriegeln? Doch, ruhig.',
    boardClosed: 'Die Schleife ist verriegelt. Prüfe das Ergebnis unten.',
    resultSuccess: 'Sauber eingefangen. Alle Sterne drin, keine Mine erwischt.',
    resultMissing: 'Noch nicht gut genug — mindestens ein Stern liegt noch draußen.',
    resultHazard: 'Autsch. Du hast eine rote Mine mit eingesperrt.',
    resultBudget: 'Zu gierig. Das Seil ist länger als dein Budget.',
    resultSelf: 'Dein Seil hat sich selbst gekreuzt. Das zählt nicht.',
    resultShort: 'Drei Punkte brauchst du mindestens.',
    statusLine: '{stars}/{total} Sterne im Blick · {hazards} Minen drin · {rope}/{budget} Seil',
    levelPill: 'Level {level}/{total}',
    budgetPill: '{rope}/{budget}',
    completeTitle: 'Sternenhirte geschafft',
    completeCopy: 'Alle 5 Sternenfelder sauber eingerahmt. Nicht schlecht.',
    playAgain: 'Nochmal spielen',
  },
  en: {
    title: 'Constellation Corral',
    intro: 'Fence in the stars by linking anchor points. Catch every golden star, keep red mines outside, and stay under budget.',
    tipOne: 'Tap anchor points in order to lay your rope.',
    tipTwo: '“Seal Loop” evaluates your current shape.',
    tipThree: 'Sometimes the smaller shape beats the big obvious one.',
    start: 'Start mission',
    boardTitle: 'Star chart',
    legendStar: 'Capture stars',
    legendHazard: 'Avoid mines',
    legendPeg: 'Anchor peg',
    undo: 'Undo',
    reset: 'Reset',
    seal: 'Seal loop',
    next: 'Next field',
    level: 'Level',
    budget: 'Budget',
    boardIdle: 'Pick at least 3 anchor points.',
    boardTracing: 'Your rope is still open — seal it when you like the shape.',
    boardClosed: 'The loop is sealed. Check the result below.',
    resultSuccess: 'Clean catch. Every star is inside and no mine slipped in.',
    resultMissing: 'Not enough — at least one star is still outside.',
    resultHazard: 'Ouch. You trapped a red mine inside the loop.',
    resultBudget: 'Too greedy. Your rope is longer than the budget.',
    resultSelf: 'Your rope crosses itself. That does not count.',
    resultShort: 'You need at least three points.',
    statusLine: '{stars}/{total} stars inside · {hazards} mines inside · {rope}/{budget} rope',
    levelPill: 'Level {level}/{total}',
    budgetPill: '{rope}/{budget}',
    completeTitle: 'Star wrangler complete',
    completeCopy: 'All 5 fields fenced in cleanly. Nice work.',
    playAgain: 'Play again',
  },
  fr: {
    title: 'Constellation Corral',
    intro: 'Relie les points d’ancrage pour enfermer les étoiles. Capture toutes les étoiles dorées, garde les mines rouges dehors et respecte le budget.',
    tipOne: 'Touchez les points d’ancrage dans l’ordre pour poser la corde.',
    tipTwo: '« Fermer la boucle » évalue la forme actuelle.',
    tipThree: 'Parfois, la petite forme vaut mieux que la grande évidence.',
    start: 'Lancer la mission',
    boardTitle: 'Carte céleste',
    legendStar: 'Capturer les étoiles',
    legendHazard: 'Éviter les mines',
    legendPeg: 'Point d’ancrage',
    undo: 'Annuler',
    reset: 'Réinitialiser',
    seal: 'Fermer la boucle',
    next: 'Champ suivant',
    level: 'Niveau',
    budget: 'Budget',
    boardIdle: 'Choisissez au moins 3 points d’ancrage.',
    boardTracing: 'Votre corde est encore ouverte — fermez-la quand la forme vous plaît.',
    boardClosed: 'La boucle est fermée. Vérifiez le résultat ci-dessous.',
    resultSuccess: 'Capture propre. Toutes les étoiles sont dedans et aucune mine.',
    resultMissing: 'Pas encore — au moins une étoile est restée dehors.',
    resultHazard: 'Aïe. Une mine rouge est dans la boucle.',
    resultBudget: 'Trop gourmand. La corde dépasse le budget.',
    resultSelf: 'La corde se croise elle-même. Invalide.',
    resultShort: 'Il faut au moins trois points.',
    statusLine: '{stars}/{total} étoiles dedans · {hazards} mines dedans · {rope}/{budget} corde',
    levelPill: 'Niveau {level}/{total}',
    budgetPill: '{rope}/{budget}',
    completeTitle: 'Berger d’étoiles accompli',
    completeCopy: 'Les 5 cartes stellaires sont parfaitement bouclées. Bien joué.',
    playAgain: 'Rejouer',
  },
  it: {
    title: 'Constellation Corral',
    intro: 'Collega i punti di ancoraggio per recintare le stelle. Cattura tutte le stelle dorate, lascia fuori le mine rosse e resta nel budget.',
    tipOne: 'Tocca i punti di ancoraggio in ordine per stendere la corda.',
    tipTwo: '"Chiudi il loop" valuta la forma attuale.',
    tipThree: 'A volte la forma piccola è migliore di quella grande e ovvia.',
    start: 'Avvia missione',
    boardTitle: 'Mappa stellare',
    legendStar: 'Cattura le stelle',
    legendHazard: 'Evita le mine',
    legendPeg: 'Ancoraggio',
    undo: 'Annulla',
    reset: 'Reset',
    seal: 'Chiudi il loop',
    next: 'Campo successivo',
    level: 'Livello',
    budget: 'Budget',
    boardIdle: 'Scegli almeno 3 punti di ancoraggio.',
    boardTracing: 'La tua corda è ancora aperta: chiudila quando ti piace la forma.',
    boardClosed: 'Il loop è chiuso. Controlla il risultato qui sotto.',
    resultSuccess: 'Cattura pulita. Tutte le stelle dentro, nessuna mina.',
    resultMissing: 'Non basta ancora: almeno una stella è rimasta fuori.',
    resultHazard: 'Ahi. Hai intrappolato una mina rossa.',
    resultBudget: 'Troppo avido. La corda supera il budget.',
    resultSelf: 'La corda si incrocia da sola. Non vale.',
    resultShort: 'Servono almeno tre punti.',
    statusLine: '{stars}/{total} stelle dentro · {hazards} mine dentro · {rope}/{budget} corda',
    levelPill: 'Livello {level}/{total}',
    budgetPill: '{rope}/{budget}',
    completeTitle: 'Mandriano stellare completo',
    completeCopy: 'Tutti i 5 campi stellari sono stati chiusi bene. Niente male.',
    playAgain: 'Gioca ancora',
  },
  es: {
    title: 'Constellation Corral',
    intro: 'Une puntos de anclaje para encerrar estrellas. Captura todas las estrellas doradas, deja fuera las minas rojas y no te pases del presupuesto.',
    tipOne: 'Toca los puntos de anclaje en orden para tender la cuerda.',
    tipTwo: '«Cerrar bucle» evalúa tu forma actual.',
    tipThree: 'A veces la figura pequeña gana a la forma grande y obvia.',
    start: 'Empezar misión',
    boardTitle: 'Mapa estelar',
    legendStar: 'Capturar estrellas',
    legendHazard: 'Evitar minas',
    legendPeg: 'Punto de anclaje',
    undo: 'Deshacer',
    reset: 'Reiniciar',
    seal: 'Cerrar bucle',
    next: 'Siguiente campo',
    level: 'Nivel',
    budget: 'Presupuesto',
    boardIdle: 'Elige al menos 3 puntos de anclaje.',
    boardTracing: 'Tu cuerda sigue abierta: ciérrala cuando te guste la forma.',
    boardClosed: 'El bucle está cerrado. Mira el resultado abajo.',
    resultSuccess: 'Captura limpia. Todas las estrellas dentro y ninguna mina.',
    resultMissing: 'Todavía no: al menos una estrella sigue fuera.',
    resultHazard: 'Ay. Has encerrado una mina roja.',
    resultBudget: 'Demasiada ambición. La cuerda supera el presupuesto.',
    resultSelf: 'La cuerda se cruza a sí misma. No vale.',
    resultShort: 'Necesitas al menos tres puntos.',
    statusLine: '{stars}/{total} estrellas dentro · {hazards} minas dentro · {rope}/{budget} cuerda',
    levelPill: 'Nivel {level}/{total}',
    budgetPill: '{rope}/{budget}',
    completeTitle: 'Domador de estrellas completo',
    completeCopy: 'Has cercado limpiamente los 5 campos estelares. Nada mal.',
    playAgain: 'Jugar otra vez',
  },
};

const { t, onLangChange, translatePage } = initI18n(TRANSLATIONS);

const state = {
  started: false,
  levelIndex: 0,
  selectedPegIds: [],
  sealed: false,
  lastResult: null,
};

const introScreen = document.querySelector('#intro-screen');
const gameScreen = document.querySelector('#game-screen');
const completeScreen = document.querySelector('#complete-screen');
const startButton = document.querySelector('#start-btn');
const restartButton = document.querySelector('#restart-btn');
const undoButton = document.querySelector('#undo-btn');
const resetButton = document.querySelector('#reset-btn');
const sealButton = document.querySelector('#seal-btn');
const nextButton = document.querySelector('#next-btn');
const board = document.querySelector('#board');
const statusLine = document.querySelector('#status-line');
const levelPill = document.querySelector('#level-pill');
const budgetPill = document.querySelector('#budget-pill');
const boardCopy = document.querySelector('#board-copy');
const messageBox = document.querySelector('#message-box');
const completeCopy = document.querySelector('#complete-copy');

startButton.addEventListener('click', () => {
  state.started = true;
  state.levelIndex = 0;
  resetLevel();
  showScreen('game');
});
restartButton.addEventListener('click', () => {
  state.started = true;
  state.levelIndex = 0;
  resetLevel();
  showScreen('game');
});
undoButton.addEventListener('click', () => {
  if (state.sealed) return;
  state.selectedPegIds.pop();
  state.lastResult = null;
  render();
});
resetButton.addEventListener('click', () => resetLevel());
sealButton.addEventListener('click', () => {
  const level = LEVELS[state.levelIndex];
  state.sealed = true;
  state.lastResult = evaluateLoop(level, state.selectedPegIds);
  if (state.lastResult.success) {
    nextButton.classList.remove('hidden');
  }
  render();
});
nextButton.addEventListener('click', () => {
  if (state.levelIndex === LEVELS.length - 1) {
    showScreen('complete');
    completeCopy.textContent = t('completeCopy');
    return;
  }
  state.levelIndex += 1;
  resetLevel();
  render();
});

onLangChange(() => render());
translatePage();
showScreen('intro');

function showScreen(screen) {
  introScreen.classList.toggle('active', screen === 'intro');
  gameScreen.classList.toggle('active', screen === 'game');
  completeScreen.classList.toggle('active', screen === 'complete');
}

function resetLevel() {
  state.selectedPegIds = [];
  state.sealed = false;
  state.lastResult = null;
  nextButton.classList.add('hidden');
  render();
}

function interpolate(template, values) {
  return template.replace(/\{(.*?)\}/g, (_, key) => values[key] ?? '');
}

function getCurrentLevel() {
  return LEVELS[state.levelIndex];
}

function getCurrentPolygon() {
  const level = getCurrentLevel();
  if (!state.selectedPegIds.length) return [];
  return getPolygon(level, state.selectedPegIds);
}

function getStatusMetrics() {
  const level = getCurrentLevel();
  const polygon = getCurrentPolygon();
  const rope = polygon.length >= 2 ? getRopeLength(polygon) : 0;
  if (!state.lastResult) {
    return { stars: 0, total: level.stars.length, hazards: 0, rope, budget: level.budget };
  }
  return {
    stars: state.lastResult.capturedStars,
    total: level.stars.length,
    hazards: state.lastResult.capturedHazards,
    rope: state.lastResult.ropeUsed,
    budget: level.budget,
  };
}

function getMessage() {
  if (!state.lastResult) {
    if (state.selectedPegIds.length >= 3) return { tone: 'info', text: t('boardTracing') };
    return { tone: 'info', text: t('boardIdle') };
  }
  const key = {
    '': 'resultSuccess',
    missing: 'resultMissing',
    hazard: 'resultHazard',
    budget: 'resultBudget',
    'self-intersection': 'resultSelf',
    'too-short': 'resultShort',
  }[state.lastResult.failureReason ?? ''];
  return { tone: state.lastResult.success ? 'success' : 'danger', text: t(key) };
}

function render() {
  if (!state.started) return;
  const level = getCurrentLevel();
  const metrics = getStatusMetrics();
  const message = getMessage();

  levelPill.textContent = interpolate(t('levelPill'), { level: level.id, total: LEVELS.length });
  budgetPill.textContent = interpolate(t('budgetPill'), { rope: metrics.rope, budget: metrics.budget });
  statusLine.textContent = interpolate(t('statusLine'), metrics);
  boardCopy.textContent = state.sealed ? t('boardClosed') : (state.selectedPegIds.length >= 3 ? t('boardTracing') : t('boardIdle'));
  messageBox.textContent = message.text;
  messageBox.className = `message-box ${message.tone}`;
  nextButton.classList.toggle('hidden', !state.lastResult?.success);
  sealButton.disabled = state.selectedPegIds.length < 3 || state.sealed;
  undoButton.disabled = state.selectedPegIds.length === 0 || state.sealed;

  renderBoard(level);
}

function renderBoard(level) {
  board.innerHTML = '';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const glow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  glow.setAttribute('id', 'glow');
  glow.innerHTML = '<feGaussianBlur stdDeviation="4" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>';
  defs.appendChild(glow);
  board.appendChild(defs);

  level.stars.forEach((star) => board.appendChild(makeStar(star.x, star.y, 'star')));
  level.hazards.forEach((hazard) => board.appendChild(makeHazard(hazard.x, hazard.y)));

  const polygon = getCurrentPolygon();
  if (polygon.length >= 2) {
    const guide = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    guide.setAttribute('class', state.sealed ? 'loop-line' : 'loop-guide');
    guide.setAttribute('points', polygon.map((point) => `${point.x},${point.y}`).join(' '));
    board.appendChild(guide);
  }

  if (state.sealed && polygon.length >= 3) {
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    fill.setAttribute('class', 'loop-fill');
    fill.setAttribute('points', polygon.map((point) => `${point.x},${point.y}`).join(' '));
    board.appendChild(fill);

    const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    stroke.setAttribute('class', 'loop-line');
    stroke.setAttribute('points', polygon.map((point) => `${point.x},${point.y}`).join(' '));
    board.appendChild(stroke);
  }

  level.pegs.forEach((peg, index) => {
    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('cx', peg.x);
    halo.setAttribute('cy', peg.y);
    halo.setAttribute('r', 27);
    halo.setAttribute('class', 'capture-ring');
    board.appendChild(halo);

    const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    core.setAttribute('cx', peg.x);
    core.setAttribute('cy', peg.y);
    core.setAttribute('r', 12);
    const classes = ['peg-core'];
    if (state.selectedPegIds.includes(peg.id)) classes.push('selected');
    if (state.selectedPegIds[0] === peg.id) classes.push('first');
    core.setAttribute('class', classes.join(' '));
    core.setAttribute('filter', 'url(#glow)');
    board.appendChild(core);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', peg.x);
    label.setAttribute('y', peg.y + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', '#07101f');
    label.setAttribute('font-size', '11');
    label.setAttribute('font-weight', '700');
    label.textContent = String(index + 1);
    board.appendChild(label);

    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hit.setAttribute('cx', peg.x);
    hit.setAttribute('cy', peg.y);
    hit.setAttribute('r', 24);
    hit.setAttribute('class', 'peg-hit');
    hit.dataset.pegId = peg.id;
    hit.addEventListener('click', () => handlePegClick(peg.id));
    board.appendChild(hit);
  });
}

function handlePegClick(pegId) {
  if (state.sealed) return;
  if (state.selectedPegIds.includes(pegId)) return;
  state.selectedPegIds.push(pegId);
  state.lastResult = null;
  render();
}

function makeStar(x, y, className) {
  const star = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  star.setAttribute('class', className);
  star.setAttribute('transform', `translate(${x} ${y})`);
  star.setAttribute('d', 'M 0 -11 L 3.5 -3.5 L 11 -3 L 5 2.5 L 7 10 L 0 6 L -7 10 L -5 2.5 L -11 -3 L -3.5 -3.5 Z');
  star.setAttribute('filter', 'url(#glow)');
  return star;
}

function makeHazard(x, y) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('transform', `translate(${x} ${y})`);
  const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  diamond.setAttribute('class', 'hazard');
  diamond.setAttribute('x', -9);
  diamond.setAttribute('y', -9);
  diamond.setAttribute('width', 18);
  diamond.setAttribute('height', 18);
  diamond.setAttribute('transform', 'rotate(45)');
  diamond.setAttribute('filter', 'url(#glow)');
  const crossA = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  crossA.setAttribute('x1', -5);
  crossA.setAttribute('y1', -5);
  crossA.setAttribute('x2', 5);
  crossA.setAttribute('y2', 5);
  crossA.setAttribute('stroke', '#fff0f3');
  crossA.setAttribute('stroke-width', 2);
  const crossB = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  crossB.setAttribute('x1', 5);
  crossB.setAttribute('y1', -5);
  crossB.setAttribute('x2', -5);
  crossB.setAttribute('y2', 5);
  crossB.setAttribute('stroke', '#fff0f3');
  crossB.setAttribute('stroke-width', 2);
  group.append(diamond, crossA, crossB);
  return group;
}
