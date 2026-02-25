// WordBomb - Game Logic Module
// Vanilla JS, no dependencies

// ───────────────────────────────────────────────
// Word List (common English words, 3+ letters)
// ───────────────────────────────────────────────
const WORD_LIST = [
  'ace','act','add','age','ago','aid','aim','air','all','ant','ape','apt','arc','are','ark','arm','art','ash','ask',
  'ate','awe','axe','aye','bad','bag','ban','bar','bat','bay','bed','beg','bet','bid','big','bit','bog','bow','box',
  'boy','bud','bug','bun','bus','but','buy','cab','can','cap','car','cat','cob','cod','cog','cop','cow','cry','cub',
  'cup','cut','dab','dam','day','den','dew','did','dig','dim','dip','doe','dog','dot','dry','dug','ear','eat','egg',
  'ego','elk','elm','emu','end','era','eve','ewe','eye','fad','fan','far','fat','few','fib','fig','fin','fit','fix',
  'fly','fog','for','fox','fry','fun','fur','gag','gap','gas','gel','gem','get','gig','gnu','god','got','gum','gun',
  'gut','guy','gym','had','ham','hat','hay','hen','her','him','hip','his','hit','hog','hop','hot','how','hub','hug',
  'hum','hut','ice','ill','imp','ink','inn','ion','ire','irk','ivy','jab','jam','jar','jaw','jet','jig','job','jog',
  'joy','jug','key','kid','kit','lab','lag','lap','law','lay','led','leg','let','lid','lip','lit','log','lot','low',
  'mad','map','mat','maw','may','mob','mod','mop','mud','mug','nag','nap','nod','nor','not','nun','oak','oar','odd',
  'ode','off','oil','old','opt','orb','ore','our','out','owe','own','pad','pan','pat','pay','pea','peg','pen','per',
  'pet','pie','pig','pin','pit','ply','pod','pop','pot','pow','pro','pub','pun','pup','put','raw','ray','red','ref',
  'rep','rib','rid','rig','rip','rob','rod','rug','rum','run','rut','sad','sag','sap','sat','saw','say','sea','set',
  'sew','she','shy','sin','sip','sir','sit','six','ski','sky','sly','sob','sod','son','sow','soy','spa','spy','sty',
  'sub','sum','sun','tab','tan','tap','tar','tax','tea','the','thy','tie','tin','tip','toe','ton','too','top','toy',
  'try','tub','tug','two','urn','use','van','vat','vow','war','was','wax','web','wed','wet','who','why','wig','win',
  'wit','woe','wok','won','woo','wow','yak','yam','yap','yaw','yew','you','zap','zen','zig','zip','zoo',
  // 4-letter words
  'able','ably','ache','acid','acme','acre','acts','adds','aero','afar','aged','ages','agog','ague','aide','aids',
  'aims','airs','airy','also','alto','amok','amps','ante','arch','area','arms','army','arts','arty','ashy','atom',
  'atop','aunt','auto','avid','away','awed','axes','axle','back','bail','bait','bale','ball','band','bane','bang',
  'bank','bare','bark','barn','base','bash','bask','bass','bath','bead','beak','beam','bean','bear','beat','beck',
  'beef','been','beep','beer','beet','bell','belt','bend','bent','beta','bile','bill','bind','bite','blah','blow',
  'blue','blur','boar','boat','body','boil','bold','bolt','bond','bone','book','boom','boot','bore','born','boss',
  'both','bout','brag','brew','brim','brow','buff','bulb','bulk','bull','bump','bunk','burn','burp','buzz','byte',
  'cafe','cage','cake','calf','call','calm','came','cane','cape','care','carp','cart','case','cash','cast','cave',
  'cell','cent','chap','char','chat','chef','chew','chin','chip','chop','clad','clam','clap','claw','clay','clip',
  'club','clue','coal','coat','coil','coin','cold','colt','come','cook','cool','cope','cord','core','cork','corn',
  'cost','cozy','crab','crew','crop','crow','cube','cure','curl','dace','dare','dark','dart','dash','data','date',
  'dawn','dead','deaf','deal','dean','dear','deck','deed','deep','deer','deft','dell','dent','desk','dial','dice',
  'died','diet','dire','dirt','disc','dish','disk','dive','dock','dole','dome','done','doom','door','dose','dove',
  'down','doze','drab','drag','draw','drew','drip','drop','drum','dual','dude','dune','dunk','dusk','dust','duty',
  'each','earl','earn','ease','east','easy','edge','emit','epic','even','ever','evil','exam','exit','eyes','face',
  'fact','fade','fail','fain','fair','fake','fall','fame','farm','fast','fate','fawn','faze','fear','feat','feed',
  'feel','feet','fell','felt','fend','fern','fete','feud','file','fill','film','find','fine','fire','firm','fish',
  'fist','flag','flaw','flea','fled','flee','flew','flex','flip','flit','flog','flow','foam','fogy','fold','fond',
  'font','food','fool','foot','fore','fork','form','fort','foul','four','free','from','fuel','full','fume','furl',
  'fuse','gale','gall','game','gash','gate','gave','gaze','gear','germ','gibe','gift','gilt','gist','give','glad',
  'glee','glib','glob','glow','glue','glum','gnat','gnaw','goal','goat','gold','golf','good','gosh','gown','grab',
  'gray','grew','grey','grid','grim','grin','grip','grit','grow','grub','gulf','gull','gulp','gust','guts','guys',
  'hack','hail','hair','half','hall','halo','halt','hang','hard','hare','harm','harp','hash','hate','haul','have',
  'hawk','haze','hazy','head','heal','heap','hear','heat','heel','heed','helm','help','here','hero','hike','hill',
  'hint','hold','hole','holy','home','honk','hook','hope','horn','host','hour','howl','hull','hump','hung','hunt',
  'hurl','hymn','ibis','icon','idea','idle','idly','inch','into','isle','item','jail','jerk','jest','jibs','jolt',
  'junk','just','keen','keep','kelp','kite','knee','knit','knob','knot','know','lace','lack','lake','lamb','lame',
  'land','lane','lard','lark','lash','last','late','laud','lawn','lead','leaf','leak','lean','leap','lend','lens',
  'lick','lift','like','lime','limp','line','linger','link','lion','list','live','load','loam','loan','loaf','lock',
  'loft','lone','long','loom','loon','loop','lore','lore','lorn','lore','lose','lost','love','luck','lull','lump',
  'lung','lure','lurk','lush','lust','made','maid','mail','main','make','male','mall','malt','mane','many','mark',
  'mart','mast','mate','math','maze','mead','meal','mean','meat','meet','meld','melt','memo','menu','mere','mesh',
  'mild','mile','milk','mill','mime','mind','mine','mint','miss','mist','moat','mode','mold','mole','molt','monk',
  'mood','moon','moor','more','most','moth','move','much','mule','mull','must','myth','nail','name','nary','near',
  'neat','neck','need','nerd','nest','next','nice','nine','node','none','noon','norm','note','nova','numb','oath',
  'obey','once','only','open','orca','over','pace','pack','page','paid','pail','pain','pair','pale','palm','pang',
  'park','part','pass','past','path','peak','peal','pear','peer','peel','pelt','pest','pick','pike','pile','pill',
  'pine','ping','pink','pint','pipe','plan','play','plod','plot','plow','ploy','plum','plus','poem','poet','pole','poll',
  'pond','pool','poor','pore','pork','port','pose','post','pour','pray','prep','prey','prim','prod','prop','pull',
  'pump','punk','pure','push','quit','quiz','race','rack','rage','raid','rail','rain','rake','ramp','rang','rank',
  'rape','rare','rash','rate','read','real','reap','rear','reed','reel','rely','rend','rent','rest','rice','rich',
  'rick','ride','rife','ring','riot','rise','risk','road','roam','roar','roast','robe','rock','role','roll','roof',
  'room','root','rope','rose','rout','rove','ruby','rude','ruin','rule','ruse','rush','rust','safe','sage','sail',
  'sake','sale','salt','same','sand','sane','sang','sank','sari','save','seam','sear','seat','seed','seek','seem',
  'seep','send','sent','shed','ship','shoe','shop','shot','show','sick','side','sigh','sign','silk','sill','silo',
  'silt','sing','sink','site','size','skew','skip','slam','slap','sled','slew','slim','slip','slit','slob','slop',
  'slot','slow','slug','slum','slur','smug','snag','snap','snip','snob','snow','soak','soap','soar','sock','soft',
  'soil','sole','some','song','soon','soot','sort','soul','soup','sour','span','spar','spat','spin','spit','spot',
  'spud','spur','stab','star','stay','stem','step','stew','stir','stop','stow','stub','stud','stun','such','suit',
  'sulk','sung','sunk','sure','surf','swim','tail','tale','tall','tame','tang','tape','task','tell','tend','tent',
  'term','test','than','that','them','then','they','thin','this','thus','tick','tide','tilt','time','tiny','tire',
  'toad','told','toll','tomb','tome','tone','took','tore','torn','toss','tour','town','trim','trio','trip','trod',
  'true','tube','tuck','tune','turf','turn','tusk','tutu','type','ugly','undo','unit','unto','upon','used','user',
  'vain','vale','vast','veal','veer','veil','vein','vend','vest','veto','vibe','view','vine','vise','void','volt',
  'wade','wage','wail','wait','wake','walk','wall','wand','want','ward','warm','warn','wart','wave','weak','weal',
  'wean','weld','well','welt','were','west','when','whim','whip','whiz','wide','wife','wild','will','wily','wimp',
  'wind','wine','wing','wire','wise','wish','with','woke','wolf','womb','wood','word','wore','worm','wren','yell',
  'yoga','yore','your','zero','zest','zone',
  // 5+ letter common words
  'about','above','abuse','actor','acute','admit','adobe','adult','after','again','agree','ahead','alarm','album',
  'alert','alike','alien','align','alive','alley','allow','alone','along','alter','angel','angry','anime','ankle',
  'annoy','apart','apple','apply','apron','arena','argue','arise','arrow','aside','asked','asset','atlas','attic',
  'audio','audit','awful','basic','basis','batch','beach','beard','beast','began','begin','being','below','bench',
  'berry','birth','black','blade','bland','blank','blast','blaze','blend','bless','blind','block','blood','bloom',
  'board','bonus','booze','bored','brain','brand','brave','bread','break','bride','brief','bring','broad','broke',
  'brook','brown','brush','build','built','burst','cabin','camel','candy','carry','cause','cedar','chain','chair',
  'chaos','chase','cheap','check','cheek','cheer','chess','chest','chick','chief','child','china','chord','chose',
  'chunk','civic','civil','claim','class','clean','clear','clerk','click','cliff','climb','clock','clone','close',
  'cloth','cloud','coach','coast','comet','comma','comic','coral','could','count','court','cover','crack','craft',
  'crane','crash','crazy','creed','creek','crime','crisp','cross','crowd','crown','cruel','crumb','curve','cycle',
  'daily','dance','dandy','daisy','decay','dense','depot','depth','diary','digit','dirty','disco','dizzy','dodge',
  'doing','doubt','dough','draft','drain','drank','drawn','dream','dried','drink','drive','drown','drunk','dryer',
  'dunno','dwarf','dying','eager','eagle','early','earth','eight','elite','email','empty','enemy','enjoy','enter',
  'entry','equal','error','essay','event','every','exact','exist','extra','fable','faint','faith','fancy','fatal',
  'fault','feast','fence','fever','fiber','fifth','fifty','fight','final','fixed','flame','flash','flask','flesh',
  'float','flock','floor','flora','floss','flour','fluid','flush','focus','force','forge','forge','found','frame',
  'frank','fraud','fresh','front','frost','frown','froze','fruit','funny','fuzzy','giant','given','gland','glass',
  'gloss','glove','grace','grade','grain','grand','grant','grape','grass','grate','grave','graze','great','greed',
  'green','greet','grief','grill','groan','grope','gross','group','grove','gruel','guard','guest','guide','guilt',
  'guise','gusto','haste','heart','heavy','hedge','hello','hence','herby','herbs','heron','hiked','hinge','hippo',
  'hoard','holly','honor','horse','hotel','house','human','hurry','hyper','ideal','image','imply','inbox','incur',
  'index','indie','infer','inner','input','inter','intro','irony','issue','ivory','jaunt','jazzy','jelly','jewel',
  'jiffy','joker','joust','juice','juicy','jumbo','jumpy','karma','kitty','knack','kneel','knife','knock','known',
  'label','lance','large','laser','later','laugh','layer','learn','lease','least','leave','ledge','legal','lemon',
  'level','light','limit','linen','liner','liver','local','lodge','logic','loose','lover','lower','lucky','lumpy',
  'lunch','lyric','magic','major','maker','manor','maple','match','mayor','merge','merit','merry','metal','might',
  'minor','minus','mirth','miser','misty','model','money','month','motor','mount','mouse','mouth','movie','muddy',
  'music','naive','nasty','naval','nerve','never','night','ninja','noise','north','notch','novel','nurse','occur',
  'ocean','offer','onset','orbit','order','other','ought','outer','oxide','ozone','paint','panic','paper','party',
  'patch','pause','peace','peach','penal','penny','perch','phase','phone','photo','piano','pixel','pizza','place',
  'plain','plait','plane','plant','plate','plaza','plead','pluck','plume','plunge','point','polar','polio','poppy',
  'posed','pouch','power','press','price','pride','prime','print','prior','prize','probe','proof','prose','proud',
  'prove','psalm','pulpy','punch','pupil','purse','queen','query','quest','queue','quick','quiet','quota','quote',
  'radar','radio','raise','rally','ranch','range','rapid','ratio','reach','react','ready','realm','rebel','reign',
  'relax','reply','rider','ridge','rifle','right','risky','rival','river','robin','robot','rocky','rouge','rough',
  'round','route','rowdy','royal','rugby','ruler','rural','sadly','saint','salad','sauce','scale','scene','scone',
  'scope','score','scout','screw','seize','sense','serve','seven','shade','shaft','shake','shall','shame','shape',
  'share','shark','sharp','sheer','sheet','shelf','shell','shift','shine','shirt','shock','shore','short','shout',
  'shrug','shuck','shyly','siege','sigma','silly','since','sixth','sixty','skate','skill','skull','slash','slate',
  'sleek','sleep','sleet','sleek','slice','slide','slope','sloth','smart','smell','smile','smite','smoke','snail',
  'snake','solar','solid','solve','sorry','sound','south','space','spare','spark','spawn','speak','speed','spend',
  'spice','spike','spine','spoke','spoon','spray','squad','stack','staff','stage','stain','stale','stand','stark',
  'start','state','steal','steam','steel','steer','stick','stiff','still','stock','stood','store','storm','story',
  'stout','stove','strap','straw','stray','strip','strut','style','sugar','super','surge','swamp','swarm','swear',
  'sweep','sweet','swept','swirl','sword','swore','swung','table','taboo','talon','taste','teach','tense','their',
  'there','these','third','those','three','threw','throw','thumb','tiger','tight','timer','tired','title','today',
  'token','torch','total','touch','tough','towel','tower','toxic','track','trade','trail','train','trait','tread',
  'treat','trend','trial','tribe','trick','tried','troop','trout','truck','truly','trump','trunk','trust','truth',
  'tumor','tuner','tweak','twice','twist','tying','uneasy','unfit','union','unity','until','upper','upset','urban',
  'usual','utter','valid','value','valve','venom','verse','video','vigor','viola','viral','visor','visit','vital',
  'vivid','vocal','voice','vomit','voter','vowed','vowel','waist','waste','watch','water','wedge','weird','weary',
  'weigh','wheat','wheel','where','which','while','white','whole','whose','wider','witch','woman','women','world',
  'worry','worse','worst','worth','would','wound','wrath','write','wrote','yacht','yearn','yield','young','youth',
  'zonal','zippy'
];

