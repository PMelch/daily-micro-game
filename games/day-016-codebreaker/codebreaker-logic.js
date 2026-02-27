export const COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'white'];
export const MAX_ATTEMPTS = 8;
export const CODE_LENGTH = 4;

export function generateCode() {
  return Array.from({ length: CODE_LENGTH }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
}

export function isValidCode(code) {
  if (!Array.isArray(code) || code.length !== CODE_LENGTH) return false;
  return code.every(c => COLORS.includes(c));
}

export function checkGuess(secret, guess) {
  let blacks = 0;
  const secretLeft = [];
  const guessLeft = [];

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (secret[i] === guess[i]) {
      blacks++;
    } else {
      secretLeft.push(secret[i]);
      guessLeft.push(guess[i]);
    }
  }

  let whites = 0;
  for (const g of guessLeft) {
    const idx = secretLeft.indexOf(g);
    if (idx !== -1) {
      whites++;
      secretLeft.splice(idx, 1);
    }
  }

  return { blacks, whites };
}
