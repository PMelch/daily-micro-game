import {
  LEVELS,
  createGameState,
  stepRun,
  saveEcho,
  resetRun,
  clearEchoes,
} from './logic.js';

const TRANSLATIONS = {
  de: {
    title: 'Echo Shift',
    subtitle: 'Reise durch die Zeit, nimm deine Pfade auf und nutze deine Echos, um Rätsel zu lösen. Kooperiere mit deinem vergangenen Ich!',
    howTo1: 'Bewege dich zum Ziel.',
    howTo2: 'Speichere ein Echo, um deinen aktuellen Pfad als Klon zu wiederholen.',
    howTo3: 'Echos aktivieren Schalter, um Türen zu öffnen.',
    howTo4: 'Du hast begrenzte Schritte und Echos pro Level.',
    play: 'Spielen',
    saveEcho: 'Echo speichern',
    reset: 'Lauf zurücksetzen',
    clear: 'Echos löschen',
    level: 'Level',
    echos: 'Echos',
    steps: 'Schritte',
    levelComplete: 'Level geschafft!',
    levelSummary: 'Hervorragendes Zeitmanagement.',
    next: 'Weiter',
    congrats: 'Glückwunsch!',
    allCleared: 'Du hast alle Zeit-Rätsel gelöst und die Realität stabilisiert.',
    restart: 'Nochmal spielen',
    limitMessage: 'Schrittlimit erreicht!',
    wonMessage: 'Ziel erreicht!',
  },
  en: {
    title: 'Echo Shift',
    subtitle: 'Travel through time, record your paths, and use your echoes to solve puzzles. Cooperate with your past self!',
    howTo1: 'Move to the goal.',
    howTo2: 'Save an echo to replay your current path as a clone.',
    howTo3: 'Echoes activate plates to open doors.',
    howTo4: 'You have limited steps and echoes per level.',
    play: 'Play',
    saveEcho: 'Save Echo',
    reset: 'Reset Run',
    clear: 'Clear Echoes',
    level: 'Level',
    echos: 'Echoes',
    steps: 'Steps',
    levelComplete: 'Level Clear!',
    levelSummary: 'Excellent time management.',
    next: 'Next',
    congrats: 'Congratulations!',
    allCleared: 'You solved all time puzzles and stabilized reality.',
    restart: 'Play Again',
    limitMessage: 'Step limit reached!',
    wonMessage: 'Goal reached!',
  },
  fr: {
    title: 'Echo Shift',
    subtitle: 'Voyagez dans le temps, enregistrez vos parcours et utilisez vos échos pour résoudre des énigmes.',
    howTo1: 'Allez vers l\'objectif.',
    howTo2: 'Enregistrez un écho pour rejouer votre parcours actuel.',
    howTo3: 'Les échos activent des plaques pour ouvrir des portes.',
    howTo4: 'Étapes et échos limités par niveau.',
    play: 'Jouer',
    saveEcho: 'Enregistrer l\'Écho',
    reset: 'Réinitialiser',
    clear: 'Effacer les Échos',
    level: 'Niveau',
    echos: 'Échos',
    steps: 'Pas',
    levelComplete: 'Niveau réussi !',
    levelSummary: 'Excellente gestion du temps.',
    next: 'Suivant',
    congrats: 'Félicitations !',
    allCleared: 'Toutes les énigmes temporelles sont résolues.',
    restart: 'Rejouer',
    limitMessage: 'Limite de pas atteinte !',
    wonMessage: 'Objectif atteint !',
  },
  it: {
    title: 'Echo Shift',
    subtitle: 'Viaggia nel tempo, registra i tuoi percorsi e usa i tuoi eco per risolvere enigmi.',
    howTo1: 'Spostati verso l\'obiettivo.',
    howTo2: 'Salva un eco per riprodurre il tuo percorso attuale come clone.',
    howTo3: 'Gli eco attivano piastre per aprire porte.',
    howTo4: 'Passi ed eco limitati per livello.',
    play: 'Gioca',
    saveEcho: 'Salva Eco',
    reset: 'Resetta Corsa',
    clear: 'Cancella Eco',
    level: 'Livello',
    echos: 'Eco',
    steps: 'Passi',
    levelComplete: 'Livello Completato!',
    levelSummary: 'Ottima gestione del tempo.',
    next: 'Avanti',
    congrats: 'Congratulazioni!',
    allCleared: 'Hai risolto tutti gli enigmi temporali.',
    restart: 'Gioca ancora',
    limitMessage: 'Limite passi raggiunto!',
    wonMessage: 'Obiettivo raggiunto!',
  },
  es: {
    title: 'Echo Shift',
    subtitle: 'Viaja en el tiempo, graba tus rutas y usa tus ecos para resolver acertijos.',
    howTo1: 'Ve hacia el objetivo.',
    howTo2: 'Guarda un eco para repetir tu ruta actual como un clon.',
    howTo3: 'Los ecos activan placas para abrir puertas.',
    howTo4: 'Pasos y ecos limitados por nivel.',
    play: 'Jugar',
    saveEcho: 'Guardar Eco',
    reset: 'Reiniciar Ruta',
    clear: 'Borrar Ecos',
    level: 'Nivel',
    echos: 'Ecos',
    steps: 'Pasos',
    levelComplete: '¡Nivel Superado!',
    levelSummary: 'Excelente gestión del tiempo.',
    next: 'Siguiente',
    congrats: '¡Felicidades!',
    allCleared: 'Has resuelto todos los acertijos temporales.',
    restart: 'Jugar de nuevo',
    limitMessage: '¡Límite de pasos alcanzado!',
    wonMessage: '¡Objetivo alcanzado!',
  }
};

