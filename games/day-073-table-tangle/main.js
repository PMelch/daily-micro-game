const TRANSLATIONS = {
  de: {
    title: 'Table Tangle', subtitle: 'Pass & Play Sitzplatz-Puzzle: Arranchiere deine exzentrischen Gäste nach ihren Wünschen. Wer ist der Meister der sozialen Harmonie?', playerCount: 'Wie viele Spieler?', start: 'Spiel starten', ready: 'Ich bin bereit', rulesTitle: 'Sitzordnung-Regeln', points: 'Punkte', submit: 'Sitzordnung fertig', resultTitle: 'Endstand', playAgain: 'Nochmal spielen', round: 'Runde {current} / {max}', turn: '{name} ist dran', transitionTitle: 'Gib das Gerät an {name}!', transitionCopy: 'Nur {name} darf jetzt auf den Bildschirm schauen.', winner: '{name} gewinnt!', tie: 'Gleichstand!', rule_seat: '{a} muss auf Platz {seat} sitzen', rule_adjacent: '{a} und {b} müssen nebeneinander sitzen', rule_notAdjacent: '{a} und {b} dürfen NICHT nebeneinander sitzen', rule_opposite: '{a} und {b} müssen sich gegenüber sitzen', guest_mayor: 'Bürgermeister', guest_chef: 'Chefkoch', guest_critic: 'Kritiker', guest_cat: 'Katze', guest_robot: 'Roboter', guest_dj: 'DJ', guest_captain: 'Kapitän', guest_oracle: 'Orakel', guest_pirate: 'Pirat', guest_botanist: 'Botaniker', guest_ghost: 'Geist', guest_pilot: 'Pilot', guest_queen: 'Königin', guest_magician: 'Magier', guest_fox: 'Fuchs', guest_knight: 'Ritter', guest_inventor: 'Erfinder', guest_twin: 'Zwilling', playerName: 'Spieler {n}'
  },
  en: {
    title: 'Table Tangle', subtitle: 'Pass & Play Seating Challenge: Arrange your eccentric guests according to their whims. Who is the master of social harmony?', playerCount: 'How many players?', start: 'Start Game', ready: 'I\'m Ready', rulesTitle: 'Seating Rules', points: 'Points', submit: 'Finish Seating', resultTitle: 'Final Rankings', playAgain: 'Play Again', round: 'Round {current} / {max}', turn: '{name}\'s Turn', transitionTitle: 'Pass the device to {name}!', transitionCopy: 'Only {name} should look at the screen now.', winner: '{name} Wins!', tie: 'It\'s a Tie!', rule_seat: '{a} must sit at seat {seat}', rule_adjacent: '{a} and {b} must sit adjacent', rule_notAdjacent: '{a} and {b} must NOT sit adjacent', rule_opposite: '{a} and {b} must sit opposite', guest_mayor: 'Mayor', guest_chef: 'Chef', guest_critic: 'Critic', guest_cat: 'Cat', guest_robot: 'Robot', guest_dj: 'DJ', guest_captain: 'Captain', guest_oracle: 'Oracle', guest_pirate: 'Pirate', guest_botanist: 'Botanist', guest_ghost: 'Ghost', guest_pilot: 'Pilot', guest_queen: 'Queen', guest_magician: 'Magician', guest_fox: 'Fox', guest_knight: 'Knight', guest_inventor: 'Inventor', guest_twin: 'Twin', playerName: 'Player {n}'
  },
  fr: {
    title: 'Table Tangle', subtitle: 'Défi de placement Pass & Play : Organisez vos invités excentriques selon leurs envies. Qui sera le maître de l\'harmonie sociale ?', playerCount: 'Combien de joueurs ?', start: 'Commencer', ready: 'Je suis prêt', rulesTitle: 'Règles de placement', points: 'Points', submit: 'Valider le plan', resultTitle: 'Classement final', playAgain: 'Rejouer', round: 'Manche {current} / {max}', turn: 'Tour de {name}', transitionTitle: 'Passez l\'appareil à {name} !', transitionCopy: 'Seul {name} doit regarder l\'écran.', winner: '{name} gagne !', tie: 'Égalité !', rule_seat: '{a} doit être au siège {seat}', rule_adjacent: '{a} et {b} doivent être adjacents', rule_notAdjacent: '{a} et {b} ne doivent PAS être adjacents', rule_opposite: '{a} et {b} doivent être face à face', guest_mayor: 'Maire', guest_chef: 'Chef', guest_critic: 'Critique', guest_cat: 'Chat', guest_robot: 'Robot', guest_dj: 'DJ', guest_captain: 'Capitaine', guest_oracle: 'Oracle', guest_pirate: 'Pirate', guest_botanist: 'Botaniste', guest_ghost: 'Fantôme', guest_pilot: 'Pilote', guest_queen: 'Reine', guest_magician: 'Magicien', guest_fox: 'Renard', guest_knight: 'Chevalier', guest_inventor: 'Inventeur', guest_twin: 'Jumeau', playerName: 'Joueur {n}'
  },
  it: {
    title: 'Table Tangle', subtitle: 'Sfida di posti Pass & Play: Disponi i tuoi eccentrici ospiti secondo i loro desideri. Chi è il maestro dell\'armonia sociale?', playerCount: 'Quanti giocatori?', start: 'Inizia Gioco', ready: 'Sono Pronto', rulesTitle: 'Regole dei Posti', points: 'Punti', submit: 'Finisci Disposizione', resultTitle: 'Classifica Finale', playAgain: 'Gioca Ancora', round: 'Round {current} / {max}', turn: 'Turno di {name}', transitionTitle: 'Passa il dispositivo a {name}!', transitionCopy: 'Solo {name} deve guardare lo schermo ora.', winner: '{name} Vince!', tie: 'È un Pareggio!', rule_seat: '{a} deve sedere al posto {seat}', rule_adjacent: '{a} e {b} devono essere vicini', rule_notAdjacent: '{a} e {b} NON devono essere vicini', rule_opposite: '{a} e {b} devono essere opposti', guest_mayor: 'Sindaco', guest_chef: 'Chef', guest_critic: 'Critico', guest_cat: 'Gatto', guest_robot: 'Robot', guest_dj: 'DJ', guest_captain: 'Capitano', guest_oracle: 'Oracolo', guest_pirate: 'Pirata', guest_botanist: 'Botanico', guest_ghost: 'Fantasma', guest_pilot: 'Pilota', guest_queen: 'Regina', guest_magician: 'Mago', guest_fox: 'Volpe', guest_knight: 'Cavaliere', guest_inventor: 'Inventore', guest_twin: 'Gemello', playerName: 'Giocatore {n}'
  },
  es: {
    title: 'Table Tangle', subtitle: 'Desafío de asientos Pass & Play: Organiza a tus excéntricos invitados según sus caprichos. ¿Quién es el maestro de la armonía social?', playerCount: '¿Cuántos jugadores?', start: 'Empezar Juego', ready: 'Estoy Listo', rulesTitle: 'Reglas de Asientos', points: 'Puntos', submit: 'Terminar Asientos', resultTitle: 'Clasificación Final', playAgain: 'Jugar de Nuevo', round: 'Ronda {current} / {max}', turn: 'Turno de {name}', transitionTitle: 'Pasa el dispositivo a {name}', transitionCopy: 'Solo {name} debe mirar la pantalla ahora.', winner: '¡{name} Gana!', tie: '¡Empate!', rule_seat: '{a} debe sentarse en el asiento {seat}', rule_adjacent: '{a} y {b} deben estar juntos', rule_notAdjacent: '{a} y {b} NO deben estar juntos', rule_opposite: '{a} y {b} deben estar opuestos', guest_mayor: 'Alcalde', guest_chef: 'Chef', guest_critic: 'Crítico', guest_cat: 'Gato', guest_robot: 'Robot', guest_dj: 'DJ', guest_captain: 'Capitán', guest_oracle: 'Oráculo', guest_pirate: 'Pirata', guest_botanist: 'Botánico', guest_ghost: 'Fantasma', guest_pilot: 'Piloto', guest_queen: 'Reina', guest_magician: 'Mago', guest_fox: 'Zorro', guest_knight: 'Caballero', guest_inventor: 'Inventor', guest_twin: 'Gemelo', playerName: 'Jugador {n}'
  }
};

