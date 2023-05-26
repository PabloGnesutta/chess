import { log } from '../../utils/utils';
import { BoardPiecesType, LastMoveType, MatchState, MoveType, Piece } from '../types';
import { computePieceLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves';
import { invertColor } from './utils';
import { doCastle, doMove } from './piecesLib';
import { computeMoves } from './computePieceMovements';

export type MoveResult = {
  status: string;
  target: string;
};

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function makeLocalMove(state: MatchState, piece: Piece, move: MoveType): MoveResult {
  const historyItem: LastMoveType = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
    color: state.currentColor,
  };

  state.lastMove = historyItem;

  if (move.castleSteps) {
    doCastle(state.boardPieces, piece, move, false);
  } else {
    doMove(state, piece, move, false);
  }

  const passTurnResult = passTurn(state);
  return passTurnResult;
}

function passTurn(state: MatchState): MoveResult {
  state.players[state.currentColor].isInCheck = false;
  state.currentColor = invertColor(state.currentColor);

  const startTurnResult = startTurn(state);
  return startTurnResult;
}

/**
 * At this point, the turn has been passed, therefore
 * Current color is updated for the new turn
 */
function startTurn(state: MatchState): MoveResult {
  const { boardPieces, colorPieces, currentColor, lastMove, players } = state;

  let startTurnResult: MoveResult = {
    status: '',
    target: '',
  };

  // Am I in check?
  // Compute moves
  const playerIsInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces, state);

  if (playerIsInCheck) {
    players[currentColor].isInCheck = true;
    log(`Player ${currentColor} is in check at room ...`);
    startTurnResult = { status: 'CHECK', target: currentColor };
  }

  // CHECK/STALE MATE

  var playerHasNoLegalMoves = true;

  // Compute legal moves for current player's pieces.
  const currentPieces = colorPieces[currentColor];

  for (let p = 0; p < currentPieces.length; p++) {
    const piece = currentPieces[p];

    // Compute moves
    computeMoves[piece.name](boardPieces, piece, {
      lastMove: lastMove as LastMoveType,
      isInCheck: players[currentColor].isInCheck,
    });

    if (piece.moves.length) {
      const legalMoves = computePieceLegalMoves(state, piece);

      if (legalMoves.length) {
        playerHasNoLegalMoves = false;
        break;
      }
    }
  }

  if (playerHasNoLegalMoves) {
    if (playerIsInCheck) {
      log('Check Mate!');
      startTurnResult.status = 'CHECK_MATE';
      startTurnResult.target = currentColor;
    } else {
      log('Stale Mate!');
      startTurnResult.status = 'STALE_MATE';
      startTurnResult.target = 'BOTH';
    }
  }

  return startTurnResult;
}

export { makeLocalMove, putPieceOnBoard };
