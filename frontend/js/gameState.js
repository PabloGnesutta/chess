import { computeLegalMoves } from './simulation.js';
import { copyBoard, isPlayerInCheckAtPosition } from './utils/utils.js';
import { markLastMove, unselectCurrentSquare } from './board.js';

const movesHistory = [];
const boardHistory = [];

const pieces = {
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
    isInCheck: false,
    movesHistory: [],
    captures: [],
  },
  b: {
    color: 'b',
    isInCheck: false,
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

function makeMove(piece, move) {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
  };
  movesHistory.push({ color: state.currentColor, ...historyItem });
  players[state.currentColor].movesHistory.push({ historyItem });

  piece.doMove(move);

  unselectCurrentSquare();
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
  const imInCheck = isPlayerInCheckAtPosition(board, pieces[opositeColor]);

  if (imInCheck) {
    players[currentColor].isInCheck = true;
    log('check');
  }

  // Compute all legal moves for current player.
  // If no legal moves, then it's check (or stale) mate.
  let numLegalMoves = 0;

  pieces[currentColor].forEach(piece => {
    piece.computeMoves(board);
    const legalMoves = computeLegalMoves(piece);
    numLegalMoves += legalMoves;
    piece.moves = legalMoves;
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
  players[state.currentColor].isInCheck = false;
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export {
  board,
  boardHistory,
  pieces,
  movesHistory,
  players,
  state,
  makeMove,
  passTurn,
  startTurn,
};
