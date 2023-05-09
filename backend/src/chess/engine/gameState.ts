'use strict';

import { BoardPiecesType, CellType, ColorPiecesType, HistoryItemType, MatchState, MoveType, Piece, PlayersType } from '../types';
import { filterLegalMoves } from './filterLegalMoves';
import { invertColor, isPlayerInCheckAtPosition } from './utils';
import { doCastle, doMove } from './piecesLib';
import { computeMoves } from './computePieceMovements';
import { log } from '../../utils/utils';

const movesHistory: HistoryItemType[] = [];

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function makeLocalMove(
  boardPieces: BoardPiecesType,
  colorPieces: ColorPiecesType,
  players: PlayersType,
  state: MatchState,
  movesHistory: HistoryItemType[],
  piece: Piece,
  move: MoveType
): void {
  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col] as CellType,
    to: move.moveTo,
    color: state.currentColor
  };
  movesHistory.push({ ...historyItem });

  if (move.castleSteps) {
    doCastle(boardPieces, piece, move)
  } else {
    doMove(boardPieces, colorPieces, players, state, piece, move)
  }

  passTurn(boardPieces, colorPieces, players, state);
}

type MoveData = {
  pieceId: number,
  move: any
}

function makeRemoteMove(
  boardPieces: BoardPiecesType,
  colorPieces: ColorPiecesType,
  players: PlayersType,
  state: MatchState,
  movesHistory: HistoryItemType[],
  moveData: MoveData,
): void {
  const { pieceId, move } = moveData;
  const piece = colorPieces[state.currentColor].find(p => p.id === pieceId);
  if (piece) {
    makeLocalMove(boardPieces, colorPieces, players, state, movesHistory, piece, move);
  } else {
    log('Piece not found @makeRemoteMove', moveData)
  }
}

function signalMoveMultiplayer(piece: Piece, move: MoveType): void {
  // signalMove(piece.id, move);
  // makeLocalMove(piece, move);
}


function startTurn(
  boardPieces: BoardPiecesType,
  colorPieces: ColorPiecesType,
  players: PlayersType,
  state: MatchState
): void {
  const { currentColor } = state;
  const opositeColor = invertColor(currentColor);

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
    const legalMoves = filterLegalMoves(boardPieces, colorPieces, state, piece);
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

function passTurn(boardPieces: BoardPiecesType, colorPieces: ColorPiecesType, players: PlayersType, state: MatchState): void {
  players[state.currentColor].isInCheck = false;
  state.currentColor = invertColor(state.currentColor);
  startTurn(boardPieces, colorPieces, players, state);
}

export {
  movesHistory,
  makeLocalMove,
  signalMoveMultiplayer,
  makeRemoteMove,
  startTurn,
  putPieceOnBoard,
};
