const TRANSLATIONS = {
  en: {
    title: "Cosmic Delivery",
    back_to_games: "← Back to Games",
    fuel: "Fuel",
    level: "Level",
    instructions: "Land safely on the green pad. Don't crash!",
    start: "Start Game",
    game_over: "CRASHED!",
    out_of_fuel: "OUT OF FUEL!",
    try_again: "Try Again",
    success: "LANDED!",
    next_level: "Next Level",
    win: "YOU WIN!",
    win_desc: "All deliveries complete!"
  },
  de: {
    title: "Kosmische Lieferung",
    back_to_games: "← Zurück zu Spielen",
    fuel: "Treibstoff",
    level: "Level",
    instructions: "Lande sicher auf dem grünen Pad. Nicht abstürzen!",
    start: "Spiel Starten",
    game_over: "ABGESTÜRZT!",
    out_of_fuel: "LEERER TANK!",
    try_again: "Nochmal Versuchen",
    success: "GELANDET!",
    next_level: "Nächstes Level",
    win: "GEWONNEN!",
    win_desc: "Alle Lieferungen abgeschlossen!"
  },
  fr: {
    title: "Livraison Cosmique",
    back_to_games: "← Retour aux Jeux",
    fuel: "Carburant",
    level: "Niveau",
    instructions: "Atterrissez sur la plateforme verte. Ne vous écrasez pas!",
    start: "Démarrer",
    game_over: "ÉCRASÉ!",
    out_of_fuel: "PLUS DE CARBURANT!",
    try_again: "Réessayer",
    success: "ATTERRI!",
    next_level: "Niveau Suivant",
    win: "GAGNÉ!",
    win_desc: "Toutes les livraisons terminées!"
  },
  it: {
    title: "Consegna Cosmica",
    back_to_games: "← Torna ai Giochi",
    fuel: "Carburante",
    level: "Livello",
    instructions: "Atterra in modo sicuro sulla piattaforma verde. Non schiantarti!",
    start: "Inizia",
    game_over: "SCHIANTO!",
    out_of_fuel: "SENZA CARBURANTE!",
    try_again: "Riprova",
    success: "ATTERRATO!",
    next_level: "Prossimo Livello",
    win: "HAI VINTO!",
    win_desc: "Tutte le consegne completate!"
  },
  es: {
    title: "Entrega Cósmica",
    back_to_games: "← Volver a Juegos",
    fuel: "Combustible",
    level: "Nivel",
    instructions: "Aterriza con seguridad en la plataforma verde. ¡No te estrelles!",
    start: "Empezar",
    game_over: "¡ESTRELLADO!",
    out_of_fuel: "¡SIN COMBUSTIBLE!",
    try_again: "Intentar de Nuevo",
    success: "¡ATERRIZADO!",
    next_level: "Siguiente Nivel",
    win: "¡GANASTE!",
    win_desc: "¡Todas las entregas completadas!"
  }
};