const GUEST_EMOJIS = {
  mayor: '🎩', chef: '👨‍🍳', critic: '🧐', cat: '🐱', robot: '🤖', dj: '🎧',
  captain: '👩‍✈️', oracle: '🔮', pirate: '🏴‍☠️', botanist: '🌿', ghost: '👻', pilot: '👨‍🚀',
  queen: '👑', magician: '🧙', fox: '🦊', knight: '🛡️', inventor: '🔧', twin: '👯'
};

const { t, translatePage, onLangChange } = window.initI18n(TRANSLATIONS);
const { createGame, getCurrentPuzzle, isArrangementComplete, scoreArrangement, submitArrangement, getRankings, SEAT_COUNT } = window.TableTangle;

const state = {
  game: null,
  arrangement: Array(SEAT_COUNT).fill(null),
  selectedGuestId: null,
};

const screens = {
  setup: document.getElementById('setup-screen'),
  transition: document.getElementById('transition-screen'),
  game: document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

function fmt(key, vars = {}) {
  return Object.entries(vars).reduce((text, [k, v]) => text.replaceAll(`{${k}}`, String(v)), t(key));
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle('active', key === name));
}

function initSetup() {
  const select = document.getElementById('player-count');
  select.innerHTML = [2, 3, 4].map(n => `<option value="${n}">${n}</option>`).join('');
  select.onchange = renderNameFields;
  renderNameFields();
}

