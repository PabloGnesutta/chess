'use strict';

import { BoardPiecesType, CellType, HistoryItemType, MatchState, MoveType, Piece } from '../types';
import { filterLegalMoves } from './filterLegalMoves';
import { invertColor, isPlayerInCheckAtPosition } from './utils';
import { doCastle, doMove } from './piecesLib';
import { computeMoves } from './computePieceMovements';
import { log } from '../../utils/utils';

const movesHistory: HistoryItemType[] = [];

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function makeLocalMove(state: MatchState, piece: Piece, move: MoveType, clientId: number): void {
  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col] as CellType,
    to: move.moveTo,
    color: state.currentColor,
  };
  movesHistory.push({ ...historyItem });

  if (move.castleSteps) {
    doCastle(state.boardPieces, piece, move);
  } else {
    doMove(state, piece, move);
  }

  passTurn(state, clientId);
}

type MoveData = {
  pieceId: number;
  move: any;
};

function makeRemoteMove(state: MatchState, moveData: MoveData, clientId: number): void {
  const { pieceId, move } = moveData;
  const piece = state.colorPieces[state.currentColor].find(p => p.id === pieceId);
  if (piece) {
    makeLocalMove(state, piece, move, clientId);
  } else {
    log('Piece not found @makeRemoteMove', moveData);
  }
}

function signalMoveMultiplayer(piece: Piece, move: MoveType): void {
  // signalMove(piece.id, move);
  // makeLocalMove(piece, move);
}

function startTurn(state: MatchState, clientId: number): void {
  const { currentColor, movesHistory } = state;
  const { boardPieces, colorPieces, players } = state;

  // TODO: stalemate by repetition

  // Am I in check?
  // Compute moves
  const imInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces[invertColor(currentColor)], state);

  if (imInCheck) {
    players[clientId].isInCheck = true;
    log('check');
  }

  // CHECK/STALE MATE
  let numLegalMoves = 0;

  // Compute all legal moves for current player.
  // (Moves that don't put the player in check)
  // If no legal moves, then it's check mate or stale mate.

  colorPieces[currentColor].forEach(piece => {
    // Compute moves
    computeMoves[piece.name](boardPieces, piece, { movesHistory, isInCheck: players[currentColor].isInCheck });
    const legalMoves = filterLegalMoves(state, piece);
    piece.moves = legalMoves;
    numLegalMoves += legalMoves.length;
  });

  if (!numLegalMoves) {
    if (imInCheck) {
      setTimeout(() => {
        log('Check Mate!');
      }, 100);
    } else {
      setTimeout(() => {
        log('Stale Mate!');
      }, 100);
    }
  }
}

function passTurn(state: MatchState, clientId: number): void {
  state.players[clientId].isInCheck = false;
  state.currentColor = invertColor(state.currentColor);
  startTurn(state, clientId);
}

export { movesHistory, makeLocalMove, signalMoveMultiplayer, makeRemoteMove, startTurn, putPieceOnBoard };
