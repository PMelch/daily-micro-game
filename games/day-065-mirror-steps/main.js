const TRANSLATIONS = {
  de: {
    title: 'Mirror Steps', subtitle: 'Zwei Figuren, ein Input. Gelb läuft normal, Lila spiegelt jeden Zug. Sammle beide Kristalle und parke beide auf den Zielmarken.',
    legendHero: 'Held', legendMirror: 'Spiegel', legendCrystal: 'Kristall', legendGoal: 'Ziel',
    level: 'Level {n}/8', moves: 'Züge {n}', reset: 'Neu starten', next: 'Nächstes Level', retry: 'Nochmal', resultTitle: 'Geschafft',
    hint: 'Jeder Pfeil bewegt beide gleichzeitig. Links und rechts sind gespiegelt. Triff mit beiden Figuren die Zielzellen.',
    progress: 'Noch {remaining} Kristalle, dann beide auf Ziele.', solved: 'Sauber gelöst. Beide Figuren sind im Takt gelandet.', finished: 'Alle 8 Level gelöst. Mirror Steps ist durch.',
    starLine: '{stars} Sterne', back: '← Zurück zu den Spielen'
  },
  en: {
    title: 'Mirror Steps', subtitle: 'Two avatars, one input. Yellow moves normally, purple mirrors every horizontal move. Collect both crystals and park both on goal tiles.',
    legendHero: 'Hero', legendMirror: 'Mirror', legendCrystal: 'Crystal', legendGoal: 'Goal',
    level: 'Level {n}/8', moves: 'Moves {n}', reset: 'Reset', next: 'Next level', retry: 'Retry', resultTitle: 'Solved',
    hint: 'Every arrow moves both avatars at once. Left and right are mirrored. End with both avatars on goal tiles.',
    progress: '{remaining} crystals left, then land both avatars on goals.', solved: 'Clean solve. Both avatars landed in sync.', finished: 'All 8 levels solved. Mirror Steps is done.',
    starLine: '{stars} stars', back: '← Back to Games'
  },
  fr: {
    title: 'Mirror Steps', subtitle: 'Deux personnages, une seule commande. Le jaune bouge normalement, le violet reflète chaque mouvement horizontal. Ramasse les deux cristaux et gare les deux sur les objectifs.',
    legendHero: 'Héros', legendMirror: 'Miroir', legendCrystal: 'Cristal', legendGoal: 'But',
    level: 'Niveau {n}/8', moves: 'Coups {n}', reset: 'Recommencer', next: 'Niveau suivant', retry: 'Rejouer', resultTitle: 'Réussi',
    hint: 'Chaque flèche déplace les deux personnages. Gauche et droite sont inversées. Termine avec les deux sur les cases but.',
    progress: 'Encore {remaining} cristaux, puis place les deux sur les objectifs.', solved: 'Résolu proprement. Les deux personnages arrivent ensemble.', finished: 'Les 8 niveaux sont terminés. Mirror Steps est fini.',
    starLine: '{stars} étoiles', back: '← Retour aux jeux'
  },
  it: {
    title: 'Mirror Steps', subtitle: 'Due pedine, un solo input. La gialla si muove normale, la viola riflette ogni movimento orizzontale. Raccogli entrambi i cristalli e porta entrambe sulle caselle obiettivo.',
    legendHero: 'Eroe', legendMirror: 'Specchio', legendCrystal: 'Cristallo', legendGoal: 'Obiettivo',
    level: 'Livello {n}/8', moves: 'Mosse {n}', reset: 'Ricomincia', next: 'Livello successivo', retry: 'Riprova', resultTitle: 'Risolto',
    hint: 'Ogni freccia muove entrambe le pedine insieme. Sinistra e destra sono specchiate. Finisci con entrambe sugli obiettivi.',
    progress: 'Restano {remaining} cristalli, poi porta entrambe sugli obiettivi.', solved: 'Risolto bene. Entrambe atterrano in sincronia.', finished: 'Tutti e 8 i livelli sono completati. Mirror Steps è finito.',
    starLine: '{stars} stelle', back: '← Torna ai giochi'
  },
  es: {
    title: 'Mirror Steps', subtitle: 'Dos fichas, una sola orden. La amarilla se mueve normal, la morada refleja cada movimiento horizontal. Recoge ambos cristales y aparca ambas en las metas.',
    legendHero: 'Héroe', legendMirror: 'Espejo', legendCrystal: 'Cristal', legendGoal: 'Meta',
    level: 'Nivel {n}/8', moves: 'Movimientos {n}', reset: 'Reiniciar', next: 'Siguiente nivel', retry: 'Reintentar', resultTitle: 'Resuelto',
    hint: 'Cada flecha mueve a las dos fichas a la vez. Izquierda y derecha están espejadas. Termina con ambas sobre metas.',
    progress: 'Quedan {remaining} cristales, luego coloca ambas en las metas.', solved: 'Resuelto limpio. Las dos fichas aterrizan sincronizadas.', finished: 'Los 8 niveles están resueltos. Mirror Steps terminado.',
    starLine: '{stars} estrellas', back: '← Volver a los juegos'
  }
};

