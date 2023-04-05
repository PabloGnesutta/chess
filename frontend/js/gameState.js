import { colorPieces } from './pieces.js';

const board = [
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
];

board.putPiece = function (piece) {
  this[piece.row][piece.col] = piece;
  return this;
};

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
}

function passTurn() {
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export { players, state, board, startTurn, passTurn };
