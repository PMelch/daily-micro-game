const TRANSLATIONS = {
  de: {
    eyebrow: 'Single Player · Programmiere die Flucht', title: 'Pocket Protocol', subtitle: 'Baue eine Mini-Befehlsschleife aus fünf Slots. Deine Drohne wiederholt sie automatisch, sammelt Datakerne und schlüpft zwischen Patrouillen durch.', goalTitle: 'Ziel', goalCopy: 'Sammle alle goldenen Datenknoten und erreiche danach den grünen Ausgang.', commandTitle: 'Befehle', commandCopy: 'Vor, links, rechts, warten oder dashen. Die Schleife läuft Tick für Tick durch.', start: 'Mission starten', gridTitle: 'Sicherheitsraster', queueTitle: 'Befehlsschleife', queueHint: 'Tippe erst einen Slot, dann einen Befehl. Lauf startet immer von vorn.', run: 'Lauf abspielen', step: '1 Tick', reset: 'Level neu', clear: 'Schleife leeren', nextLevel: 'Nächstes Level', mission: 'Level {n}: {name}', tick: 'Tick {tick}/{max}', data: 'Daten {done}/{total}', slotEmpty: 'Leer', chooseSlot: 'Slot {n}', cmdForward: 'Vor', cmdLeft: 'Links', cmdRight: 'Rechts', cmdWait: 'Warten', cmdDash: 'Dash', cmdForwardHint: '1 Feld geradeaus', cmdLeftHint: '90° links drehen', cmdRightHint: '90° rechts drehen', cmdWaitHint: 'Nichts tun', cmdDashHint: 'Bis vor die Wand', legendBot: 'Drohne', legendData: 'Datenkern', legendExit: 'Ausgang', legendSentry: 'Sentry', legendWall: 'Wand', statusReady: 'Noch still. Bau deine Schleife.', statusRunning: 'Simuliere Tick {tick} ...', statusCaught: 'Erwischt. Eine Sentry war schneller.', statusWin: 'Sauber. Protokoll geknackt.', statusIncomplete: 'Noch nicht genug. Optimiere die Schleife.', statusNeedQueue: 'Füll zuerst mindestens einen Slot.', objective: 'Starte bei {facing}. {count} Datenkerne warten.', facing_up: 'oben', facing_right: 'rechts', facing_down: 'unten', facing_left: 'links', level1: 'Warmstart', level2: 'Laserkorridor', level3: 'Kreuzblick', level4: 'Doppelte Wache', level5: 'Saubere Flucht', levelDone: 'Alle Level geschafft. Du kannst weiter verbessern.'
  },
  en: {
    eyebrow: 'Single Player · Program the escape', title: 'Pocket Protocol', subtitle: 'Build a tiny five-slot command loop. Your drone repeats it automatically, grabs data cores, and slips through patrol routes.', goalTitle: 'Goal', goalCopy: 'Collect every golden data node, then reach the green exit.', commandTitle: 'Commands', commandCopy: 'Forward, left, right, wait, or dash. The loop runs one tick at a time.', start: 'Start mission', gridTitle: 'Security grid', queueTitle: 'Command loop', queueHint: 'Tap a slot first, then assign a command. Every run starts from tick one.', run: 'Play run', step: '1 tick', reset: 'Reset level', clear: 'Clear loop', nextLevel: 'Next level', mission: 'Level {n}: {name}', tick: 'Tick {tick}/{max}', data: 'Data {done}/{total}', slotEmpty: 'Empty', chooseSlot: 'Slot {n}', cmdForward: 'Forward', cmdLeft: 'Left', cmdRight: 'Right', cmdWait: 'Wait', cmdDash: 'Dash', cmdForwardHint: 'Move 1 tile', cmdLeftHint: 'Turn 90° left', cmdRightHint: 'Turn 90° right', cmdWaitHint: 'Do nothing', cmdDashHint: 'Move until wall', legendBot: 'Drone', legendData: 'Data core', legendExit: 'Exit', legendSentry: 'Sentry', legendWall: 'Wall', statusReady: 'Idle. Build your loop.', statusRunning: 'Simulating tick {tick} ...', statusCaught: 'Caught. A sentry got there first.', statusWin: 'Clean run. Protocol cracked.', statusIncomplete: 'Not enough yet. Tune the loop.', statusNeedQueue: 'Fill at least one slot first.', objective: 'Start facing {facing}. {count} data cores to collect.', facing_up: 'up', facing_right: 'right', facing_down: 'down', facing_left: 'left', level1: 'Warm Boot', level2: 'Laser Hall', level3: 'Cross Sight', level4: 'Double Guard', level5: 'Clean Exit', levelDone: 'All levels cleared. You can keep optimizing.'
  },
  fr: {
    eyebrow: 'Solo · Programme ton évasion', title: 'Pocket Protocol', subtitle: 'Compose une petite boucle de cinq commandes. Le drone la répète automatiquement, récupère les noyaux de données et se faufile entre les patrouilles.', goalTitle: 'But', goalCopy: 'Ramasse tous les nœuds dorés puis rejoins la sortie verte.', commandTitle: 'Commandes', commandCopy: 'Avancer, tourner, attendre ou foncer. La boucle avance tick par tick.', start: 'Lancer la mission', gridTitle: 'Grille de sécurité', queueTitle: 'Boucle de commandes', queueHint: 'Touchez d’abord une case puis assignez une commande. Chaque essai repart du début.', run: 'Lancer', step: '1 tick', reset: 'Réinitialiser', clear: 'Vider la boucle', nextLevel: 'Niveau suivant', mission: 'Niveau {n} : {name}', tick: 'Tick {tick}/{max}', data: 'Données {done}/{total}', slotEmpty: 'Vide', chooseSlot: 'Case {n}', cmdForward: 'Avancer', cmdLeft: 'Gauche', cmdRight: 'Droite', cmdWait: 'Pause', cmdDash: 'Sprint', cmdForwardHint: 'Avance de 1 case', cmdLeftHint: 'Tourne à gauche', cmdRightHint: 'Tourne à droite', cmdWaitHint: 'Ne rien faire', cmdDashHint: 'Jusqu’au mur', legendBot: 'Drone', legendData: 'Noyau', legendExit: 'Sortie', legendSentry: 'Sentinelle', legendWall: 'Mur', statusReady: 'En attente. Construis ta boucle.', statusRunning: 'Simulation du tick {tick} ...', statusCaught: 'Attrapé. Une sentinelle t’a eu.', statusWin: 'Trajet propre. Protocole percé.', statusIncomplete: 'Pas encore. Ajuste la boucle.', statusNeedQueue: 'Remplis au moins une case.', objective: 'Départ face vers {facing}. {count} noyaux à prendre.', facing_up: 'le haut', facing_right: 'la droite', facing_down: 'le bas', facing_left: 'la gauche', level1: 'Démarrage', level2: 'Couloir laser', level3: 'Visée croisée', level4: 'Double garde', level5: 'Sortie nette', levelDone: 'Tous les niveaux sont terminés. Tu peux encore optimiser.'
  },
  it: {
    eyebrow: 'Single player · Programma la fuga', title: 'Pocket Protocol', subtitle: 'Costruisci un piccolo loop di cinque comandi. Il drone lo ripete da solo, raccoglie i nuclei dati e passa tra le pattuglie.', goalTitle: 'Obiettivo', goalCopy: 'Raccogli tutti i nodi dorati e poi raggiungi l’uscita verde.', commandTitle: 'Comandi', commandCopy: 'Avanti, sinistra, destra, attesa o scatto. Il loop scorre tick dopo tick.', start: 'Avvia missione', gridTitle: 'Griglia di sicurezza', queueTitle: 'Loop comandi', queueHint: 'Tocca prima uno slot, poi assegna il comando. Ogni run riparte da zero.', run: 'Avvia run', step: '1 tick', reset: 'Reset livello', clear: 'Svuota loop', nextLevel: 'Livello successivo', mission: 'Livello {n}: {name}', tick: 'Tick {tick}/{max}', data: 'Dati {done}/{total}', slotEmpty: 'Vuoto', chooseSlot: 'Slot {n}', cmdForward: 'Avanti', cmdLeft: 'Sinistra', cmdRight: 'Destra', cmdWait: 'Attendi', cmdDash: 'Scatto', cmdForwardHint: '1 casella avanti', cmdLeftHint: 'Ruota a sinistra', cmdRightHint: 'Ruota a destra', cmdWaitHint: 'Non fare nulla', cmdDashHint: 'Fino al muro', legendBot: 'Drone', legendData: 'Nucleo dati', legendExit: 'Uscita', legendSentry: 'Sentry', legendWall: 'Muro', statusReady: 'Fermo. Costruisci il loop.', statusRunning: 'Simulo il tick {tick} ...', statusCaught: 'Preso. Una sentry è arrivata prima.', statusWin: 'Pulito. Protocollo violato.', statusIncomplete: 'Non basta ancora. Ritocca il loop.', statusNeedQueue: 'Riempi almeno uno slot.', objective: 'Parti rivolto verso {facing}. Ci sono {count} nuclei dati.', facing_up: 'l’alto', facing_right: 'destra', facing_down: 'il basso', facing_left: 'sinistra', level1: 'Avvio rapido', level2: 'Corridoio laser', level3: 'Incrocio', level4: 'Doppia guardia', level5: 'Uscita pulita', levelDone: 'Hai finito tutti i livelli. Puoi ancora ottimizzare.'
  },
  es: {
    eyebrow: 'Un jugador · Programa la fuga', title: 'Pocket Protocol', subtitle: 'Construye un pequeño bucle de cinco órdenes. Tu dron lo repite solo, recoge núcleos de datos y se cuela entre patrullas.', goalTitle: 'Objetivo', goalCopy: 'Recoge todos los nodos dorados y luego llega a la salida verde.', commandTitle: 'Comandos', commandCopy: 'Avanzar, girar, esperar o hacer dash. El bucle corre tick a tick.', start: 'Empezar misión', gridTitle: 'Cuadrícula de seguridad', queueTitle: 'Bucle de comandos', queueHint: 'Toca primero una casilla y luego asigna un comando. Cada intento empieza desde cero.', run: 'Reproducir run', step: '1 tick', reset: 'Reiniciar nivel', clear: 'Vaciar bucle', nextLevel: 'Siguiente nivel', mission: 'Nivel {n}: {name}', tick: 'Tick {tick}/{max}', data: 'Datos {done}/{total}', slotEmpty: 'Vacío', chooseSlot: 'Casilla {n}', cmdForward: 'Avanzar', cmdLeft: 'Izquierda', cmdRight: 'Derecha', cmdWait: 'Esperar', cmdDash: 'Dash', cmdForwardHint: 'Avanza 1 casilla', cmdLeftHint: 'Gira a la izquierda', cmdRightHint: 'Gira a la derecha', cmdWaitHint: 'No hacer nada', cmdDashHint: 'Hasta la pared', legendBot: 'Dron', legendData: 'Núcleo', legendExit: 'Salida', legendSentry: 'Centinela', legendWall: 'Muro', statusReady: 'En pausa. Construye tu bucle.', statusRunning: 'Simulando tick {tick} ...', statusCaught: 'Te atraparon. Una centinela llegó antes.', statusWin: 'Ruta limpia. Protocolo roto.', statusIncomplete: 'Todavía no basta. Ajusta el bucle.', statusNeedQueue: 'Rellena al menos una casilla.', objective: 'Empiezas mirando hacia {facing}. Hay {count} núcleos de datos.', facing_up: 'arriba', facing_right: 'la derecha', facing_down: 'abajo', facing_left: 'la izquierda', level1: 'Arranque', level2: 'Pasillo láser', level3: 'Cruce visual', level4: 'Doble guardia', level5: 'Salida limpia', levelDone: 'Todos los niveles superados. Aún puedes optimizar.'
  }
};

