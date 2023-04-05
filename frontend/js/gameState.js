import { board } from './board.js';
import { allPieces, colorPieces } from './pieces.js';

const players = {
  w: {
    color: 'w',
    movesHistory: [],
    captures: [],
  },
  b: {
    color: 'b',
    movesHistory: [],
    captures: [],
  },
};

const state = {
  currentColor: 'w',
  opositeColor: 'b',
  selectedPiece: null,
};

function startTurn() {
  // Am I in check?
  console.time('a')
  const potentialChecks = [];
  colorPieces[state.opositeColor].forEach(piece => {
    piece.computeMoves();
    potentialChecks.push(...piece.captures);
  });

  const checks = [];
  potentialChecks.forEach(([row, col]) => {
    if (board[row][col].name === K) {
      checks.push([row, col]);
    }
  });

  if (checks.length) {
    log('Ceck!', checks);
    // Is it check mate?
  }

  colorPieces[state.currentColor].forEach(piece => piece.computeMoves());
  console.timeEnd('a')
}

function passTurn() {
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export { players, state, passTurn };
