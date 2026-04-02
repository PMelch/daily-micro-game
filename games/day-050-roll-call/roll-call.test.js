// Roll Call - TDD Tests
// Test the die rotation logic and gate system

// Standard die: opposite faces sum to 7
// Top=1, Bottom=6, Front=2, Back=5, Right=3, Left=4
// (standard Western die orientation)

class Die {
  constructor() {
    // [top, bottom, front, back, right, left]
    this.faces = [1, 6, 2, 5, 3, 4];
  }

  get top()    { return this.faces[0]; }
  get bottom() { return this.faces[1]; }
  get front()  { return this.faces[2]; }
  get back()   { return this.faces[3]; }
  get right()  { return this.faces[4]; }
  get left()   { return this.faces[5]; }

  rollRight() {
    const [t, b, f, bk, r, l] = this.faces;
    // Rolling right: top->right, right->bottom, bottom->left, left->top
    this.faces = [l, r, f, bk, t, b];
    return this;
  }

  rollLeft() {
    const [t, b, f, bk, r, l] = this.faces;
    // Rolling left: top->left, left->bottom, bottom->right, right->top
    this.faces = [r, l, f, bk, b, t];
    return this;
  }

  rollUp() {
    const [t, b, f, bk, r, l] = this.faces;
    // Rolling up (north): top->back, back->bottom, bottom->front, front->top
    this.faces = [f, bk, b, t, r, l];
    return this;
  }

  rollDown() {
    const [t, b, f, bk, r, l] = this.faces;
    // Rolling down (south): top->front, front->bottom, bottom->back, back->top
    this.faces = [bk, f, t, b, r, l];
    return this;
  }

  clone() {
    const d = new Die();
    d.faces = [...this.faces];
    return d;
  }
}

