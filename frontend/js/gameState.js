import { computeLegalMoves } from './simulation.js';

const boardHistory = [];
const movesHistory = [];

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
  const { currentColor, opositeColor } = state;
  // Am I in check?
  const oponentCaptures = [];
  colorPieces[opositeColor].forEach(piece => {
    piece.computeMoves(board);
    oponentCaptures.push(...piece.captures);
  });

  const checks = [];
  oponentCaptures.forEach(([row, col]) => {
    if (board[row][col].name === K) {
      checks.push([row, col]);
    }
  });

  if (checks.length) {
    log('Ceck!', checks);
  }

  // Compute all legal moves for current player.
  // If no legal moves, then it's check mate :)
  let numLegalMoves = 0;
  colorPieces[currentColor].forEach(piece => {
    piece.computeMoves(board);
    const { legalMoves, legalCaptures } = computeLegalMoves(piece);
    numLegalMoves += legalMoves.length + legalCaptures.length;
    piece.moves = legalMoves;
    piece.captures = legalCaptures;
  });

  if (!numLegalMoves) {
    if (checks.length) {
      setTimeout(() => {
        alert('Check Mate!');
      }, 100);
    } else {
      setTimeout(() => {
        alert('Stale Mate!');
      }, 100);
    }
  }
}

function passTurn() {
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export { players, state, board, colorPieces, startTurn, passTurn };