export const WORDS = new Set(WORD_LIST.map(w => w.toLowerCase()));

// ───────────────────────────────────────────────
// Word Checking
// ───────────────────────────────────────────────

/**
 * Returns true if the fragment is an exact word in the dictionary (min 3 letters)
 */
export function isCompleteWord(fragment) {
  if (!fragment || fragment.length < 3) return false;
  return WORDS.has(fragment.toLowerCase());
}

/**
 * Returns true if any word in the dictionary starts with this fragment
 */
export function canFragmentContinue(fragment) {
  if (!fragment) return true;
  const lower = fragment.toLowerCase();
  for (const word of WORDS) {
    if (word.startsWith(lower)) return true;
  }
  return false;
}

// ───────────────────────────────────────────────
// Game State Management
// ───────────────────────────────────────────────

/**
 * Initialize a new game with 2-4 players.
 * @param {string[]} playerNames - array of player names (2-4)
 * @returns {GameState}
 */
export function initGame(playerNames) {
  if (!Array.isArray(playerNames) || playerNames.length < 2) {
    throw new Error('WordBomb requires at least 2 players');
  }
  if (playerNames.length > 4) {
    throw new Error('WordBomb supports at most 4 players');
  }

  return {
    phase: 'playing',       // 'playing' | 'boom' | 'challenge' | 'gameover'
    players: playerNames.map((name, i) => ({
      id: i,
      name,
      lives: 3,
      eliminated: false,
    })),
    fragment: '',
    activePlayerIndex: 0,
    boomPlayer: null,       // index of player who triggered boom
    boomReason: null,       // 'word' | 'timer'
    challengerIndex: null,
    challengedIndex: null,
    lastBoomPlayerIndex: null, // who just got boomed (for turn logic after boom)
  };
}

