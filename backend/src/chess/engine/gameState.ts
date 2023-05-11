import { BoardPiecesType, CellType, HistoryItemType, MatchState, MoveType, Piece } from '../types';
import { computePieceLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves';
import { invertColor } from './utils';
import { doCastle, doMove } from './piecesLib';
import { computeMoves } from './computePieceMovements';
import { log } from '../../utils/utils';

const movesHistory: HistoryItemType[] = [];

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function makeLocalMove(state: MatchState, piece: Piece, move: MoveType): void {
  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col] as CellType,
    to: move.moveTo,
    color: state.currentColor,
  };

  movesHistory.push(historyItem);

  if (move.castleSteps) {
    doCastle(state.boardPieces, piece, move, false);
  } else {
    doMove(state, piece, move, false);
  }

  passTurn(state);
}

function passTurn(state: MatchState): void {
  state.players[state.currentColor].isInCheck = false;
  state.currentColor = invertColor(state.currentColor);
  startTurn(state);
}

/**
 * At this point, the turn has been passed, therefore
 * Current color is updated for the new turn
 */
function startTurn(state: MatchState): void {
  const { boardPieces, colorPieces, currentColor, movesHistory, players } = state;

  // Am I in check?
  // Compute moves
  const playerIsInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces, state);

  if (playerIsInCheck) {
    players[currentColor].isInCheck = true;
    log(`Player ${currentColor} is in check at room ...`);
  }

  // CHECK/STALE MATE

  var playerHasNoLegalMoves = true;

  // Compute legal moves for current player's pieces.
  const currentPieces = colorPieces[currentColor];

  for (let p = 0; p < currentPieces.length; p++) {
    const piece = currentPieces[p];

    // Compute moves
    computeMoves[piece.name](boardPieces, piece, {
      movesHistory,
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

export { movesHistory, makeLocalMove, putPieceOnBoard };
