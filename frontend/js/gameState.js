import { computeLegalMoves } from './simulation.js';
import { copyBoard, isPlayerInCheckAtPosition } from './utils/utils.js';

const movesHistory = [];
const boardHistory = [];

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

function isStalemateByRepetition() {
  return false;
}

function makeMove(piece, moveOrCapture, [row, col]) {
  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: [row, col],
  };
  movesHistory.push({ color: state.currentColor, ...historyItem });
  players[state.currentColor].movesHistory.push({ historyItem });

  piece.placeAt(moveOrCapture, [row, col]);

  passTurn();
}

function startTurn() {
  boardHistory.push(copyBoard(board));

  if (isStalemateByRepetition()) {
    setTimeout(() => {
      alert('Stalemate by repetition');
    }, 100);
  }

  const { currentColor, opositeColor } = state;

  // Am I in check?
  const oponentPieces = colorPieces[opositeColor];
  const imInCheck = isPlayerInCheckAtPosition(board, oponentPieces);

  if (imInCheck) {
    log('check');
  }

  // Compute all legal moves for current player.
  // If no legal moves, then it's check (or stale) mate.
  let numLegalMoves = 0;

  colorPieces[currentColor].forEach(piece => {
    piece.computeMoves(board);
    const { legalMoves, legalCaptures } = computeLegalMoves(piece);
    numLegalMoves += legalMoves.length + legalCaptures.length;
    piece.moves = legalMoves;
    piece.captures = legalCaptures;
  });

  if (!numLegalMoves) {
    if (imInCheck) {
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

export {
  players,
  state,
  board,
  colorPieces,
  movesHistory,
  boardHistory,
  startTurn,
  passTurn,
  makeMove,
};
