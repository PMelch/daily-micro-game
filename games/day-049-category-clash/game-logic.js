/**
 * Category Clash - Game Logic (pure, no DOM)
 * Pass & Play: players name items in a category, wrong/timeout = lose a life.
 */

export const CATEGORIES = {
  animals: {
    label: { de: 'Tiere', en: 'Animals', fr: 'Animaux', it: 'Animali', es: 'Animales' },
    answers: ['dog','cat','lion','tiger','elephant','giraffe','zebra','bear','wolf','fox',
      'rabbit','horse','cow','pig','sheep','goat','monkey','gorilla','chimpanzee','orangutan',
      'dolphin','whale','shark','salmon','tuna','octopus','crab','lobster','shrimp',
      'eagle','hawk','owl','parrot','penguin','flamingo','swan','duck','goose','peacock',
      'crocodile','alligator','snake','lizard','gecko','turtle','frog','toad','salamander',
      'ant','bee','butterfly','beetle','spider','scorpion','mosquito','fly','grasshopper',
      'hund','katze','löwe','tiger','elefant','giraffe','zebra','bär','wolf','fuchs',
      'kaninchen','pferd','kuh','schwein','schaf','ziege','affe','delfin','wal','hai',
      'adler','eule','papagei','pinguin','flamingo','schwan','ente','krokodil','schlange',
      'eidechse','schildkröte','frosch','ameise','biene','schmetterling','käfer','spinne',
      'chien','chat','lion','tigre','éléphant','girafe','zèbre','ours','loup','renard',
      'lapin','cheval','vache','cochon','mouton','chèvre','singe','dauphin','baleine','requin',
      'aigle','hibou','perroquet','manchot','flamant','cygne','canard','crocodile','serpent',
      'grenouille','araignée','papillon','abeille','fourmi',
      'cane','gatto','leone','tigre','elefante','giraffa','zebra','orso','lupo','volpe',
      'coniglio','cavallo','mucca','maiale','pecora','capra','scimmia','delfino','balena','squalo',
      'aquila','gufo','pappagallo','pinguino','fenicottero','cigno','anatra','coccodrillo','serpente',
      'rana','ragno','farfalla','ape','formica',
      'perro','gato','león','tigre','elefante','jirafa','cebra','oso','lobo','zorro',
      'conejo','caballo','vaca','cerdo','oveja','cabra','mono','delfín','ballena','tiburón',
      'águila','búho','loro','pingüino','flamenco','cisne','pato','cocodrilo','serpiente',
      'rana','araña','mariposa','abeja','hormiga'],
  },
  fruits: {
    label: { de: 'Früchte', en: 'Fruits', fr: 'Fruits', it: 'Frutta', es: 'Frutas' },
    answers: ['apple','banana','orange','grape','strawberry','blueberry','raspberry','blackberry',
      'cherry','peach','pear','plum','mango','pineapple','kiwi','watermelon','melon','cantaloupe',
      'lemon','lime','grapefruit','coconut','fig','date','pomegranate','apricot','nectarine',
      'papaya','guava','lychee','passion fruit','dragon fruit','starfruit','jackfruit','durian',
      'cranberry','gooseberry','currant','mulberry','persimmon','quince','kumquat','tangerine',
      'clementine','mandarin','avocado',
      'apfel','banane','orange','traube','erdbeere','heidelbeere','himbeere','brombeere',
      'kirsche','pfirsich','birne','pflaume','mango','ananas','kiwi','wassermelone','melone',
      'zitrone','limette','grapefruit','kokosnuss','feige','granatapfel','aprikose','nektarine',
      'papaya','guave','litschi','maracuja','drachenfrucht','avocado',
      'pomme','banane','orange','raisin','fraise','myrtille','framboise','mûre',
      'cerise','pêche','poire','prune','mangue','ananas','kiwi','pastèque','melon',
      'citron','citron vert','pamplemousse','noix de coco','figue','grenade','abricot','nectarine',
      'papaye','goyave','litchi','fruit de la passion','avocat',
      'mela','banana','arancia','uva','fragola','mirtillo','lampone','mora',
      'ciliegia','pesca','pera','prugna','mango','ananas','kiwi','anguria','melone',
      'limone','lime','pompelmo','cocco','fico','melagrana','albicocca','nettarina',
      'papaia','guava','litchi','frutto della passione','avocado',
      'manzana','plátano','naranja','uva','fresa','arándano','frambuesa','mora',
      'cereza','melocotón','pera','ciruela','mango','piña','kiwi','sandía','melón',
      'limón','lima','pomelo','coco','higo','granada','albaricoque','nectarina',
      'papaya','guayaba','lichi','maracuyá','aguacate'],
  },
  countries: {
    label: { de: 'Länder', en: 'Countries', fr: 'Pays', it: 'Paesi', es: 'Países' },
    answers: ['germany','france','italy','spain','portugal','austria','switzerland','belgium',
      'netherlands','denmark','sweden','norway','finland','poland','czech republic','hungary',
      'romania','bulgaria','greece','turkey','russia','ukraine','united kingdom','ireland',
      'united states','canada','mexico','brazil','argentina','chile','colombia','peru',
      'venezuela','ecuador','bolivia','paraguay','uruguay',
      'china','japan','south korea','india','pakistan','bangladesh','indonesia','philippines',
      'vietnam','thailand','malaysia','singapore','australia','new zealand',
      'egypt','nigeria','south africa','kenya','ethiopia','ghana','morocco','tanzania',
      'deutschland','frankreich','italien','spanien','portugal','österreich','schweiz','belgien',
      'niederlande','dänemark','schweden','norwegen','finnland','polen','ungarn','rumänien',
      'griechenland','türkei','russland','ukraine','vereinigtes königreich','irland',
      'vereinigte staaten','kanada','mexiko','brasilien','argentinien','chile','kolumbien',
      'china','japan','südkorea','indien','australien','neuseeland','ägypten','südafrika',
      'allemagne','france','italie','espagne','portugal','autriche','suisse','belgique',
      'pays-bas','danemark','suède','norvège','finlande','pologne','hongrie','roumanie',
      'grèce','turquie','russie','ukraine','royaume-uni','irlande',
      'états-unis','canada','mexique','brésil','argentine','chili','colombie',
      'chine','japon','corée du sud','inde','australie','nouvelle-zélande','égypte',
      'germania','francia','italia','spagna','portogallo','austria','svizzera','belgio',
      'paesi bassi','danimarca','svezia','norvegia','finlandia','polonia','ungheria','romania',
      'grecia','turchia','russia','ucraina','regno unito','irlanda',
      'stati uniti','canada','messico','brasile','argentina','cile','colombia',
      'cina','giappone','corea del sud','india','australia','nuova zelanda','egitto',
      'alemania','francia','italia','españa','portugal','austria','suiza','bélgica',
      'países bajos','dinamarca','suecia','noruega','finlandia','polonia','hungría','rumanía',
      'grecia','turquía','rusia','ucrania','reino unido','irlanda',
      'estados unidos','canada','méxico','brasil','argentina','chile','colombia',
      'china','japón','corea del sur','india','australia','nueva zelanda','egipto'],
  },
  sports: {
    label: { de: 'Sportarten', en: 'Sports', fr: 'Sports', it: 'Sport', es: 'Deportes' },
    answers: ['soccer','football','basketball','baseball','tennis','golf','swimming','cycling',
      'running','athletics','boxing','wrestling','judo','karate','taekwondo',
      'volleyball','handball','rugby','cricket','hockey','ice hockey','field hockey',
      'skiing','snowboarding','skating','figure skating','gymnastics','diving',
      'rowing','sailing','surfing','windsurfing','kitesurfing','canoeing','kayaking',
      'climbing','mountaineering','triathlon','marathon','sprint','hurdles',
      'long jump','high jump','pole vault','shot put','discus','javelin',
      'archery','fencing','shooting','equestrian','horse racing',
      'fußball','basketball','baseball','tennis','golf','schwimmen','radfahren',
      'laufen','leichtathletik','boxen','ringen','judo','karate','volleyball','handball',
      'rugby','cricket','hockey','eishockey','skifahren','snowboarden','schlittschuhlaufen',
      'turnen','tauchen','rudern','segeln','surfen','klettern','triathlon','marathon',
      'football','basketball','baseball','tennis','golf','natation','cyclisme','course',
      'athlétisme','boxe','lutte','judo','karaté','volleyball','handball','rugby','cricket',
      'hockey','hockey sur glace','ski','snowboard','patinage','gymnastique','plongée',
      'aviron','voile','surf','escalade','triathlon',
      'calcio','basket','baseball','tennis','golf','nuoto','ciclismo','corsa',
      'atletica','boxe','lotta','judo','karate','pallavolo','pallamano','rugby','cricket',
      'hockey','hockey su ghiaccio','sci','snowboard','pattinaggio','ginnastica','tuffi',
      'canottaggio','vela','surf','arrampicata','triathlon',
      'fútbol','baloncesto','béisbol','tenis','golf','natación','ciclismo','atletismo',
      'boxeo','lucha','judo','karate','voleibol','balonmano','rugby','cricket',
      'hockey','hockey sobre hielo','esquí','snowboard','patinaje','gimnasia','buceo',
      'remo','vela','surf','escalada','triatlón'],
  },
  cities: {
    label: { de: 'Städte', en: 'Cities', fr: 'Villes', it: 'Città', es: 'Ciudades' },
    answers: ['paris','london','berlin','rome','madrid','barcelona','vienna','amsterdam','brussels',
      'stockholm','oslo','copenhagen','helsinki','warsaw','prague','budapest','bucharest','athens',
      'istanbul','moscow','saint petersburg','kyiv','lisbon','zurich','geneva','munich','hamburg',
      'frankfurt','cologne','milan','naples','florence','venice','seville','valencia','bilbao',
      'new york','los angeles','chicago','houston','philadelphia','phoenix','dallas','san francisco',
      'seattle','boston','miami','toronto','montreal','vancouver','mexico city','sao paulo',
      'buenos aires','rio de janeiro','bogota','lima','santiago','caracas',
      'beijing','shanghai','tokyo','osaka','seoul','hong kong','singapore','bangkok','jakarta',
      'mumbai','delhi','karachi','dhaka','cairo','lagos','johannesburg','nairobi','casablanca',
      'sydney','melbourne','auckland','dubai','tehran','baghdad',
      'wien','münchen','hamburg','berlin','köln','frankfurt','stuttgart','düsseldorf',
      'zürich','genf','lissabon','neapel','mailand','florenz','venedig'],
  },
  colors: {
    label: { de: 'Farben', en: 'Colors', fr: 'Couleurs', it: 'Colori', es: 'Colores' },
    answers: ['red','blue','green','yellow','orange','purple','pink','brown','black','white','gray',
      'grey','violet','indigo','cyan','magenta','turquoise','lime','olive','maroon','navy',
      'teal','aqua','coral','salmon','crimson','scarlet','gold','silver','bronze','beige',
      'ivory','cream','lavender','lilac','mauve','rose','ruby','sapphire','emerald',
      'rot','blau','grün','gelb','orange','lila','violett','rosa','braun','schwarz','weiß',
      'grau','türkis','pink','navy','bordeaux','beige','elfenbein','lavendel','gold','silber',
      'rouge','bleu','vert','jaune','orange','violet','rose','brun','noir','blanc','gris',
      'turquoise','cyan','magenta','beige','ivoire','lavande','or','argent','bordeaux',
      'rosso','blu','verde','giallo','arancione','viola','rosa','marrone','nero','bianco',
      'grigio','turchese','ciano','magenta','avorio','lavanda','oro','argento',
      'rojo','azul','verde','amarillo','naranja','morado','rosa','marrón','negro','blanco',
      'gris','turquesa','cian','magenta','beige','marfil','lavanda','dorado','plateado','burdeos'],
  },
  foods: {
    label: { de: 'Gerichte / Speisen', en: 'Foods / Dishes', fr: 'Plats / Aliments', it: 'Cibi / Piatti', es: 'Comidas / Platos' },
    answers: ['pizza','pasta','burger','sushi','tacos','ramen','curry','steak','salad','sandwich',
      'soup','noodles','rice','bread','cheese','eggs','bacon','ham','chicken','beef','pork',
      'fish','shrimp','lobster','salmon','tuna','broccoli','carrot','potato','tomato','onion',
      'garlic','mushroom','pepper','spinach','lettuce','cucumber','celery','corn','peas',
      'beans','lentils','tofu','hummus','yogurt','butter','cream','milk','chocolate','cake',
      'cookie','pie','ice cream','waffle','pancake','cereal','oatmeal','granola',
      'paella','risotto','lasagna','moussaka','goulash','schnitzel','bratwurst','pretzel',
      'croissant','baguette','brie','camembert','fondue','pierogi','dumplings','gyoza',
      'pho','pad thai','bibimbap','baklava','falafel','shawarma','kebab','couscous',
      'pizza','pasta','burger','sushi','taco','ramen','curry','steak','salat','sandwich',
      'suppe','nudeln','reis','brot','käse','eier','speck','hähnchen','rindfleisch','schweinefleisch',
      'schnitzel','bratwurst','brezel','kartoffel','tomate','zwiebel','knoblauch',
      'pizza','pâtes','burger','sushi','tacos','ramen','curry','steak','salade','sandwich',
      'soupe','riz','pain','fromage','oeufs','poulet','boeuf','porc','poisson',
      'pizza','pasta','hamburger','sushi','tacos','ramen','curry','bistecca','insalata',
      'panino','zuppa','riso','pane','formaggio','uova','pollo','manzo','maiale','pesce',
      'pizza','pasta','hamburger','sushi','tacos','ramen','curry','bistec','ensalada',
      'sándwich','sopa','arroz','pan','queso','huevos','pollo','ternera','cerdo','pescado'],
  },
  instruments: {
    label: { de: 'Musikinstrumente', en: 'Musical Instruments', fr: 'Instruments de Musique', it: 'Strumenti Musicali', es: 'Instrumentos Musicales' },
    answers: ['piano','guitar','violin','cello','viola','bass','drums','trumpet','trombone',
      'saxophone','clarinet','flute','oboe','bassoon','harp','accordion','banjo','mandolin',
      'ukulele','sitar','tabla','didgeridoo','bagpipes','harmonica','tuba','french horn',
      'xylophone','marimba','vibraphone','timpani','snare drum','bass drum','cymbals',
      'electric guitar','acoustic guitar','bass guitar','keyboard','synthesizer','organ',
      'harpsichord','lute','dulcimer','zither','balalaika','bouzouki','oud','erhu',
      'klavier','gitarre','geige','cello','viola','kontrabass','schlagzeug','trompete',
      'posaune','saxophon','klarinette','flöte','oboe','fagott','harfe','akkordeon',
      'banjo','mandoline','ukulele','triangel','tamburin','maracas','tuba','horn',
      'piano','guitare','violon','violoncelle','alto','contrebasse','batterie','trompette',
      'trombone','saxophone','clarinette','flûte','hautbois','basson','harpe','accordéon',
      'banjo','mandoline','ukulélé','harmonica','tuba','cor','xylophone',
      'pianoforte','chitarra','violino','violoncello','viola','contrabbasso','batteria',
      'tromba','trombone','sassofono','clarinetto','flauto','oboe','fagotto','arpa',
      'fisarmonica','banjo','mandolino','ukulele','armonica','tuba','corno',
      'piano','guitarra','violín','violonchelo','viola','contrabajo','batería','trompeta',
      'trombón','saxofón','clarinete','flauta','oboe','fagot','arpa','acordeón',
      'banjo','mandolina','ukulele','armónica','tuba','trompa','xilófono'],
  },
  elements: {
    label: { de: 'Elemente (Chemie)', en: 'Chemical Elements', fr: 'Éléments Chimiques', it: 'Elementi Chimici', es: 'Elementos Químicos' },
    answers: ['hydrogen','helium','lithium','beryllium','boron','carbon','nitrogen','oxygen',
      'fluorine','neon','sodium','magnesium','aluminum','silicon','phosphorus','sulfur',
      'chlorine','argon','potassium','calcium','iron','copper','zinc','silver','gold',
      'mercury','lead','tin','nickel','cobalt','chromium','manganese','titanium','platinum',
      'uranium','plutonium','radium','radon','xenon','krypton','iodine','bromine',
      'wasserstoff','helium','lithium','beryllium','bor','kohlenstoff','stickstoff','sauerstoff',
      'fluor','neon','natrium','magnesium','aluminium','silizium','phosphor','schwefel',
      'chlor','argon','kalium','kalzium','eisen','kupfer','zink','silber','gold',
      'quecksilber','blei','zinn','nickel','kobalt','chrom','mangan','titan','platin',
      'hydrogène','hélium','lithium','béryllium','bore','carbone','azote','oxygène',
      'fluor','néon','sodium','magnésium','aluminium','silicium','phosphore','soufre',
      'chlore','argon','potassium','calcium','fer','cuivre','zinc','argent','or',
      'mercure','plomb','étain','nickel','cobalt','chrome','manganèse','titane','platine',
      'idrogeno','elio','litio','berillio','boro','carbonio','azoto','ossigeno',
      'fluoro','neon','sodio','magnesio','alluminio','silicio','fosforo','zolfo',
      'cloro','argon','potassio','calcio','ferro','rame','zinco','argento','oro',
      'mercurio','piombo','stagno','nichel','cobalto','cromo','manganese','titanio','platino',
      'hidrógeno','helio','litio','berilio','boro','carbono','nitrógeno','oxígeno',
      'flúor','neón','sodio','magnesio','aluminio','silicio','fósforo','azufre',
      'cloro','argón','potasio','calcio','hierro','cobre','zinc','plata','oro',
      'mercurio','plomo','estaño','níquel','cobalto','cromo','manganeso','titanio','platino'],
  },
  movies: {
    label: { de: 'Filmtitel', en: 'Movie Titles', fr: 'Titres de Films', it: 'Titoli di Film', es: 'Títulos de Películas' },
    answers: ['titanic','avatar','inception','interstellar','gladiator','braveheart','alien','aliens',
      'predator','terminator','matrix','jurassic park','star wars','the godfather','schindler\'s list',
      'forrest gump','fight club','pulp fiction','goodfellas','the silence of the lambs',
      'the dark knight','batman','superman','spiderman','ironman','avengers','thor','hulk',
      'the lion king','frozen','toy story','finding nemo','up','wall-e','ratatouille',
      'shrek','cars','coco','moana','zootopia','tangled','brave','inside out',
      'jaws','et','back to the future','raiders of the lost ark','indiana jones',
      'home alone','kevin','die hard','speed','heat','leon','gravity','the martian',
      'blade runner','total recall','robocop','demolition man','the rock','con air',
      'titanic','avatar','inception','interstellar','gladiator','der pate','schindlers liste',
      'kampf der welten','der herr der ringe','harry potter','star wars','batman','superman',
      'der könig der löwen','findet nemo','oben','küss den frosch','ratatouille',
      'titanic','avatar','inception','interstellaire','gladiateur','le parrain','la liste de schindler',
      'le roi lion','le seigneur des anneaux','harry potter','la guerre des étoiles',
      'titanic','avatar','inception','interstellar','gladiatore','il padrino','la lista di schindler',
      'il re leone','il signore degli anelli','harry potter','guerre stellari',
      'titanic','avatar','inception','interstellar','gladiador','el padrino','la lista de schindler',
      'el rey león','el señor de los anillos','harry potter','la guerra de las galaxias'],
  },
  brands: {
    label: { de: 'Marken', en: 'Brands', fr: 'Marques', it: 'Marchi', es: 'Marcas' },
    answers: ['apple','google','microsoft','amazon','facebook','meta','twitter','instagram',
      'netflix','spotify','youtube','whatsapp','tiktok','snapchat','linkedin',
      'samsung','sony','lg','philips','panasonic','canon','nikon','fujifilm',
      'nike','adidas','puma','reebok','new balance','under armour','asics',
      'coca cola','pepsi','mcdonalds','burger king','kfc','subway','starbucks',
      'tesla','volkswagen','bmw','mercedes','audi','porsche','ford','toyota','honda',
      'ferrari','lamborghini','maserati','bentley','rolls royce','jaguar','land rover',
      'ikea','zara','h&m','primark','levi\'s','gap','ralph lauren','gucci','prada',
      'louis vuitton','chanel','dior','hermès','rolex','omega','cartier',
      'lego','hasbro','mattel','nintendo','playstation','xbox','steam',
      'visa','mastercard','paypal','airbnb','uber','lyft','booking','expedia'],
  },
  planets: {
    label: { de: 'Planeten & Himmelskörper', en: 'Planets & Celestial Bodies', fr: 'Planètes & Corps Célestes', it: 'Pianeti & Corpi Celesti', es: 'Planetas & Cuerpos Celestes' },
    answers: ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','pluto',
      'moon','sun','titan','europa','ganymede','callisto','io','enceladus','triton',
      'ceres','eris','makemake','haumea','sedna',
      'milky way','andromeda','orion','cassiopeia','sirius','betelgeuse','rigel','polaris',
      'alpha centauri','proxima centauri','vega','arcturus','capella','deneb',
      'merkur','venus','erde','mars','jupiter','saturn','uranus','neptun','pluto','mond','sonne',
      'mercure','vénus','terre','mars','jupiter','saturne','uranus','neptune','pluton','lune','soleil',
      'mercurio','venere','terra','marte','giove','saturno','urano','nettuno','plutone','luna','sole',
      'mercurio','venus','tierra','marte','júpiter','saturno','urano','neptuno','plutón','luna','sol'],
  },
  professions: {
    label: { de: 'Berufe', en: 'Professions', fr: 'Professions', it: 'Professioni', es: 'Profesiones' },
    answers: ['doctor','nurse','teacher','engineer','lawyer','accountant','architect','dentist',
      'pharmacist','veterinarian','pilot','firefighter','police officer','paramedic','surgeon',
      'programmer','software engineer','designer','artist','musician','actor','writer','journalist',
      'photographer','filmmaker','chef','baker','butcher','waiter','bartender',
      'plumber','electrician','mechanic','carpenter','painter','tailor','shoemaker',
      'farmer','fisherman','miner','lumberjack','gardener','florist',
      'banker','economist','scientist','biologist','chemist','physicist','mathematician',
      'psychologist','therapist','social worker','librarian','secretary',
      'arzt','ärztin','krankenschwester','lehrer','ingenieur','rechtsanwalt','buchhalter',
      'architekt','zahnarzt','apotheker','tierarzt','pilot','feuerwehrmann','polizist',
      'programmierer','designer','künstler','musiker','schauspieler','schriftsteller','journalist',
      'köchin','bäcker','elektriker','mechaniker','zimmermann','bauer','gärtner','banker',
      'médecin','infirmière','professeur','ingénieur','avocat','comptable','architecte',
      'dentiste','pharmacien','vétérinaire','pilote','pompier','policier',
      'programmeur','designer','artiste','musicien','acteur','écrivain','journaliste',
      'chef','boulanger','électricien','mécanicien','charpentier','agriculteur','jardinier',
      'medico','infermiera','insegnante','ingegnere','avvocato','contabile','architetto',
      'dentista','farmacista','veterinario','pilota','pompiere','poliziotto',
      'programmatore','designer','artista','musicista','attore','scrittore','giornalista',
      'cuoco','panettiere','elettricista','meccanico','falegname','agricoltore','giardiniere',
      'médico','enfermera','profesor','ingeniero','abogado','contador','arquitecto',
      'dentista','farmacéutico','veterinario','piloto','bombero','policía',
      'programador','diseñador','artista','músico','actor','escritor','periodista',
      'cocinero','panadero','electricista','mecánico','carpintero','agricultor','jardinero'],
  },
};