/**
 * Add a letter to the fragment. Returns new state.
 * - If the new fragment completes a dictionary word (3+ letters): phase → 'boom'
 * - Otherwise: advance turn
 */
export function addLetter(state, letter) {
  const l = letter.toLowerCase();
  const newFragment = state.fragment + l;
  const currentIndex = state.activePlayerIndex;

  if (isCompleteWord(newFragment)) {
    return {
      ...state,
      fragment: newFragment,
      phase: 'boom',
      boomPlayer: currentIndex,
      boomReason: 'word',
    };
  }

  // Advance to next player
  const next = nextTurn(state, currentIndex);
  return {
    ...next,
    fragment: newFragment,
  };
}

/**
 * Apply the boom penalty: current boomPlayer loses a life, fragment resets, advance turn.
 */
export function applyBoom(state) {
  const boomIdx = state.boomPlayer;
  const newPlayers = state.players.map((p, i) => {
    if (i !== boomIdx) return p;
    const newLives = p.lives - 1;
    return { ...p, lives: newLives, eliminated: newLives <= 0 };
  });

  const tempState = {
    ...state,
    players: newPlayers,
    phase: 'playing',
    fragment: '',
    boomPlayer: null,
    boomReason: null,
  };

  // Advance turn from boomIdx
  return nextTurn(tempState, boomIdx);
}

