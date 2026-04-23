(() => {
  const TRANSLATIONS = {
    de: {
      eyebrow: 'Single Player · Dreh das Brett, nicht die Figur', title: 'Pivot Path', subtitle: 'Du drehst Pfeilfelder, dann rollt das Paket genau einen Schritt weiter. Sammle alle Stempel ein und lots es ohne Absturz ins Depot.', goalTitle: 'Ziel', goalCopy: 'Jeder Zug erlaubt genau eine Drehung irgendwo auf dem Brett. Danach bewegt sich das Paket automatisch entlang des Pfeils seines aktuellen Felds.', hookTitle: 'Warum es anders ist', hookCopy: 'Du planst nicht eine ganze Route im Voraus. Du wartest das Brett unterwegs live und bist immer genau einen Zug vor der Katastrophe.', start: 'Route starten', boardTitle: 'Schaltbrett', controlsTitle: 'Zugoptionen', controlsHint: 'Tippe ein Feld zum Drehen oder ziehe mit „Weiterrollen“ nur einen Schritt durch.', skip: 'Weiterrollen', reset: 'Level neu', nextLevel: 'Nächstes Level', retry: 'Nochmal', resultEyebrow: 'Rundenende', mission: 'Level {n}: {name}', steps: 'Züge {n}', stamps: 'Stempel {done}/{total}', legendParcelTitle: 'Paket', legendParcelCopy: 'Das leuchtende Paket bewegt sich nach jedem Zug genau ein Feld.', legendRotateTitle: 'Drehbare Felder', legendRotateCopy: 'Tippe ein Feld, um seinen Pfeil im Uhrzeigersinn zu drehen.', legendLockedTitle: 'Fixfelder', legendLockedCopy: 'Felder mit Schloss bleiben stur. Um die musst du herumdenken.', statusReady: 'Noch still. Dreh clever voraus.', statusRunning: 'Unterwegs. Ein Zug Vorsprung reicht.', statusCrash: 'Abgestürzt. Das Paket ist aus dem Brett geflogen.', statusWin: 'Sauber geliefert. Depot erreicht.', statusNeedStamps: 'Der Ausgang zählt erst, wenn alle Stempel eingesammelt sind.', resultCrashTitle: 'Paket verloren', resultCrashCopy: 'Ein falscher Winkel und die Route war weg. Reset und neu einfädeln.', resultWinTitle: 'Lieferung geschafft', resultWinCopy: 'Die Route hält. Alle Stempel drin, Depot getroffen.', resultDoneTitle: 'Alles klar', resultDoneCopy: 'Alle Level erledigt. Du kannst auf bessere Sterne gehen.', level1: 'Warmstart', level2: 'Knickstelle', level3: 'Doppelkurve', level4: 'Feste Nerven', level5: 'Nachtschicht'
    },
    en: {
      eyebrow: 'Single Player · Rotate the board, not the pawn', title: 'Pivot Path', subtitle: 'You rotate arrow tiles, then the parcel moves exactly one step. Grab every stamp and guide it into the depot without flying off the grid.', goalTitle: 'Goal', goalCopy: 'Every turn gives you exactly one rotation anywhere on the board. After that, the parcel automatically follows the arrow on its current tile.', hookTitle: 'Why it feels different', hookCopy: 'You are not programming a full route upfront. You are maintaining a route live, one move ahead of disaster.', start: 'Start route', boardTitle: 'Route board', controlsTitle: 'Turn options', controlsHint: 'Tap a tile to rotate it, or use “Roll on” to advance without changing anything.', skip: 'Roll on', reset: 'Reset level', nextLevel: 'Next level', retry: 'Retry', resultEyebrow: 'Round result', mission: 'Level {n}: {name}', steps: 'Turns {n}', stamps: 'Stamps {done}/{total}', legendParcelTitle: 'Parcel', legendParcelCopy: 'The glowing parcel moves exactly one tile after every turn.', legendRotateTitle: 'Rotatable tiles', legendRotateCopy: 'Tap a tile to spin its arrow clockwise.', legendLockedTitle: 'Locked tiles', legendLockedCopy: 'Tiles with a lock never rotate. You have to route around them.', statusReady: 'Idle. Stay one step ahead.', statusRunning: 'In motion. One smart turn at a time.', statusCrash: 'Crashed. The parcel left the board.', statusWin: 'Clean delivery. Depot reached.', statusNeedStamps: 'The exit only counts after every stamp is collected.', resultCrashTitle: 'Parcel lost', resultCrashCopy: 'One bad angle and the route collapsed. Reset and weave it again.', resultWinTitle: 'Delivery complete', resultWinCopy: 'Route held. All stamps collected, depot reached.', resultDoneTitle: 'All clear', resultDoneCopy: 'Every level is done. Now chase better stars.', level1: 'Warm Boot', level2: 'Kink Point', level3: 'Double Bend', level4: 'Steady Hands', level5: 'Night Shift'
    },
    fr: {
      eyebrow: 'Solo · Tourne le plateau, pas le pion', title: 'Pivot Path', subtitle: 'Tu fais pivoter les flèches puis le colis avance d’une case. Ramasse tous les tampons et guide-le jusqu’au dépôt sans sortir de la grille.', goalTitle: 'But', goalCopy: 'Chaque tour t’offre exactement une rotation n’importe où sur la grille. Ensuite le colis suit automatiquement la flèche de sa case actuelle.', hookTitle: 'Pourquoi c’est différent', hookCopy: 'Tu ne programmes pas tout le trajet d’avance. Tu entretiens la route en direct, un coup avant la catastrophe.', start: 'Lancer la route', boardTitle: 'Tableau de route', controlsTitle: 'Options du tour', controlsHint: 'Touchez une case pour la faire pivoter, ou utilisez « Avancer » pour continuer sans changer le plateau.', skip: 'Avancer', reset: 'Réinitialiser', nextLevel: 'Niveau suivant', retry: 'Rejouer', resultEyebrow: 'Fin de manche', mission: 'Niveau {n} : {name}', steps: 'Tours {n}', stamps: 'Tampons {done}/{total}', legendParcelTitle: 'Colis', legendParcelCopy: 'Le colis lumineux avance d’une case après chaque tour.', legendRotateTitle: 'Cases rotatives', legendRotateCopy: 'Touchez une case pour faire tourner sa flèche dans le sens horaire.', legendLockedTitle: 'Cases fixes', legendLockedCopy: 'Les cases verrouillées ne bougent jamais. Il faut composer avec.', statusReady: 'En attente. Prévois le coup suivant.', statusRunning: 'En route. Un bon pivot à la fois.', statusCrash: 'Crash. Le colis a quitté la grille.', statusWin: 'Livraison propre. Dépôt atteint.', statusNeedStamps: 'La sortie ne compte qu’après tous les tampons.', resultCrashTitle: 'Colis perdu', resultCrashCopy: 'Un mauvais angle et toute la route casse. Repars et retisse-la.', resultWinTitle: 'Livraison réussie', resultWinCopy: 'La route tient. Tous les tampons sont pris et le dépôt est atteint.', resultDoneTitle: 'Tout est terminé', resultDoneCopy: 'Tous les niveaux sont bouclés. Tu peux viser de meilleures étoiles.', level1: 'Démarrage', level2: 'Cassure', level3: 'Double virage', level4: 'Nerfs solides', level5: 'Service de nuit'
    },
    it: {
      eyebrow: 'Giocatore singolo · Gira la plancia, non il pedone', title: 'Pivot Path', subtitle: 'Ruoti le frecce e poi il pacco avanza di una casella. Raccogli tutti i timbri e portalo al deposito senza farlo uscire dalla griglia.', goalTitle: 'Obiettivo', goalCopy: 'Ogni turno ti concede una sola rotazione in qualsiasi punto della plancia. Poi il pacco segue automaticamente la freccia della casella in cui si trova.', hookTitle: 'Perché è diverso', hookCopy: 'Non programmi tutto il percorso in anticipo. Mantieni la rotta dal vivo, sempre un passo prima del disastro.', start: 'Avvia percorso', boardTitle: 'Plancia rotta', controlsTitle: 'Opzioni del turno', controlsHint: 'Tocca una casella per ruotarla, oppure usa “Avanza” per muoverti senza cambiare nulla.', skip: 'Avanza', reset: 'Reset livello', nextLevel: 'Livello successivo', retry: 'Riprova', resultEyebrow: 'Fine round', mission: 'Livello {n}: {name}', steps: 'Turni {n}', stamps: 'Timbri {done}/{total}', legendParcelTitle: 'Pacco', legendParcelCopy: 'Il pacco luminoso si muove di una sola casella dopo ogni turno.', legendRotateTitle: 'Caselle ruotabili', legendRotateCopy: 'Tocca una casella per ruotare la freccia in senso orario.', legendLockedTitle: 'Caselle bloccate', legendLockedCopy: 'Le caselle con il lucchetto non ruotano. Devi ragionare attorno a loro.', statusReady: 'Fermo. Pensa un passo avanti.', statusRunning: 'In corsa. Una mossa furba alla volta.', statusCrash: 'Crash. Il pacco è uscito dalla plancia.', statusWin: 'Consegna pulita. Deposito raggiunto.', statusNeedStamps: 'L’uscita conta solo dopo aver preso tutti i timbri.', resultCrashTitle: 'Pacco perso', resultCrashCopy: 'Un angolo sbagliato e il percorso crolla. Reset e ricomincia a intrecciarlo.', resultWinTitle: 'Consegna riuscita', resultWinCopy: 'La rotta ha tenuto. Tutti i timbri presi, deposito centrato.', resultDoneTitle: 'Tutto fatto', resultDoneCopy: 'Hai finito tutti i livelli. Ora puoi inseguire stelle migliori.', level1: 'Avvio', level2: 'Snodo', level3: 'Doppia curva', level4: 'Nervi saldi', level5: 'Turno di notte'
    },
    es: {
      eyebrow: 'Un jugador · Gira el tablero, no la ficha', title: 'Pivot Path', subtitle: 'Giras flechas y luego el paquete avanza exactamente una casilla. Recoge todos los sellos y llévalo al depósito sin salirte del tablero.', goalTitle: 'Objetivo', goalCopy: 'Cada turno te da exactamente una rotación en cualquier lugar del tablero. Después, el paquete sigue automáticamente la flecha de su casilla actual.', hookTitle: 'Por qué se siente distinto', hookCopy: 'No programas toda la ruta de antemano. Vas manteniendo la línea en vivo, siempre un movimiento antes del desastre.', start: 'Iniciar ruta', boardTitle: 'Tablero de ruta', controlsTitle: 'Opciones del turno', controlsHint: 'Toca una casilla para girarla o usa «Seguir» para avanzar sin cambiar nada.', skip: 'Seguir', reset: 'Reiniciar nivel', nextLevel: 'Siguiente nivel', retry: 'Reintentar', resultEyebrow: 'Fin de ronda', mission: 'Nivel {n}: {name}', steps: 'Turnos {n}', stamps: 'Sellos {done}/{total}', legendParcelTitle: 'Paquete', legendParcelCopy: 'El paquete brillante avanza una casilla tras cada turno.', legendRotateTitle: 'Casillas girables', legendRotateCopy: 'Toca una casilla para girar su flecha en sentido horario.', legendLockedTitle: 'Casillas fijas', legendLockedCopy: 'Las casillas con candado no giran. Toca pensar alrededor de ellas.', statusReady: 'Quieto. Piensa un paso por delante.', statusRunning: 'En marcha. Un giro listo cada vez.', statusCrash: 'Accidente. El paquete salió del tablero.', statusWin: 'Entrega limpia. Depósito alcanzado.', statusNeedStamps: 'La salida solo cuenta cuando recoges todos los sellos.', resultCrashTitle: 'Paquete perdido', resultCrashCopy: 'Un ángulo malo y la ruta se rompió. Reinicia y vuelve a tejerla.', resultWinTitle: 'Entrega completada', resultWinCopy: 'La ruta aguantó. Todos los sellos dentro y depósito alcanzado.', resultDoneTitle: 'Todo listo', resultDoneCopy: 'Todos los niveles están resueltos. Ahora ve a por más estrellas.', level1: 'Arranque', level2: 'Codo', level3: 'Doble curva', level4: 'Pulso firme', level5: 'Turno nocturno'
    },
  };

  const { t, onLangChange } = initI18n(TRANSLATIONS);
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultCard = document.getElementById('result-card');
  const boardEl = document.getElementById('board');
  const startBtn = document.getElementById('start-btn');
  const skipBtn = document.getElementById('skip-btn');
  const resetBtn = document.getElementById('reset-btn');
  const nextBtn = document.getElementById('next-btn');
  const retryBtn = document.getElementById('retry-btn');
  const resultNextBtn = document.getElementById('result-next-btn');
  const statusLine = document.getElementById('status-line');
  const missionLine = document.getElementById('mission-line');
  const levelPill = document.getElementById('level-pill');
  const stepsPill = document.getElementById('steps-pill');
  const stampsPill = document.getElementById('stamps-pill');
  const legend = document.getElementById('legend');
  const resultTitle = document.getElementById('result-title');
  const resultCopy = document.getElementById('result-copy');
  const starRow = document.getElementById('star-row');

  let levelIndex = 0;
  let state = createLevelState(LEVELS[levelIndex]);

  function fmt(key, vars = {}) {
    return Object.entries(vars).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), t(key));
  }

  function setScreen(which) {
    for (const el of [startScreen, gameScreen, resultCard]) el.classList.remove('active');
    which.classList.add('active');
  }

  function arrowGlyph(dir) {
    return { up: '↑', right: '→', down: '↓', left: '←' }[dir] || '•';
  }

  function renderLegend() {
    legend.innerHTML = '';
    const items = [
      ['legendParcelTitle', 'legendParcelCopy'],
      ['legendRotateTitle', 'legendRotateCopy'],
      ['legendLockedTitle', 'legendLockedCopy'],
    ];
    items.forEach(([titleKey, copyKey]) => {
      const item = document.createElement('article');
      item.className = 'legend-item';
      item.innerHTML = `<strong>${t(titleKey)}</strong><span>${t(copyKey)}</span>`;
      legend.appendChild(item);
    });
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${state.width}, 1fr)`;
    for (let y = 0; y < state.height; y += 1) {
      for (let x = 0; x < state.width; x += 1) {
        const cell = state.grid[y][x];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cell';
        if (cell.locked) button.classList.add('locked');
        if (state.parcel.x === x && state.parcel.y === y) button.classList.add('current');
        if (state.trail.includes(`${x},${y}`)) button.classList.add('trail');
        button.dataset.x = String(x);
        button.dataset.y = String(y);
        button.innerHTML = `
          ${x === state.start.x && y === state.start.y ? '<span class="badge start">S</span>' : ''}
          ${x === state.exit.x && y === state.exit.y ? '<span class="badge exit">D</span>' : ''}
          ${state.stamps.some((stamp) => stamp.x === x && stamp.y === y && !state.collected.has(`${x},${y}`)) ? '<span class="badge stamp">✦</span>' : ''}
          ${cell.locked ? '<span class="badge lock">🔒</span>' : ''}
          <span class="arrow">${arrowGlyph(cell.dir)}</span>
          ${state.parcel.x === x && state.parcel.y === y ? '<span class="parcel"></span>' : ''}
        `;
        button.addEventListener('click', () => takeTurn({ type: 'rotate', point: { x, y } }));
        boardEl.appendChild(button);
      }
    }
  }

  function renderHud() {
    levelPill.textContent = fmt('mission', { n: levelIndex + 1, name: t(LEVELS[levelIndex].nameKey) });
    missionLine.textContent = t('goalCopy');
    stepsPill.textContent = fmt('steps', { n: state.steps });
    stampsPill.textContent = fmt('stamps', { done: state.collected.size, total: state.stamps.length });

    if (state.status === 'success') {
      statusLine.textContent = t('statusWin');
      statusLine.className = 'status-success';
    } else if (state.status === 'crash') {
      statusLine.textContent = t('statusCrash');
      statusLine.className = 'status-crash';
    } else if (state.parcel.x === state.exit.x && state.parcel.y === state.exit.y && !allStampsCollected(state)) {
      statusLine.textContent = t('statusNeedStamps');
      statusLine.className = '';
    } else if (state.status === 'running') {
      statusLine.textContent = t('statusRunning');
      statusLine.className = '';
    } else {
      statusLine.textContent = t('statusReady');
      statusLine.className = '';
    }
  }

  function renderResult() {
    const won = state.status === 'success';
    const finalLevel = levelIndex === LEVELS.length - 1 && won;
    resultTitle.textContent = finalLevel ? t('resultDoneTitle') : won ? t('resultWinTitle') : t('resultCrashTitle');
    resultCopy.textContent = finalLevel ? t('resultDoneCopy') : won ? t('resultWinCopy') : t('resultCrashCopy');

    const stars = scoreLevel(state).stars;
    starRow.innerHTML = '';
    for (let i = 0; i < 3; i += 1) {
      const star = document.createElement('div');
      star.className = `star${i < stars ? ' on' : ''}`;
      star.textContent = '★';
      starRow.appendChild(star);
    }
    resultNextBtn.disabled = !won;
    resultNextBtn.hidden = finalLevel;
  }

  function render() {
    renderBoard();
    renderHud();
    renderLegend();
  }

  function resetLevel() {
    state = createLevelState(LEVELS[levelIndex]);
    setScreen(gameScreen);
    render();
  }

  function showResult() {
    render();
    renderResult();
    setScreen(resultCard);
  }

  function takeTurn(action) {
    if (state.status === 'success' || state.status === 'crash') return;
    state = applyTurn(state, action);
    render();
    if (state.status === 'success' || state.status === 'crash') {
      showResult();
    }
  }

  startBtn.addEventListener('click', () => {
    levelIndex = 0;
    resetLevel();
  });
  skipBtn.addEventListener('click', () => takeTurn({ type: 'skip' }));
  resetBtn.addEventListener('click', resetLevel);
  retryBtn.addEventListener('click', resetLevel);
  nextBtn.addEventListener('click', () => {
    if (levelIndex < LEVELS.length - 1) {
      levelIndex += 1;
      resetLevel();
    }
  });
  resultNextBtn.addEventListener('click', () => {
    if (levelIndex < LEVELS.length - 1) {
      levelIndex += 1;
      resetLevel();
    }
  });

  onLangChange(() => {
    render();
    if (resultCard.classList.contains('active')) renderResult();
  });

  render();
})();