let _t = key => TRANSLATIONS.en[key] || key;
if (typeof initI18n !== 'undefined') {
  const i18n = initI18n(TRANSLATIONS);
  _t = i18n.t;
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiMessages = document.getElementById('messages');
const uiFuel = document.getElementById('fuel-val');
const uiLevel = document.getElementById('level-val');
const btnStart = document.getElementById('start-btn');
const msgTitle = document.getElementById('msg-title');
const msgDesc = document.getElementById('msg-desc');

let lastTime = 0;
let gameState = 'START'; // START, PLAYING, SUCCESS, GAMEOVER, WIN
let currentLevel = 0;

const keys = { ArrowUp: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, d: false };

window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

const btnLeft = document.getElementById('btn-left');
const btnThrust = document.getElementById('btn-thrust');
const btnRight = document.getElementById('btn-right');

const addTouch = (el, key) => {
  el.addEventListener('touchstart', e => { e.preventDefault(); keys[key] = true; });
  el.addEventListener('touchend', e => { e.preventDefault(); keys[key] = false; });
  el.addEventListener('mousedown', e => { e.preventDefault(); keys[key] = true; });
  el.addEventListener('mouseup', e => { e.preventDefault(); keys[key] = false; });
  el.addEventListener('mouseleave', e => { e.preventDefault(); keys[key] = false; });
};
addTouch(btnLeft, 'ArrowLeft');
addTouch(btnThrust, 'ArrowUp');
addTouch(btnRight, 'ArrowRight');

const LEVELS = [
  { shipX: 50, shipY: 50, padX: 380, padY: 600, padW: 80, padH: 20, obstacles: [{x:0, y:300, w:250, h:30}] },
  { shipX: 50, shipY: 50, padX: 50, padY: 600, padW: 60, padH: 20, obstacles: [{x:0, y:200, w:350, h:30}, {x:150, y:400, w:350, h:30}] },
  { shipX: 430, shipY: 50, padX: 200, padY: 600, padW: 50, padH: 20, obstacles: [{x:100, y:150, w:380, h:30}, {x:0, y:300, w:300, h:30}, {x:100, y:450, w:380, h:30}] },
  { shipX: 50, shipY: 50, padX: 380, padY: 100, padW: 50, padH: 20, obstacles: [{x:150, y:0, w:50, h:400}, {x:300, y:200, w:50, h:440}] }
];

let ship = {
  x: 50, y: 50, vx: 0, vy: 0, angle: -Math.PI/2, fuel: 100, radius: 10,
  width: 20, height: 30
};

let particles = [];

function initLevel() {
  const lvl = LEVELS[currentLevel];
  ship.x = lvl.shipX;
  ship.y = lvl.shipY;
  ship.vx = 0;
  ship.vy = 0;
  ship.angle = -Math.PI/2;
  ship.fuel = 100;
  particles = [];
  uiLevel.innerText = currentLevel + 1;
  gameState = 'PLAYING';
  uiMessages.classList.add('hidden');
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

btnStart.addEventListener('click', () => {
  if (gameState === 'WIN') currentLevel = 0;
  initLevel();
});

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI/2); // Draw upright

  // Body
  ctx.fillStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(10, 10);
  ctx.lineTo(-10, 10);
  ctx.closePath();
  ctx.fill();

  // Window
  ctx.fillStyle = '#3cf';
  ctx.beginPath();
  ctx.arc(0, -2, 4, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function spawnParticles() {
  // Thruster pos
  const tx = ship.x - Math.cos(ship.angle) * 15;
  const ty = ship.y - Math.sin(ship.angle) * 15;
  particles.push({
    x: tx + (Math.random()-0.5)*5,
    y: ty + (Math.random()-0.5)*5,
    vx: -Math.cos(ship.angle)*50 + (Math.random()-0.5)*20,
    vy: -Math.sin(ship.angle)*50 + (Math.random()-0.5)*20,
    life: 0.5 + Math.random()*0.5
  });
}

function explosion() {
  for(let i=0; i<30; i++) {
    particles.push({
      x: ship.x, y: ship.y,
      vx: (Math.random()-0.5)*200,
      vy: (Math.random()-0.5)*200,
      life: 0.5 + Math.random(),
      color: Math.random() > 0.5 ? '#f50' : '#fa0'
    });
  }
}

function rectIntersect(r1, r2) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function checkCollisions() {
  const lvl = LEVELS[currentLevel];
  // Pad collision
  if (ship.y + 10 >= lvl.padY && ship.y <= lvl.padY + lvl.padH) {
    if (ship.x >= lvl.padX && ship.x <= lvl.padX + lvl.padW) {
      // Check speed and angle
      const speed = Math.sqrt(ship.vx*ship.vx + ship.vy*ship.vy);
      const angleDeg = ((ship.angle + Math.PI*2) % (Math.PI*2)) * 180 / Math.PI;
      const upright = (angleDeg > 250 && angleDeg < 290);

      if (speed < 40 && upright) {
        return 'LANDED';
      } else {
        return 'CRASH_PAD';
      }
    }
  }

  // Bounds
  if (ship.x < 0 || ship.x > canvas.width || ship.y < 0 || ship.y > canvas.height) return 'CRASH_BOUNDS';

  // Obstacles
  const shipRect = { left: ship.x-10, right: ship.x+10, top: ship.y-10, bottom: ship.y+10 };
  for (let obs of lvl.obstacles) {
    const obsRect = { left: obs.x, right: obs.x+obs.w, top: obs.y, bottom: obs.y+obs.h };
    if (rectIntersect(shipRect, obsRect)) return 'CRASH_OBS';
  }

  return 'NONE';
}

function gameLoop(time) {
  if (gameState !== 'PLAYING') return;

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  // Max dt to prevent physics glitches
  const safeDt = Math.min(dt, 0.05);

  const thrusting = (keys.ArrowUp || keys.w);
  let turnDir = 0;
  if (keys.ArrowLeft || keys.a) turnDir = -1;
  if (keys.ArrowRight || keys.d) turnDir = 1;

  if (thrusting && ship.fuel > 0) {
    spawnParticles();
    const thrustPower = 120;
    ship.vx += Math.cos(ship.angle) * thrustPower * safeDt;
    ship.vy += Math.sin(ship.angle) * thrustPower * safeDt;
    ship.fuel -= 20 * safeDt;
  }

  // Gravity
  ship.vy += 40 * safeDt;
  
  // Rotation
  ship.angle += turnDir * 3 * safeDt;

  ship.x += ship.vx * safeDt;
  ship.y += ship.vy * safeDt;

  // Update UI
  uiFuel.innerText = Math.max(0, Math.floor(ship.fuel));

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx * safeDt;
    p.y += p.vy * safeDt;
    p.life -= safeDt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Collision
  const col = checkCollisions();
  if (col.startsWith('CRASH')) {
    gameState = 'GAMEOVER';
    explosion();
    setTimeout(() => {
      msgTitle.innerText = _t('game_over') || TRANSLATIONS.en.game_over;
      msgDesc.innerText = _t('try_again') || TRANSLATIONS.en.try_again;
      btnStart.innerText = _t('try_again') || TRANSLATIONS.en.try_again;
      uiMessages.classList.remove('hidden');
    }, 1000);
  } else if (col === 'LANDED') {
    gameState = 'SUCCESS';
    setTimeout(() => {
      currentLevel++;
      if (currentLevel >= LEVELS.length) {
        gameState = 'WIN';
        msgTitle.innerText = _t('win') || TRANSLATIONS.en.win;
        msgDesc.innerText = _t('win_desc') || TRANSLATIONS.en.win_desc;
        btnStart.innerText = _t('try_again') || TRANSLATIONS.en.try_again;
      } else {
        msgTitle.innerText = _t('success') || TRANSLATIONS.en.success;
        msgDesc.innerText = _t('next_level') || TRANSLATIONS.en.next_level;
        btnStart.innerText = _t('next_level') || TRANSLATIONS.en.next_level;
      }
      uiMessages.classList.remove('hidden');
    }, 1000);
  }

  draw();

  if (gameState === 'PLAYING') {
    requestAnimationFrame(gameLoop);
  } else {
    // animate explosion
    requestAnimationFrame(endLoop);
  }
}

function endLoop(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;
  const safeDt = Math.min(dt, 0.05);

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx * safeDt;
    p.y += p.vy * safeDt;
    p.life -= safeDt;
    if (p.life <= 0) particles.splice(i, 1);
  }
  
  draw();
  if (gameState !== 'PLAYING') requestAnimationFrame(endLoop);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const lvl = LEVELS[currentLevel] || LEVELS[0];

  // Draw obstacles
  ctx.fillStyle = '#444';
  for (let obs of lvl.obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    // highlight edge
    ctx.fillStyle = '#666';
    ctx.fillRect(obs.x, obs.y, obs.w, 2);
    ctx.fillStyle = '#444';
  }

  // Draw Pad
  ctx.fillStyle = '#0f0';
  ctx.fillRect(lvl.padX, lvl.padY, lvl.padW, lvl.padH);
  ctx.fillStyle = '#afa';
  ctx.fillRect(lvl.padX, lvl.padY, lvl.padW, 4);

  // Draw ship if not crashed
  if (gameState === 'PLAYING' || gameState === 'SUCCESS') {
    drawShip();
  }

  // Draw particles
  for (let p of particles) {
    ctx.fillStyle = p.color || `rgba(255, 150, 0, ${p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
    ctx.fill();
  }
}



// Initial draw
ctx.fillStyle = '#444';
if(LEVELS[0]) {
  for (let obs of LEVELS[0].obstacles) ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(LEVELS[0].padX, LEVELS[0].padY, LEVELS[0].padW, LEVELS[0].padH);
}
drawShip();
