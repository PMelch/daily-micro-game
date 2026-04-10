#!/usr/bin/env node
// Generate and verify Roll Call levels with non-trivial gates

class D {
  constructor(f) { this.f = f ? [...f] : [1,6,2,5,3,4]; }
  get bot() { return this.f[1]; }
  rr() { const [t,b,f,bk,r,l]=this.f; return new D([l,r,f,bk,t,b]); }
  rl() { const [t,b,f,bk,r,l]=this.f; return new D([r,l,f,bk,b,t]); }
  ru() { const [t,b,f,bk,r,l]=this.f; return new D([f,bk,b,t,r,l]); }
  rd() { const [t,b,f,bk,r,l]=this.f; return new D([bk,f,t,b,r,l]); }
  key() { return this.f.join(','); }
}

function analyzeLevel(grid, gates, startPos, trackPositions) {
  const rows = grid.length, cols = grid[0].length;
  const gateAt = (x,y) => gates.find(g=>g.x===x&&g.y===y);
  
  // Phase 1: BFS WITHOUT gates → find all reachable bottom values at tracked positions
  const q1 = [{x:startPos.x, y:startPos.y, die: new D()}];
  const vis1 = new Set();
  vis1.add(`${startPos.x},${startPos.y},${new D().key()}`);
  const gateBottoms = {};
  const positions = trackPositions || gates;
  positions.forEach(g => gateBottoms[`${g.x},${g.y}`] = new Set());
  
  while (q1.length > 0) {
    const s = q1.shift();
    for (const [dx,dy] of [[1,0],[-1,0],[0,-1],[0,1]]) {
      const nx=s.x+dx, ny=s.y+dy;
      if(nx<0||ny<0||ny>=rows||nx>=cols||grid[ny][nx]===1) continue;
      let nd;
      if(dx===1) nd=s.die.rr(); else if(dx===-1) nd=s.die.rl();
      else if(dy===-1) nd=s.die.ru(); else nd=s.die.rd();
      const gk = `${nx},${ny}`;
      if(gateBottoms[gk]) gateBottoms[gk].add(nd.bot);
      const key = `${nx},${ny},${nd.key()}`;
      if(vis1.has(key)) continue;
      vis1.add(key);
      q1.push({x:nx, y:ny, die:nd});
    }
  }
  
  // Phase 2: BFS WITH gates → check solvability
  let exit;
  for (let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(grid[r][c]===3) exit={x:c,y:r};
  
  const q2 = [{x:startPos.x, y:startPos.y, die: new D(), moves:0, path:[]}];
  const vis2 = new Set();
  vis2.add(`${startPos.x},${startPos.y},${new D().key()}`);
  let solution = null;
  
  while (q2.length > 0) {
    const s = q2.shift();
    if(s.x===exit.x && s.y===exit.y) { solution = s; break; }
    for (const [dx,dy,n] of [[1,0,'R'],[-1,0,'L'],[0,-1,'U'],[0,1,'D']]) {
      const nx=s.x+dx, ny=s.y+dy;
      if(nx<0||ny<0||ny>=rows||nx>=cols||grid[ny][nx]===1) continue;
      let nd;
      if(dx===1) nd=s.die.rr(); else if(dx===-1) nd=s.die.rl();
      else if(dy===-1) nd=s.die.ru(); else nd=s.die.rd();
      const gate = gateAt(nx,ny);
      if(gate && nd.bot!==gate.need) continue;
      const key = `${nx},${ny},${nd.key()}`;
      if(vis2.has(key)) continue;
      vis2.add(key);
      q2.push({x:nx, y:ny, die:nd, moves:s.moves+1, path:[...s.path, n]});
    }
  }
  
  const gateInfo = {};
  for (const [k,v] of Object.entries(gateBottoms)) {
    gateInfo[k] = [...v].sort();
  }
  
  return { gateInfo, solved: !!solution, best: solution?.moves, path: solution?.path.join('') };
}

// Level definitions to test
const levels = [
  // Level 2: 7x7 open area with one gate
  {
    name: 'First Gate',
    grid: [
      [1,1,1,1,1,1,1],
      [1,2,0,0,0,0,1],
      [1,0,0,1,0,0,1],
      [1,0,1,0,0,0,1],
      [1,0,0,0,1,0,1],
      [1,0,0,0,0,3,1],
      [1,1,1,1,1,1,1],
    ],
    gatePos: [{x:3,y:3}],
    start: {x:1,y:1}
  },
  // Level 3: 7x7 with obstacles (asymmetric)
  {
    name: 'Detour',
    grid: [
      [1,1,1,1,1,1,1],
      [1,2,0,0,0,0,1],
      [1,0,1,0,0,0,1],
      [1,0,0,0,1,0,1],
      [1,0,0,1,0,0,1],
      [1,0,0,0,0,3,1],
      [1,1,1,1,1,1,1],
    ],
    gatePos: [{x:3,y:3}],
    start: {x:1,y:1}
  },
  // Level 4: 8x7 two gates
  {
    name: 'Two Gates',
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,1],
      [1,0,0,1,0,1,0,1],
      [1,0,1,0,0,0,0,1],
      [1,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,3,1],
      [1,1,1,1,1,1,1,1],
    ],
    gatePos: [{x:4,y:2},{x:2,y:4}],
    start: {x:1,y:1}
  },
  // Level 5: 8x8 maze
  {
    name: 'Maze',
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,1],
      [1,0,1,0,1,0,0,1],
      [1,0,0,0,0,0,1,1],
      [1,0,1,0,1,0,0,1],
      [1,0,0,0,0,1,0,1],
      [1,0,0,1,0,0,3,1],
      [1,1,1,1,1,1,1,1],
    ],
    gatePos: [{x:3,y:3},{x:3,y:5}],
    start: {x:1,y:1}
  },
  // Level 6: 8x8 corridor
  {
    name: 'Corridor',
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,2,0,0,0,1,0,1],
      [1,0,0,1,0,0,0,1],
      [1,0,1,0,0,0,0,1],
      [1,0,0,0,1,1,0,1],
      [1,1,0,0,0,0,0,1],
      [1,0,0,1,0,0,3,1],
      [1,1,1,1,1,1,1,1],
    ],
    gatePos: [{x:4,y:3},{x:2,y:5}],
    start: {x:1,y:1}
  },
  // Level 7: 9x8 three gates
  {
    name: 'Three Gates',
    grid: [
      [1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,0,1],
      [1,0,0,1,0,1,0,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,0,0,1,0,0,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,3,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    gatePos: [{x:4,y:2},{x:2,y:4},{x:5,y:5}],
    start: {x:1,y:1}
  },
  // Level 8: 9x9 master
  {
    name: 'Master',
    grid: [
      [1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,0,0,0,1],
      [1,0,0,1,0,1,0,0,1],
      [1,0,1,0,0,0,0,0,1],
      [1,0,0,0,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,1],
      [1,0,0,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,3,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    gatePos: [{x:4,y:2},{x:2,y:4},{x:5,y:6}],
    start: {x:1,y:1}
  }
];

console.log('=== Roll Call Level Generator ===\n');

for (let i = 0; i < levels.length; i++) {
  const lv = levels[i];
  console.log(`--- Level ${i+2}: ${lv.name} ---`);
  
  // Test all possible need values for each gate
  const gatesWithValues = [];
  
  for (const gp of lv.gatePos) {
    // BFS WITHOUT any gates, but track this position
    const result = analyzeLevel(lv.grid, [], lv.start, [{x:gp.x, y:gp.y}]);
    const reachable = result.gateInfo[`${gp.x},${gp.y}`] || [];
    console.log(`  Gate (${gp.x},${gp.y}): reachable bottoms = [${reachable}]`);
    
    if (reachable.length < 2) {
      console.log(`  ⚠️ TRIVIAL — only ${reachable.length} value(s). Need bigger grid.`);
    }
    
    // Pick a value that's not the most common
    // We'll try each and see which makes the best puzzle
    gatesWithValues.push({...gp, reachable});
  }
  
  // Try combinations of need values
  if (gatesWithValues.every(g => g.reachable.length >= 2)) {
    // Try to find a solvable combo
    let bestCombo = null;
    
    const tryCombo = (gates) => {
      const result = analyzeLevel(lv.grid, gates, lv.start);
      if (result.solved) {
        if (!bestCombo || result.best > bestCombo.best) {
          bestCombo = { gates: gates.map(g=>({...g})), best: result.best, path: result.path };
        }
      }
    };
    
    // Try all combinations
    const g0vals = gatesWithValues[0].reachable;
    if (gatesWithValues.length === 1) {
      for (const v of g0vals) {
        tryCombo([{x:gatesWithValues[0].x, y:gatesWithValues[0].y, need:v}]);
      }
    } else if (gatesWithValues.length === 2) {
      for (const v0 of g0vals) {
        for (const v1 of gatesWithValues[1].reachable) {
          tryCombo([
            {x:gatesWithValues[0].x, y:gatesWithValues[0].y, need:v0},
            {x:gatesWithValues[1].x, y:gatesWithValues[1].y, need:v1}
          ]);
        }
      }
    } else if (gatesWithValues.length === 3) {
      for (const v0 of g0vals) {
        for (const v1 of gatesWithValues[1].reachable) {
          for (const v2 of gatesWithValues[2].reachable) {
            tryCombo([
              {x:gatesWithValues[0].x, y:gatesWithValues[0].y, need:v0},
              {x:gatesWithValues[1].x, y:gatesWithValues[1].y, need:v1},
              {x:gatesWithValues[2].x, y:gatesWithValues[2].y, need:v2}
            ]);
          }
        }
      }
    }
    
    if (bestCombo) {
      console.log(`  ✅ Best: ${bestCombo.best} moves, path: ${bestCombo.path}`);
      console.log(`  Gates: ${JSON.stringify(bestCombo.gates)}`);
      console.log(`  Par: ${bestCombo.best + 2}`);
    } else {
      console.log(`  ❌ NO solvable combination found!`);
    }
  }
  
  console.log();
}
