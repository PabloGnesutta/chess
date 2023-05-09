'use strict';

import { filterLegalMoves } from './filterLegalMoves.js';
import { isPlayerInCheckAtPosition } from '../utils/utils.js';
import { resetPieceIdCount, ColorType, Piece, doCastle, doMove, MoveType } from './piecesLib.js';
import {
  _imgContainers,
  markLastMove,
  unselectCurrentSquare,
} from './board.js';
import { computeMoves } from './computePieceMovements.js';
import { MoveData, signalMove } from '../ws/ws.js';

export type CellType = [number, number];

type HistoryItemType = {
  piece: string, //pieceName
  from: CellType,
  to: CellType,
  color: string,
};

export type ColorPiecesType = {
  [key: string]: Piece[],
}

export type BoardPiecesType = { 
  // row
  [key: number]: { 
    // col
    [key: number]: Piece
  } 
}

export type PlayersType = { 
  // id
  [key: string]: {
    color: ColorType,
    isInCheck: boolean,
    movesHistory: HistoryItemType[],
    captures: Piece[]
  } 
}

export type State = {
  currentColor: ColorType,
  opositeColor: ColorType,
  selectedPiece: Piece | null,
  isMultiPlayer: boolean,
  playerColor: ColorType | '',
}

const movesHistory: HistoryItemType[] = [];

const colorPieces: ColorPiecesType = {
  w: [],
  b: [],
};

const boardPieces: BoardPiecesType = {
  0: {},
  1: {},
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
  7: {},
};

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

const players: PlayersType = {
  'w': {
    color: 'w',
    isInCheck: false,
    movesHistory: [],
    captures: [],
  },
  'b': {
    color: 'b',
    isInCheck: false,
    movesHistory: [],
    captures: [],
  },
};

const state: State = {
  currentColor: 'w',
  opositeColor: 'b',
  selectedPiece: null,
  isMultiPlayer: false,
  playerColor: '',
};

function resetState(): void {
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

  state.currentColor = 'w';
  state.opositeColor = 'b';
  state.selectedPiece = null;

  resetPieceIdCount();
}

function makeLocalMove(piece: Piece, move: MoveType): void {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col] as CellType,
    to: move.moveTo,
    color: state.currentColor // this breaks things?
  };
  movesHistory.push({ ...historyItem }); // color was a separate property instead of part of the history item
  players[state.currentColor].movesHistory.push({ ...historyItem });

  unselectCurrentSquare();

  if (move.castleSteps) {
    doCastle(piece, move)
  } else {
    doMove(piece, move)
  }

  passTurn();
}


function makeRemoteMove(moveData: MoveData): void {
  const { pieceId, move } = moveData;
  const piece = colorPieces[state.currentColor].find(p => p.id === pieceId);
  if (piece) {
    makeLocalMove(piece, move);
  } else {
    warn('Piece not found @makeRemoteMove', moveData)
  }
}

function signalMoveMultiplayer(piece: Piece, move: MoveType): void {
  signalMove(piece.id, move);
  makeLocalMove(piece, move);
}


function startTurn(): void {
  const { currentColor, opositeColor } = state;

  // TODO: stalemate by repetition

  // Am I in check?
  const imInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces[opositeColor]);

  if (imInCheck) {
    players[currentColor].isInCheck = true;
    log('check');
  }

  // Compute all legal moves for current player.
  // (Moves that don't put the player in check)
  // If no legal moves, then it's check mate or stale mate.
  let numLegalMoves = 0;

  colorPieces[currentColor].forEach(piece => {
    computeMoves[piece.name](boardPieces, piece);
    const legalMoves = filterLegalMoves(piece);
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

function passTurn(): void {
  players[state.currentColor].isInCheck = false;
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export {
  boardPieces,
  colorPieces,
  movesHistory,
  players,
  state,
  resetState,
  makeLocalMove,
  signalMoveMultiplayer,
  makeRemoteMove,
  startTurn,
  putPieceOnBoard,
};