function renderNameFields() {
  const count = parseInt(document.getElementById('player-count').value);
  const container = document.getElementById('name-fields');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'name-row';
    row.innerHTML = `<span>${fmt('playerName', { n: i + 1 })}</span><input type="text" id="player-${i}" value="Spieler ${i + 1}">`;
    container.appendChild(row);
  }
}

function showTransition() {
  const player = state.game.players[state.game.currentPlayerIndex];
  document.getElementById('transition-title').textContent = fmt('transitionTitle', { name: player.name });
  document.getElementById('transition-copy').textContent = fmt('transitionCopy', { name: player.name });
  showScreen('transition');
}

function renderGame() {
  const player = state.game.players[state.game.currentPlayerIndex];
  const puzzle = getCurrentPuzzle(state.game);
  const score = scoreArrangement(puzzle, state.arrangement);

  document.getElementById('round-pill').textContent = fmt('round', { current: state.game.round, max: state.game.maxRounds });
  document.getElementById('turn-line').textContent = fmt('turn', { name: player.name });
  document.getElementById('score-preview').textContent = score.total;

  renderRules(puzzle, score);
  renderSeats();
  renderGuestPool(puzzle);

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = !isArrangementComplete(state.arrangement);
}

function renderRules(puzzle, score) {
  const list = document.getElementById('rules-list');
  list.innerHTML = '';
  puzzle.rules.forEach((rule, i) => {
    const detail = score.details[i];
    const item = document.createElement('div');
    item.className = 'rule-item';
    
    let statusCls = 'pending';
    let statusIcon = '?';
    if (state.arrangement.includes(rule.a) && (!rule.b || state.arrangement.includes(rule.b))) {
      statusCls = detail.ok ? 'ok' : 'broken';
      statusIcon = detail.ok ? '✓' : '✗';
    }

    const ruleText = fmt(`rule_${rule.type}`, {
      a: t(`guest_${rule.a}`),
      b: rule.b ? t(`guest_${rule.b}`) : '',
      seat: rule.seat
    });

    item.innerHTML = `<div class="rule-status ${statusCls}">${statusIcon}</div><span>${ruleText}</span>`;
    list.appendChild(item);
  });
}

