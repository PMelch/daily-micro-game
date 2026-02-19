export const COLORS = [0, 1, 2, 3, 4, 5];

export function createBoard(size, seed) {
  let s = seed;
  const next = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s; };
  const numColors = 6;
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => next() % numColors)
  );
}

export function flood(board, newColor) {
  const oldColor = board[0][0];
  if (oldColor === newColor) return;
  const size = board.length;
  const stack = [[0, 0]];
  const visited = new Set();
  visited.add('0,0');
  // First: find entire connected region of oldColor from top-left
  const region = [];
  while (stack.length) {
    const [r, c] = stack.pop();
    if (board[r][c] !== oldColor) continue;
    region.push([r, c]);
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < size && nc >= 0 && nc < board[0].length && !visited.has(key)) {
        visited.add(key);
        stack.push([nr, nc]);
      }
    }
  }
  // Set region to new color
  for (const [r, c] of region) board[r][c] = newColor;
  // Now expand: any adjacent cells of newColor that weren't in region
  const stack2 = [...region];
  const visited2 = new Set(region.map(([r,c]) => `${r},${c}`));
  while (stack2.length) {
    const [r, c] = stack2.pop();
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < size && nc >= 0 && nc < board[0].length && !visited2.has(key) && board[nr][nc] === newColor) {
        visited2.add(key);
        stack2.push([nr, nc]);
      }
    }
  }
}

export function countFilled(board) {
  const color = board[0][0];
  const size = board.length;
  const stack = [[0, 0]];
  const visited = new Set(['0,0']);
  let count = 0;
  while (stack.length) {
    const [r, c] = stack.pop();
    if (board[r][c] !== color) continue;
    count++;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < size && nc >= 0 && nc < board[0].length && !visited.has(key)) {
        visited.add(key);
        stack.push([nr, nc]);
      }
    }
  }
  return count;
}