const { t, onLangChange } = initI18n(TRANSLATIONS);

const COMMANDS = ['forward', 'left', 'right', 'wait', 'dash'];
const COMMAND_ICONS = { forward: '↑', left: '↺', right: '↻', wait: '•', dash: '⇢' };
const COMMAND_HINT_KEYS = { forward: 'cmdForwardHint', left: 'cmdLeftHint', right: 'cmdRightHint', wait: 'cmdWaitHint', dash: 'cmdDashHint' };
const ROTATIONS = { up: '0deg', right: '90deg', down: '180deg', left: '270deg' };
const LEVELS = [
  {
    nameKey: 'level1', maxTicks: 8, width: 7, height: 7,
    start: { x: 1, y: 5 }, facing: 'up', exit: { x: 5, y: 1 },
    walls: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }],
    dataNodes: [{ x: 1, y: 2 }, { x: 5, y: 4 }],
    sentries: []
  },
  {
    nameKey: 'level2', maxTicks: 10, width: 7, height: 7,
    start: { x: 1, y: 5 }, facing: 'up', exit: { x: 5, y: 1 },
    walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }],
    dataNodes: [{ x: 1, y: 1 }, { x: 5, y: 5 }],
    sentries: [{ path: [{ x: 4, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }] }]
  },
  {
    nameKey: 'level3', maxTicks: 12, width: 7, height: 7,
    start: { x: 0, y: 6 }, facing: 'right', exit: { x: 6, y: 0 },
    walls: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }],
    dataNodes: [{ x: 1, y: 1 }, { x: 5, y: 5 }, { x: 6, y: 3 }],
    sentries: [{ path: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 1 }] }]
  },
  {
    nameKey: 'level4', maxTicks: 12, width: 7, height: 7,
    start: { x: 1, y: 6 }, facing: 'up', exit: { x: 6, y: 1 },
    walls: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }],
    dataNodes: [{ x: 0, y: 1 }, { x: 4, y: 5 }, { x: 6, y: 4 }],
    sentries: [
      { path: [{ x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 0 }] },
      { path: [{ x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }] },
    ]
  },
  {
    nameKey: 'level5', maxTicks: 14, width: 7, height: 7,
    start: { x: 0, y: 5 }, facing: 'right', exit: { x: 6, y: 0 },
    walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 2 }, { x: 5, y: 3 }],
    dataNodes: [{ x: 0, y: 1 }, { x: 4, y: 1 }, { x: 6, y: 5 }],
    sentries: [
      { path: [{ x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 }] },
      { path: [{ x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 4 }] },
    ]
  }
];