// ─── PURE GAME FUNCTIONS ──────────────────────────────────────────────────────

export function generateCategory(excludeKeys = []) {
  const keys = Object.keys(CATEGORIES).filter(k => !excludeKeys.includes(k));
  if (keys.length === 0) return Object.keys(CATEGORIES)[Math.floor(Math.random() * Object.keys(CATEGORIES).length)];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function createGameState(playerNames) {
  return {
    phase: 'setup',
    players: playerNames.map(name => ({ name, lives: 3, score: 0 })),
    activePlayerIndex: 0,
    currentCategory: null,
    usedAnswers: [],
    usedCategories: [],
    turnStartTime: 0,
    lastAnswer: null,
    round: 1,
  };
}

export function startGame(state) {
  const catKey = generateCategory(state.usedCategories);
  return {
    ...state,
    phase: 'playing',
    currentCategory: catKey,
    usedAnswers: [],
    turnStartTime: Date.now(),
    lastAnswer: null,
  };
}

export function checkAnswer(answer, categoryKey, usedAnswers) {
  if (!answer || !answer.trim()) return false;
  const normalized = answer.trim().toLowerCase();
  if (usedAnswers.includes(normalized)) return false;
  const cat = CATEGORIES[categoryKey];
  if (!cat) return false;
  return cat.answers.some(a => a.toLowerCase() === normalized);
}

export function submitAnswer(state, answer, isTimeout = false) {
  if (isTimeout || !checkAnswer(answer, state.currentCategory, state.usedAnswers)) {
    // Wrong or timeout — lose a life
    const players = state.players.map((p, i) =>
      i === state.activePlayerIndex ? { ...p, lives: Math.max(0, p.lives - 1) } : p
    );
    return {
      correct: false,
      state: {
        ...state,
        players,
        phase: 'show-result',
        lastAnswer: null,
      },
    };
  }

  // Correct answer
  const normalized = answer.trim().toLowerCase();
  const players = state.players.map((p, i) =>
    i === state.activePlayerIndex ? { ...p, score: p.score + 1 } : p
  );
  return {
    correct: true,
    state: {
      ...state,
      players,
      usedAnswers: [...state.usedAnswers, normalized],
      lastAnswer: normalized,
      phase: 'pass-device',
    },
  };
}

export function nextTurn(state) {
  const totalPlayers = state.players.length;
  let next = (state.activePlayerIndex + 1) % totalPlayers;
  // Skip eliminated players
  let tries = 0;
  while (state.players[next].lives === 0 && tries < totalPlayers) {
    next = (next + 1) % totalPlayers;
    tries++;
  }
  return {
    ...state,
    activePlayerIndex: next,
    phase: 'playing',
    turnStartTime: Date.now(),
    lastAnswer: null,
  };
}

export function isGameOver(state) {
  const alive = state.players.filter(p => p.lives > 0);
  return alive.length <= 1;
}

export function getWinner(state) {
  const alive = state.players.filter(p => p.lives > 0);
  if (alive.length === 1) return alive[0];
  if (alive.length === 0) return state.players.reduce((best, p) => (!best || p.score > best.score ? p : best), null);
  return alive.reduce((best, p) => (!best || p.lives > best.lives || (p.lives === best.lives && p.score > best.score) ? p : best), null);
}
