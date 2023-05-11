'use strict';

import { K } from '../constants';
import { BoardPiecesType, ColorPiecesType, KingMoveType, MatchState, MoveType, Piece } from '../types';
import { copyBoard, copyColorPieces, invertColor } from './utils';
import { updateBoardAndPieceWithMove } from './piecesLib';
import { computeMoves } from './computePieceMovements';

/**
 * For each oponent's piece COMPUTE all it's movements.
 * If one of those is a capture of player's king, then it's check.
 * Once a check is found, break the loop and return.
 * @param {BoardPieces} boardPieces
 * @param {Pieces} oponentPieces
 * @returns {boolean}
 */
function isPlayerInCheckAtPosition(
  boardPieces: BoardPiecesType,
  colorPieces: ColorPiecesType,
  { currentColor, movesHistory, players }: MatchState
): boolean {
  const oponentPieces = colorPieces[invertColor(currentColor)];

  var playerIsInCheck = false;

  for (let p = 0; p < oponentPieces.length; p++) {
    const oponentsPiece = oponentPieces[p];

    // Compute oponent moves one piece at a time
    /**
     * Needs refactoring.
     * for this, we only need the captures.
     * isInCheck is used to compute castling
     * we pass it as true to avoid that computation
     */
    computeMoves[oponentsPiece.name](boardPieces, oponentsPiece, { movesHistory, isInCheck: true }); // do not compute castle

    const moves = oponentsPiece.moves;

    for (let m = 0; m < moves.length; m++) {
      const { captureAt } = moves[m];
      if (captureAt) {
        // If the move is a capture, check if the capture is player's king
        const target = boardPieces[captureAt[0]][captureAt[1]];
        if (target && target.name === K) {
          playerIsInCheck = true;
          break;
        }
      }
    }
  }

  return playerIsInCheck;
}

function doesMovePutPlayerInCheck(state: MatchState, _piece: Piece, move: MoveType): boolean {
  // NOTE: The move simulation is practically identical in _doMove()

  const { boardPieces, colorPieces, currentColor } = state;

  const opositeColor = invertColor(currentColor);

  const { moveTo, captureAt } = move;

  const [rowTo, colTo] = moveTo;

  // Copy state
  const boardCopy = copyBoard(boardPieces);
  const piecesCopy = copyColorPieces(colorPieces);
  const pieceCopy = { ..._piece };

  // Simulate move - Update piece and boardPieces status
  updateBoardAndPieceWithMove(boardCopy, pieceCopy, moveTo, true);

  // Simulate capture - Update colorPieces (remove captured)
  if (captureAt) {
    const [captureRow, captureCol] = captureAt;

    const captueredBoardPiece = boardCopy[captureRow][captureCol];

    const colorPieceIndex = piecesCopy[opositeColor].findIndex((p) => p.id === captueredBoardPiece.id);

    piecesCopy[opositeColor].splice(colorPieceIndex, 1);

    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      // Update boardPieces (remove captured)
      delete boardCopy[captureRow][captureCol];
    }
  }

  const movePutsPlayerInCheck = isPlayerInCheckAtPosition(boardCopy, piecesCopy, state);

  return movePutsPlayerInCheck;
}

/**
 * Used at start turn to compute all legal moves
 * and if there's none, it's check mate or stale mate
 * @param boardPiecs
 * @param colorPieces
 * @param state
 * @param piece
 * @returns
 */
function computePieceLegalMoves(state: MatchState, piece: Piece): MoveType[] {
  const legalMoves: MoveType[] = [];

  // Anyting but King
  if (piece.name !== 'king') {
    piece.moves.forEach((move) => {
      if (!doesMovePutPlayerInCheck(state, piece, move)) {
        legalMoves.push(move);
      }
    });

    return legalMoves;
  }

  // King
  piece.moves.forEach((move: KingMoveType) => {
    const castleSteps = move.castleSteps;
    if (castleSteps) {
      let castleIsLegal = true;

      for (let s = 0; s < castleSteps.length; s++) {
        const castleStep = castleSteps[s];
        if (doesMovePutPlayerInCheck(state, piece, { moveTo: castleStep })) {
          castleIsLegal = false;
          break;
        }
      }

      if (castleIsLegal) {
        legalMoves.push(move);
      }
    } else {
      if (!doesMovePutPlayerInCheck(state, piece, move)) {
        legalMoves.push(move);
      }
    }
  });

  return legalMoves;
}

export { computePieceLegalMoves, isPlayerInCheckAtPosition };