const state = {
  levelIndex: 0,
  queue: ['forward', 'forward', 'right', 'forward', 'wait'],
  selectedSlot: 0,
  playing: false,
  playback: null,
  result: null,
};

const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
};
const boardEl = document.getElementById('board');
const queueEl = document.getElementById('queue');
const paletteEl = document.getElementById('command-palette');
const legendEl = document.getElementById('legend');

function fmt(key, vars = {}) { return Object.entries(vars).reduce((text, [k, v]) => text.replaceAll(`{${k}}`, String(v)), t(key)); }
function show(screen) { Object.values(screens).forEach((el) => el.classList.remove('active')); screens[screen].classList.add('active'); }
function currentLevel() { return LEVELS[state.levelIndex]; }
function queueHasCommands() { return state.queue.some(Boolean); }
function initialSnapshot() { return createLevelState(currentLevel()); }
function stopPlayback() { if (state.playback) clearTimeout(state.playback); state.playback = null; state.playing = false; }

function statusText() {
  if (!state.result) return t('statusReady');
  if (state.result.status === 'running') return fmt('statusRunning', { tick: state.result.tick });
  if (state.result.status === 'caught') return t('statusCaught');
  if (state.result.status === 'success') return state.levelIndex === LEVELS.length - 1 ? `${t('statusWin')} ${t('levelDone')}` : t('statusWin');
  if (state.result.status === 'need-queue') return t('statusNeedQueue');
  return t('statusIncomplete');
}

