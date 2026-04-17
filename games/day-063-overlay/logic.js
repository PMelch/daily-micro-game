(function (global) {
  const STAMPS = [
    { id: 'corner', size: 3, cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    { id: 'hook', size: 3, cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    { id: 'zig', size: 3, cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
    { id: 'tee', size: 3, cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    { id: 'line', size: 4, cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
    { id: 'el', size: 3, cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  ];

  const ROUND_LIBRARY = [
    { id: 'diamond', target: ['2,0','1,1','2,1','3,1','0,2','1,2','2,2','3,2','4,2','1,3','2,3','3,3','2,4'] },
    { id: 'stairs', target: ['0,0','1,0','1,1','2,1','2,2','3,2','3,3','4,3','4,4'] },
    { id: 'ring', target: ['1,0','2,0','3,0','0,1','4,1','0,2','2,2','4,2','0,3','4,3','1,4','2,4','3,4'] },
    { id: 'arrow', target: ['2,0','1,1','2,1','3,1','0,2','1,2','2,2','3,2','4,2','2,3','2,4'] },
    { id: 'fork', target: ['0,0','2,0','4,0','0,1','2,1','4,1','0,2','1,2','2,2','3,2','4,2','2,3','2,4'] },
  ];

  function cloneStamp(stamp) {
    return { id: stamp.id, size: stamp.size, cells: stamp.cells.map(([x, y]) => [x, y]) };
  }

  function rotateStamp(stamp) {
    return {
      id: stamp.id,
      size: stamp.size,
      cells: stamp.cells.map(([x, y]) => [stamp.size - 1 - y, x]),
    };
  }

  function normalize(cells) {
    return cells.slice().sort((a, b) => a.localeCompare(b));
  }

  function placeStamp(board, stamp, offsetX, offsetY) {
    const coveredSet = new Set();
    for (const [x, y] of stamp.cells) {
      const bx = offsetX + x;
      const by = offsetY + y;
      if (bx < 0 || by < 0 || bx >= board.size || by >= board.size) continue;
      coveredSet.add(`${bx},${by}`);
    }
    const targetSet = new Set(board.target);
    let hits = 0;
    let spill = 0;
    for (const cell of coveredSet) {
      if (targetSet.has(cell)) hits += 1;
      else spill += 1;
    }
    return { covered: normalize([...coveredSet]), hits, spill };
  }

  function scoreBoard({ target, covered }) {
    const targetSet = new Set(target);
    const coveredSet = new Set(covered);
    let hits = 0;
    let spill = 0;
    for (const cell of coveredSet) {
      if (targetSet.has(cell)) hits += 1;
      else spill += 1;
    }
    const missed = target.filter((cell) => !coveredSet.has(cell)).length;
    const perfect = missed === 0 && spill === 0;
    const score = hits * 2 - spill + (perfect ? 5 : 0);
    return { hits, spill, missed, perfect, score };
  }

  function createRoundSet(seed) {
    let value = seed >>> 0;
    const picks = [];
    const pool = ROUND_LIBRARY.slice();
    while (picks.length < 3 && pool.length) {
      value = (value * 1664525 + 1013904223) >>> 0;
      picks.push(pool.splice(value % pool.length, 1)[0]);
    }
    return picks;
  }

  const api = { STAMPS, ROUND_LIBRARY, cloneStamp, rotateStamp, placeStamp, scoreBoard, createRoundSet };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.OverlayLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