const { t, onLangChange, translatePage } = initI18n(TRANSLATIONS);
document.querySelector('.back-bar a').textContent = t('back');

const LEVELS = [
  { width: 5, height: 5, heroStart: { x: 1, y: 1 }, mirrorStart: { x: 3, y: 1 }, goals: [{ x: 1, y: 0 }, { x: 3, y: 0 }], walls: [], crystals: [{ x: 1, y: 0 }, { x: 3, y: 0 }], par: 1 },
  { width: 5, height: 5, heroStart: { x: 1, y: 4 }, mirrorStart: { x: 3, y: 4 }, goals: [{ x: 0, y: 2 }, { x: 4, y: 2 }], walls: [], crystals: [{ x: 0, y: 3 }, { x: 4, y: 3 }], par: 3 },
  { width: 6, height: 6, heroStart: { x: 1, y: 5 }, mirrorStart: { x: 4, y: 5 }, goals: [{ x: 0, y: 1 }, { x: 5, y: 1 }], walls: [], crystals: [{ x: 0, y: 3 }, { x: 5, y: 3 }], par: 5 },
  { width: 6, height: 6, heroStart: { x: 2, y: 5 }, mirrorStart: { x: 3, y: 5 }, goals: [{ x: 1, y: 0 }, { x: 4, y: 0 }], walls: [], crystals: [{ x: 1, y: 3 }, { x: 4, y: 3 }], par: 6 },
  { width: 6, height: 6, heroStart: { x: 1, y: 4 }, mirrorStart: { x: 4, y: 4 }, goals: [{ x: 0, y: 0 }, { x: 5, y: 0 }], walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }], crystals: [{ x: 0, y: 3 }, { x: 5, y: 3 }], par: 5 },
  { width: 7, height: 7, heroStart: { x: 2, y: 6 }, mirrorStart: { x: 4, y: 6 }, goals: [{ x: 0, y: 0 }, { x: 6, y: 0 }], walls: [{ x: 3, y: 3 }], crystals: [{ x: 1, y: 4 }, { x: 5, y: 4 }], par: 8 },
  { width: 7, height: 7, heroStart: { x: 1, y: 6 }, mirrorStart: { x: 5, y: 6 }, goals: [{ x: 0, y: 1 }, { x: 6, y: 1 }], walls: [{ x: 2, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 2 }], crystals: [{ x: 0, y: 4 }, { x: 6, y: 4 }], par: 6 },
  { width: 7, height: 7, heroStart: { x: 2, y: 6 }, mirrorStart: { x: 4, y: 6 }, goals: [{ x: 1, y: 0 }, { x: 5, y: 0 }], walls: [{ x: 0, y: 3 }, { x: 6, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 4 }], crystals: [{ x: 1, y: 5 }, { x: 5, y: 5 }, { x: 1, y: 1 }, { x: 5, y: 1 }], par: 7 },
];

const board = document.getElementById('board');
const ctx = board.getContext('2d');
const messageEl = document.getElementById('message');
const levelPill = document.getElementById('level-pill');
const movePill = document.getElementById('move-pill');
const resultCard = document.getElementById('result-card');
const resultMessage = document.getElementById('result-message');
const resultStars = document.getElementById('result-stars');