// ---- Tests ----
let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ ${name}`);
    failed++;
  }
}

console.log('\n🎲 Roll Call - Test Suite\n');

// Test 1: Initial die state
{
  console.log('[ Die Initial State ]');
  const die = new Die();
  assert(die.top === 1, 'Top face starts at 1');
  assert(die.bottom === 6, 'Bottom face starts at 6');
  assert(die.front === 2, 'Front face starts at 2');
  assert(die.back === 5, 'Back face starts at 5');
  assert(die.right === 3, 'Right face starts at 3');
  assert(die.left === 4, 'Left face starts at 4');
}

// Test 2: Opposite faces always sum to 7
{
  console.log('\n[ Opposite Faces Sum to 7 ]');
  const die = new Die();
  assert(die.top + die.bottom === 7, 'Top+Bottom = 7 (initial)');
  assert(die.front + die.back === 7, 'Front+Back = 7 (initial)');
  assert(die.right + die.left === 7, 'Right+Left = 7 (initial)');
  
  die.rollRight();
  assert(die.top + die.bottom === 7, 'Top+Bottom = 7 (after rollRight)');
  assert(die.front + die.back === 7, 'Front+Back = 7 (after rollRight)');
  assert(die.right + die.left === 7, 'Right+Left = 7 (after rollRight)');
  
  die.rollUp();
  assert(die.top + die.bottom === 7, 'Top+Bottom = 7 (after rollUp)');
}

// Test 3: Rolling right
{
  console.log('\n[ Roll Right ]');
  const die = new Die();
  die.rollRight();
  assert(die.top === 4, 'After rollRight: top=4 (was left)');
  assert(die.bottom === 3, 'After rollRight: bottom=3 (was right)');
  assert(die.right === 1, 'After rollRight: right=1 (was top)');
  assert(die.left === 6, 'After rollRight: left=6 (was bottom)');
  assert(die.front === 2, 'After rollRight: front unchanged');
  assert(die.back === 5, 'After rollRight: back unchanged');
}

// Test 4: Rolling left
{
  console.log('\n[ Roll Left ]');
  const die = new Die();
  die.rollLeft();
  assert(die.top === 3, 'After rollLeft: top=3 (was right)');
  assert(die.bottom === 4, 'After rollLeft: bottom=4 (was left)');
  assert(die.right === 6, 'After rollLeft: right=6 (was bottom)');
  assert(die.left === 1, 'After rollLeft: left=1 (was top)');
}

// Test 5: Rolling up
{
  console.log('\n[ Roll Up ]');
  const die = new Die();
  die.rollUp();
  assert(die.top === 2, 'After rollUp: top=2 (was front)');
  assert(die.bottom === 5, 'After rollUp: bottom=5 (was back)');
  assert(die.front === 6, 'After rollUp: front=6 (was bottom)');
  assert(die.back === 1, 'After rollUp: back=1 (was top)');
}

// Test 6: Rolling down
{
  console.log('\n[ Roll Down ]');
  const die = new Die();
  die.rollDown();
  assert(die.top === 5, 'After rollDown: top=5 (was back)');
  assert(die.bottom === 2, 'After rollDown: bottom=2 (was front)');
  assert(die.front === 1, 'After rollDown: front=1 (was top)');
  assert(die.back === 6, 'After rollDown: back=6 (was bottom)');
}

// Test 7: 4 rolls in same direction = full rotation = back to start
{
  console.log('\n[ Full Rotation (4x same direction) ]');
  const die = new Die();
  const orig = [...die.faces];
  die.rollRight().rollRight().rollRight().rollRight();
  assert(JSON.stringify(die.faces) === JSON.stringify(orig), '4x rollRight = identity');
  
  die.rollUp().rollUp().rollUp().rollUp();
  assert(JSON.stringify(die.faces) === JSON.stringify(orig), '4x rollUp = identity');
  
  die.rollLeft().rollLeft().rollLeft().rollLeft();
  assert(JSON.stringify(die.faces) === JSON.stringify(orig), '4x rollLeft = identity');
  
  die.rollDown().rollDown().rollDown().rollDown();
  assert(JSON.stringify(die.faces) === JSON.stringify(orig), '4x rollDown = identity');
}

// Test 8: Right then Left = identity
{
  console.log('\n[ Inverse Operations ]');
  const die = new Die();
  const orig = [...die.faces];
  die.rollRight().rollLeft();
  assert(JSON.stringify(die.faces) === JSON.stringify(orig), 'rollRight + rollLeft = identity');
  
  die.rollUp().rollDown();
  assert(JSON.stringify(die.faces) === JSON.stringify(orig), 'rollUp + rollDown = identity');
}

// Test 9: Gate check system
{
  console.log('\n[ Gate Logic ]');
  
  function checkGate(dieBottom, gateValue) {
    return dieBottom === gateValue;
  }
  
  const die = new Die();
  assert(checkGate(die.bottom, 6) === true, 'Gate needs 6, die bottom is 6 → pass');
  assert(checkGate(die.bottom, 3) === false, 'Gate needs 3, die bottom is 6 → blocked');
  
  die.rollRight(); // bottom becomes 3
  assert(checkGate(die.bottom, 3) === true, 'After rollRight, gate needs 3 → pass');
}

// Test 10: Clone independence
{
  console.log('\n[ Clone Independence ]');
  const die = new Die();
  const clone = die.clone();
  die.rollRight();
  assert(clone.top === 1, 'Clone not affected by original rolling');
  assert(die.top !== 1, 'Original was changed');
}

// Test 11: Level solution verification (can you reach target with right bottom face)
{
  console.log('\n[ Level Solution Reachability ]');
  
  // Simulate a path: start at (0,0), move right twice then up
  const die = new Die();
  die.rollRight(); // move right
  die.rollRight(); // move right again
  die.rollUp();    // move up
  
  // Track what bottom is after each move
  const die2 = new Die();
  const bottomHistory = [];
  bottomHistory.push(die2.bottom); // start
  die2.rollRight(); bottomHistory.push(die2.bottom);
  die2.rollRight(); bottomHistory.push(die2.bottom);
  die2.rollUp(); bottomHistory.push(die2.bottom);
  
  assert(bottomHistory.length === 4, 'Tracks 4 positions (start + 3 moves)');
  assert(bottomHistory[0] === 6, 'Initial bottom = 6');
  assert(typeof bottomHistory[3] === 'number', 'Final bottom is a number');
  assert(bottomHistory[3] >= 1 && bottomHistory[3] <= 6, 'Final bottom is valid die face');
}

// Summary
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed!');
  process.exit(1);
}
