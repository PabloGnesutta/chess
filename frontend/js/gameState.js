import { computeLegalMoves } from './simulation.js';
import { copyBoard, isPlayerInCheckAtPosition } from './utils/utils.js';
import {
  _imgContainers,
  markLastMove,
  unselectCurrentSquare,
} from './board.js';
import { wsSend } from './ws/ws.js';

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
  isMultiPlayer: false,
  playerIsColor: null,
};

function resetState() {
  for (const color in players) {
    const player = players[color];
    pieces[color].splice(0, pieces[color].length);
    player.isInCheck = false;
    player.movesHistory = [];
    player.captures = [];
  }

  for (let row = 0; row < _Z; row++) {
    for (let col = 0; col < _Z; col++) {
      board[row][col] = null;
      _imgContainers[row][col].innerHTML = null;
    }
  }

  movesHistory.splice(0, movesHistory.length);
  boardHistory.splice(0, boardHistory.length);

  state.currentColor = 'w';
  state.opositeColor = 'b';
  state.selectedPiece = null;
}

function _isStalemateByRepetition() {
  // TODO
  return false;
}

function makeMoveSinglePlayer(piece, move) {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
  };
  movesHistory.push({ color: state.currentColor, ...historyItem });
  players[state.currentColor].movesHistory.push({ historyItem });

  unselectCurrentSquare();

  // TODO: Delegate this to websocket
  piece.doMove(move);
  _passTurn();
}

function signalMoveMultiplayer(piece, move) {
  makeMoveSinglePlayer(piece, move);
  wsSend({
    type: 'SIGNAL_MOVE',
    moveData: {
      pieceId: piece.id,
      move,
    },
  });
}

function makeMoveMultiPlayer(moveData) {
  const { pieceId, move } = moveData;
  const piece = pieces[state.currentColor].find(p => p.id === pieceId);
  log('piece', piece);

  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
  };
  movesHistory.push({ color: state.currentColor, ...historyItem });
  players[state.currentColor].movesHistory.push({ historyItem });

  unselectCurrentSquare();

  // TODO: Delegate this to websocket
  piece.doMove(move);
  _passTurn();
}

function startTurn() {
  boardHistory.push(copyBoard(board));

  // TODO: stalemate by repetition

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

function _passTurn() {
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
  resetState,
  makeMoveSinglePlayer,
  signalMoveMultiplayer,
  makeMoveMultiPlayer,
  startTurn,
};