let levelIndex = 0;
let state = MirrorStepsLogic.createLevelState(LEVELS[levelIndex]);

function fmt(key, vars = {}) {
  let value = t(key);
  Object.entries(vars).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, String(replacement));
  });
  return value;
}

function currentLevel() {
  return LEVELS[levelIndex];
}

function resetLevel() {
  state = MirrorStepsLogic.createLevelState(currentLevel());
  resultCard.classList.remove('active');
  render();
}

function goNext() {
  if (levelIndex < LEVELS.length - 1) {
    levelIndex += 1;
    resetLevel();
  } else {
    resultCard.classList.remove('active');
    messageEl.textContent = t('finished');
    renderBoard();
  }
}

function handleMove(direction) {
  if (MirrorStepsLogic.isLevelSolved(state)) return;
  state = MirrorStepsLogic.applyMove(state, direction);
  if (MirrorStepsLogic.isLevelSolved(state)) {
    const overshoot = Math.max(0, state.moves - currentLevel().par);
    const stars = overshoot === 0 ? 3 : overshoot === 1 ? 2 : 1;
    resultCard.classList.add('active');
    resultMessage.textContent = t('solved');
    resultStars.textContent = fmt('starLine', { stars });
  }
  render();
}

function renderBoard() {
  const level = currentLevel();
  const cell = board.width / level.width;
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.fillStyle = '#07111d';
  ctx.fillRect(0, 0, board.width, board.height);

  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#10243d' : '#0d1d31';
      ctx.fillRect(x * cell, y * cell, cell, cell);
      ctx.strokeStyle = 'rgba(255,255,255,.06)';
      ctx.strokeRect(x * cell, y * cell, cell, cell);
    }
  }

  level.goals.forEach((goal) => {
    ctx.strokeStyle = '#7dffac';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(goal.x * cell + cell / 2, goal.y * cell + cell / 2, cell * 0.22, 0, Math.PI * 2);
    ctx.stroke();
  });

  level.walls.forEach((wall) => {
    ctx.fillStyle = '#314863';
    ctx.fillRect(wall.x * cell + 10, wall.y * cell + 10, cell - 20, cell - 20);
  });

  level.crystals.forEach((crystal) => {
    const collected = state.collected.has(`${crystal.x},${crystal.y}`);
    ctx.fillStyle = collected ? '#35506d' : '#8bf0ff';
    ctx.beginPath();
    ctx.moveTo(crystal.x * cell + cell / 2, crystal.y * cell + 10);
    ctx.lineTo(crystal.x * cell + cell - 12, crystal.y * cell + cell / 2);
    ctx.lineTo(crystal.x * cell + cell / 2, crystal.y * cell + cell - 10);
    ctx.lineTo(crystal.x * cell + 12, crystal.y * cell + cell / 2);
    ctx.closePath();
    ctx.fill();
  });

  const drawAvatar = (avatar, fill, stroke) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(avatar.x * cell + cell / 2, avatar.y * cell + cell / 2, cell * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  drawAvatar(state.hero, '#ffd166', '#6e4e00');
  drawAvatar(state.mirror, '#c77dff', '#49206c');
}

function render() {
  translatePage();
  document.querySelector('.back-bar a').textContent = t('back');
  levelPill.textContent = fmt('level', { n: levelIndex + 1 });
  movePill.textContent = fmt('moves', { n: state.moves });
  const remaining = currentLevel().crystals.length - state.collected.size;
  messageEl.textContent = MirrorStepsLogic.isLevelSolved(state) ? t('solved') : remaining > 0 ? fmt('progress', { remaining }) : t('hint');
  renderBoard();
}

document.querySelectorAll('.move-btn').forEach((button) => {
  button.addEventListener('click', () => handleMove(button.dataset.dir));
});

document.addEventListener('keydown', (event) => {
  const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  if (keyMap[event.key]) {
    event.preventDefault();
    handleMove(keyMap[event.key]);
  }
});

document.getElementById('reset-btn').addEventListener('click', resetLevel);
document.getElementById('next-btn').addEventListener('click', goNext);
document.getElementById('retry-btn').addEventListener('click', resetLevel);
document.getElementById('result-next-btn').addEventListener('click', goNext);
onLangChange(render);
render();
