import { computeLegalMoves } from './simulation.js';

const colorPieces = {
  w: [],
  b: [],
};

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
    piece.computeMoves(board);
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

  let numLegalMoves = 0;
  colorPieces[state.currentColor].forEach(piece => {
    piece.computeMoves(board);
    const { legalMoves, legalCaptures } = computeLegalMoves(piece);
    // log(piece.name, legalMoves, legalCaptures);
    numLegalMoves += legalMoves.length;
    piece.moves = legalMoves;
    piece.captures = legalCaptures;
  });

  if (!numLegalMoves) {
    alert('Check Mate!');
  }
}

function passTurn() {
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export { players, state, board, colorPieces, startTurn, passTurn };
