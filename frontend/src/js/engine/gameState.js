'use strict';

import { computeLegalMoves } from './simulation.js';
import { isPlayerInCheckAtPosition } from '../utils/utils.js';
import piecesLib from './createPiece.js';
import {
  _imgContainers,
  markLastMove,
  unselectCurrentSquare,
} from './board.js';
import { computeMoves } from './computePieceMovements.js';
import { signalMove } from '../ws/ws.js';

const movesHistory = [];
const boardHistory = [];

const colorPieces = {
  w: [],
  b: [],
};

const boardPieces = {
  0: {},
  1: {},
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
  7: {},
  putPiece(piece) {
    this[piece.row][piece.col] = piece;
    return this;
  }
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
  playerColor: null,
};

function resetState() {
  for (const color in players) {
    const player = players[color];
    colorPieces[color].splice(0, colorPieces[color].length);
    player.isInCheck = false;
    player.movesHistory = [];
    player.captures = [];
  }

  for (let row = 0; row <= _Z; row++) {
    boardPieces[row] = {};
    for (let col = 0; col <= _Z; col++) {
      _imgContainers[row][col].innerHTML = null;
    }
  }

  movesHistory.splice(0, movesHistory.length);
  boardHistory.splice(0, boardHistory.length);

  state.currentColor = 'w';
  state.opositeColor = 'b';
  state.selectedPiece = null;

  piecesLib.resetPieceIdCount();
}

function makeLocalMove(piece, move) {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
  };
  movesHistory.push({ color: state.currentColor, ...historyItem });
  players[state.currentColor].movesHistory.push({ historyItem });

  unselectCurrentSquare();

  piece.doMove(move);
  _passTurn();
}

function makeRemoteMove(moveData) {
  const { pieceId, move } = moveData;
  const piece = colorPieces[state.currentColor].find(p => p.id === pieceId);
  makeLocalMove(piece, move);
}

function signalMoveMultiplayer(piece, move) {
  signalMove(piece.id, move);
  makeLocalMove(piece, move);
}


function startTurn() {
  const { currentColor, opositeColor } = state;

  // TODO: stalemate by repetition

  // Am I in check?
  const imInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces[opositeColor]);

  if (imInCheck) {
    players[currentColor].isInCheck = true;
    log('check');
  }

  // Compute all legal moves for current player.
  // If no legal moves, then it's check mate or stale mate.
  let numLegalMoves = 0;

  colorPieces[currentColor].forEach(piece => {
    computeMoves[piece.name](boardPieces, piece);
    const legalMoves = computeLegalMoves(piece);
    piece.moves = legalMoves;
    numLegalMoves += legalMoves.length;
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
  boardPieces,
  boardHistory,
  colorPieces,
  movesHistory,
  players,
  state,
  resetState,
  makeLocalMove,
  signalMoveMultiplayer,
  makeRemoteMove,
  startTurn,
};