let gameState;
let currentLevelIndex = 0;
const TILE_SIZE = 44; // 40px + 4px gap

const { t, initI18n } = window.initI18n(TRANSLATIONS);

function render() {
  const { level, player, echoes, savedEchoes, stepsUsed, status, doorOpen } = gameState;

  // HUD
  document.getElementById('level-pill').textContent = `${t('level')} ${level.id}`;
  document.getElementById('echo-pill').textContent = `${t('echos')}: ${savedEchoes.length} / ${level.echoLimit}`;
  document.getElementById('step-pill').textContent = `${t('steps')}: ${stepsUsed} / ${level.maxSteps}`;

  // Grid
  const gridEl = document.getElementById('grid');
  gridEl.style.gridTemplateColumns = `repeat(${level.width}, 40px)`;
  gridEl.innerHTML = '';

  level.map.forEach((row, y) => {
    [...row].forEach((tile, x) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (tile === '#') cell.classList.add('wall');
      if (tile === 'P') {
        cell.classList.add('plate');
        const isActive = player.x === x && player.y === y || echoes.some(e => e.position.x === x && e.position.y === y);
        if (isActive) cell.classList.add('active');
      }
      if (tile === 'D') {
        cell.classList.add('door');
        if (doorOpen) cell.classList.add('open');
      }
      if (tile === 'E') cell.classList.add('exit');
      if (tile === 'S') cell.textContent = '🏁';
      if (tile === 'E') cell.textContent = '🚪';
      gridEl.appendChild(cell);
    });
  });

  // Actors
  const layer = document.getElementById('actors-layer');
  layer.innerHTML = '';

  const renderActor = (pos, type, label) => {
    const el = document.createElement('div');
    el.className = `actor ${type}`;
    el.textContent = label;
    el.style.transform = `translate(${pos.x * TILE_SIZE}px, ${pos.y * TILE_SIZE}px)`;
    layer.appendChild(el);
  };

  echoes.forEach((echo, idx) => renderActor(echo.position, 'echo', String.fromCharCode(65 + idx)));
  renderActor(player, 'player', 'P');

  // Overlay
  const overlay = document.getElementById('win-overlay');
  overlay.classList.toggle('active', status === 'won');

  // Buttons
  document.getElementById('save-echo-btn').disabled = status !== 'running' || gameState.currentPath.length === 0 || savedEchoes.length >= level.echoLimit;
  document.getElementById('reset-btn').disabled = stepsUsed === 0;
  document.getElementById('clear-btn').disabled = savedEchoes.length === 0;
}

function handleMove(dir) {
  if (gameState.status !== 'running') return;
  gameState = stepRun(gameState, dir);
  render();
}

function initGame(idx) {
  currentLevelIndex = idx;
  gameState = createGameState(LEVELS[currentLevelIndex]);
  render();
}

// Events
document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('intro-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  initGame(0);
});

document.getElementById('save-echo-btn').addEventListener('click', () => {
  gameState = saveEcho(gameState);
  render();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  gameState = resetRun(gameState);
  render();
});

document.getElementById('clear-btn').addEventListener('click', () => {
  gameState = clearEchoes(gameState);
  render();
});

document.querySelectorAll('.btn-move').forEach(btn => {
  btn.addEventListener('click', () => handleMove(btn.dataset.move));
});

document.getElementById('next-btn').addEventListener('click', () => {
  if (currentLevelIndex < LEVELS.length - 1) {
    initGame(currentLevelIndex + 1);
  } else {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('finish-screen').classList.add('active');
  }
});

document.getElementById('restart-game-btn').addEventListener('click', () => {
  document.getElementById('finish-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  initGame(0);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') handleMove('up');
  if (e.key === 'ArrowDown' || e.key === 's') handleMove('down');
  if (e.key === 'ArrowLeft' || e.key === 'a') handleMove('left');
  if (e.key === 'ArrowRight' || e.key === 'd') handleMove('right');
  if (e.key === 'Enter' && !document.getElementById('save-echo-btn').disabled) {
    gameState = saveEcho(gameState);
    render();
  }
});

// Start
render();