function boardSnapshot() {
  if (!state.result || !state.result.snapshot) return initialSnapshot();
  return state.result.snapshot;
}

function renderLegend() {
  legendEl.innerHTML = [
    ['legendBot', 'bot'], ['legendData', 'data'], ['legendExit', 'exit'], ['legendSentry', 'sentry'], ['legendWall', 'wall']
  ].map(([key, cls]) => `<span><strong>${COMMAND_ICONS[cls] || ''}</strong> ${t(key)}</span>`).join('');
}

function renderQueue() {
  queueEl.innerHTML = '';
  state.queue.forEach((command, index) => {
    const slot = document.createElement('button');
    slot.className = 'slot' + (state.selectedSlot === index ? ' active' : '');
    slot.innerHTML = command
      ? `<strong>${COMMAND_ICONS[command]} ${t(`cmd${command[0].toUpperCase()}${command.slice(1)}`)}</strong><small>${t(COMMAND_HINT_KEYS[command])}</small>`
      : `<strong>${t('slotEmpty')}</strong><small>${fmt('chooseSlot', { n: index + 1 })}</small>`;
    slot.addEventListener('click', () => { state.selectedSlot = index; render(); });
    queueEl.appendChild(slot);
  });
}

function renderPalette() {
  paletteEl.innerHTML = '';
  COMMANDS.forEach((command) => {
    const btn = document.createElement('button');
    btn.className = 'command-btn';
    btn.innerHTML = `<strong>${COMMAND_ICONS[command]} ${t(`cmd${command[0].toUpperCase()}${command.slice(1)}`)}</strong><small>${t(COMMAND_HINT_KEYS[command])}</small>`;
    btn.addEventListener('click', () => {
      state.queue[state.selectedSlot] = command;
      state.selectedSlot = (state.selectedSlot + 1) % state.queue.length;
      state.result = null;
      render();
    });
    paletteEl.appendChild(btn);
  });
}