function renderSeats() {
  const table = document.getElementById('table');
  table.querySelectorAll('.seat').forEach(s => s.remove());
  
  const radius = 110;
  for (let i = 0; i < SEAT_COUNT; i++) {
    const angle = (i * (360 / SEAT_COUNT) - 90) * (Math.PI / 180);
    const x = 140 + radius * Math.cos(angle) - 30;
    const y = 140 + radius * Math.sin(angle) - 30;

    const seat = document.createElement('div');
    seat.className = 'seat';
    if (state.arrangement[i]) seat.classList.add('filled');
    seat.style.left = `${x}px`;
    seat.style.top = `${y}px`;
    seat.dataset.seatIndex = i;

    if (state.arrangement[i]) {
      seat.innerHTML = `<span class="guest-icon">${GUEST_EMOJIS[state.arrangement[i]]}</span>`;
    } else {
      seat.innerHTML = `<span style="color:var(--muted); font-size: 0.8rem;">${i}</span>`;
    }

    seat.onclick = () => {
      if (state.selectedGuestId) {
        // If guest is already somewhere else, swap or clear
        const oldIndex = state.arrangement.indexOf(state.selectedGuestId);
        if (oldIndex !== -1) state.arrangement[oldIndex] = null;
        
        state.arrangement[i] = state.selectedGuestId;
        state.selectedGuestId = null;
        renderGame();
      } else if (state.arrangement[i]) {
        state.selectedGuestId = state.arrangement[i];
        state.arrangement[i] = null;
        renderGame();
      }
    };
    table.appendChild(seat);
  }
}

function renderGuestPool(puzzle) {
  const pool = document.getElementById('guest-pool');
  pool.innerHTML = '';
  puzzle.guestIds.forEach(id => {
    const card = document.createElement('div');
    card.className = 'guest-card';
    if (state.arrangement.includes(id)) card.classList.add('used');
    if (state.selectedGuestId === id) card.classList.add('selected');
    card.dataset.guestId = id;
    card.innerHTML = `<span class="guest-icon">${GUEST_EMOJIS[id]}</span>`;
    card.onclick = () => {
      if (state.arrangement.includes(id)) return;
      state.selectedGuestId = (state.selectedGuestId === id) ? null : id;
      renderGame();
    };
    pool.appendChild(card);
  });
}

function showResults() {
  const rankings = getRankings(state.game);
  const container = document.getElementById('final-scores');
  container.innerHTML = '';
  rankings.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'score-row' + (i === 0 ? ' winner' : '');
    row.innerHTML = `<span>${r.name}</span><strong>${r.score}</strong>`;
    container.appendChild(row);
  });

  const winnerLine = document.getElementById('winner-line');
  if (rankings.length > 1 && rankings[0].score === rankings[1].score) {
    winnerLine.textContent = t('tie');
  } else {
    winnerLine.textContent = fmt('winner', { name: rankings[0].name });
  }
  showScreen('result');
}

document.getElementById('start-btn').onclick = () => {
  const names = [...document.querySelectorAll('#name-fields input')].map(i => i.value.trim() || 'Spieler');
  state.game = createGame(names);
  showTransition();
};

document.getElementById('ready-btn').onclick = () => {
  state.arrangement = Array(SEAT_COUNT).fill(null);
  state.selectedGuestId = null;
  renderGame();
  showScreen('game');
};

document.getElementById('submit-btn').onclick = () => {
  const result = submitArrangement(state.game, state.arrangement);
  if (result.ok) {
    if (state.game.status === 'finished') {
      showResults();
    } else {
      showTransition();
    }
  }
};

document.getElementById('restart-btn').onclick = () => {
  state.game = null;
  showScreen('setup');
};

onLangChange(translatePage);
initSetup();
translatePage();