/**
 * Advance to the next non-eliminated player.
 */
export function nextTurn(state, fromIndex) {
  const count = state.players.length;
  let next = (fromIndex + 1) % count;
  let safety = 0;
  while (state.players[next].eliminated && safety < count) {
    next = (next + 1) % count;
    safety++;
  }
  return { ...state, activePlayerIndex: next };
}

/**
 * Start a challenge. The current active player (challenger) challenges
 * the previous player (challenged) to reveal their intended word.
 */
export function startChallenge(state) {
  const challengerIndex = state.activePlayerIndex;
  // Find the previous non-eliminated player
  const count = state.players.length;
  let prev = (challengerIndex - 1 + count) % count;
  let safety = 0;
  while (state.players[prev].eliminated && safety < count) {
    prev = (prev - 1 + count) % count;
    safety++;
  }
  return {
    ...state,
    phase: 'challenge',
    challengerIndex,
    challengedIndex: prev,
  };
}

/**
 * Resolve a challenge.
 * @param {GameState} state
 * @param {string} word - word offered by challenged player
 * @param {boolean} isValid - whether the word is accepted (starts with fragment, in dict or honor system)
 * @returns {GameState}
 */
export function resolveChallenge(state, word, isValid) {
  // If challenged provides valid word → challenger loses a life
  // If not → challenged loses a life
  const loserIndex = isValid ? state.challengerIndex : state.challengedIndex;

  const newPlayers = state.players.map((p, i) => {
    if (i !== loserIndex) return p;
    const newLives = p.lives - 1;
    return { ...p, lives: newLives, eliminated: newLives <= 0 };
  });

  const tempState = {
    ...state,
    players: newPlayers,
    phase: 'playing',
    fragment: '',
    challengerIndex: null,
    challengedIndex: null,
  };

  // Turn goes to the player after the challenged player
  return nextTurn(tempState, state.challengedIndex);
}

// ───────────────────────────────────────────────
// Utility
// ───────────────────────────────────────────────

export function isEliminated(player) {
  return player.lives <= 0;
}

export function getActivePlayers(state) {
  return state.players.filter(p => !p.eliminated);
}

export function getWinner(state) {
  const active = getActivePlayers(state);
  return active.length === 1 ? active[0] : null;
}