function renderBoard() {
  const level = currentLevel();
  const snapshot = boardSnapshot();
  const sentrySet = new Set((sentryPositions(snapshot) || []).map((point) => `${point.x},${point.y}`));
  boardEl.style.setProperty('--cols', String(level.width));
  boardEl.innerHTML = '';

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const key = `${x},${y}`;
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (snapshot.wallSet.has(key)) tile.classList.add('wall');
      if (snapshot.dataSet.has(key)) tile.classList.add('data');
      if (snapshot.collected.has(key)) tile.classList.add('collected');
      if (snapshot.exit.x === x && snapshot.exit.y === y) {
        tile.classList.add('exit');
        if (snapshot.collected.size === snapshot.dataSet.size) tile.classList.add('ready');
      }
      if (snapshot.bot.x === x && snapshot.bot.y === y) {
        tile.classList.add('bot');
        tile.style.setProperty('--bot-rotation', ROTATIONS[snapshot.facing]);
      }
      if (sentrySet.has(key)) tile.classList.add('sentry');
      boardEl.appendChild(tile);
    }
  }
}

function renderHud() {
  const level = currentLevel();
  const snapshot = boardSnapshot();
  document.getElementById('level-kicker').textContent = fmt('mission', { n: state.levelIndex + 1, name: t(level.nameKey) });
  document.getElementById('mission-line').textContent = fmt('objective', { facing: t(`facing_${level.facing}`), count: level.dataNodes.length });
  document.getElementById('status-line').textContent = statusText();
  document.getElementById('status-line').className = state.result?.status === 'success' ? 'status-good' : state.result?.status === 'caught' ? 'status-bad' : '';
  document.getElementById('tick-pill').textContent = fmt('tick', { tick: snapshot.tick, max: level.maxTicks });
  document.getElementById('data-pill').textContent = fmt('data', { done: snapshot.collected.size, total: snapshot.dataSet.size });
  document.getElementById('next-btn').disabled = !(state.result?.status === 'success' && state.levelIndex < LEVELS.length - 1);
  document.getElementById('run-btn').disabled = state.playing;
  document.getElementById('step-btn').disabled = state.playing;
}

function render() {
  renderLegend();
  renderQueue();
  renderPalette();
  renderBoard();
  renderHud();
}

function playHistory(history, index, finalStatus) {
  state.result = { status: 'running', tick: Math.min(index, history.length - 1), snapshot: history[index] };
  render();
  if (index >= history.length - 1) {
    state.playing = false;
    state.result = { status: finalStatus.status, snapshot: history[index] };
    render();
    return;
  }
  state.playback = setTimeout(() => playHistory(history, index + 1, finalStatus), 320);
}

function runFullSimulation() {
  stopPlayback();
  if (!queueHasCommands()) {
    state.result = { status: 'need-queue', snapshot: initialSnapshot() };
    render();
    return;
  }
  const level = currentLevel();
  const result = simulateProgram(level, state.queue.filter(Boolean), level.maxTicks);
  state.playing = true;
  playHistory(result.history, 0, result);
}

function runSingleStep() {
  stopPlayback();
  const level = currentLevel();
  if (!queueHasCommands()) {
    state.result = { status: 'need-queue', snapshot: initialSnapshot() };
    render();
    return;
  }
  const previousTick = state.result?.snapshot?.tick || 0;
  const result = simulateProgram(level, state.queue.filter(Boolean), Math.min(previousTick + 1, level.maxTicks));
  state.result = { status: result.status === 'incomplete' ? 'running' : result.status, tick: Math.min(previousTick + 1, level.maxTicks), snapshot: result.final };
  if (state.result.status === 'running' && state.result.snapshot.tick >= level.maxTicks) state.result.status = 'incomplete';
  render();
}

function resetLevel() {
  stopPlayback();
  state.result = null;
  render();
}

function clearQueue() {
  stopPlayback();
  state.queue = Array(5).fill(null);
  state.selectedSlot = 0;
  state.result = null;
  render();
}

function nextLevel() {
  if (state.levelIndex >= LEVELS.length - 1) return;
  stopPlayback();
  state.levelIndex += 1;
  state.queue = ['forward', 'forward', 'right', 'forward', 'wait'];
  state.selectedSlot = 0;
  state.result = null;
  render();
}

document.getElementById('start-btn').addEventListener('click', () => { show('game'); render(); });
document.getElementById('run-btn').addEventListener('click', runFullSimulation);
document.getElementById('step-btn').addEventListener('click', runSingleStep);
document.getElementById('reset-btn').addEventListener('click', resetLevel);
document.getElementById('clear-btn').addEventListener('click', clearQueue);
document.getElementById('next-btn').addEventListener('click', nextLevel);

onLangChange(() => render());
render();
