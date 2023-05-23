'use strict';

import { copyBoard, copyColorPieces } from '../utils/utils.js';
import { BoardPiecesType, boardPieces, colorPieces, state } from './gameState.js';
import { KingMoveType, MoveType, Piece, updateBoardAndPieceWithMove } from './piecesLib.js';
import { computeMoves } from './computePieceMovements.js';

/**
 * For each oponent's piece
 * compute all it's movements.
 * If one of those is a capture agains player's king, then it's check.
 * Once a check is found, break the loop and return.
 * @param {BoardPieces} boardPieces
 * @param {Pieces} oponentPieces
 * @returns {boolean}
 */
function isPlayerInCheckAtPosition(boardPieces: BoardPiecesType, oponentPieces: Piece[]) {
  let playerIsInCheck = false;
  for (let p = 0; p < oponentPieces.length; p++) {
    const oponentsPiece = oponentPieces[p];

    // Compute oponent moves one piece at a time
    computeMoves[oponentsPiece.name](boardPieces, oponentsPiece);

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

// TODO: The move simulation is practically identical in _doMove()
function isPlayerInCheckAfterMove(piece: Piece, move: MoveType): boolean {
  const { opositeColor } = state;
  const { moveTo, captureAt } = move;
  const [rowTo, colTo] = moveTo;

  // Copy state for simulation
  const boardCopy = copyBoard(boardPieces);
  const piecesCopy = copyColorPieces(colorPieces);
  const pieceCopy = { ...piece };

  // Simulate capture
  if (captureAt) {
    const [captureRow, captureCol] = captureAt;
    const captueredBoardPiece = boardCopy[captureRow][captureCol];

    // Remove captured piece from colorPieces
    const colorPieceIndex = piecesCopy[opositeColor].findIndex((p) => p.id === captueredBoardPiece.id);
    piecesCopy[opositeColor].splice(colorPieceIndex, 1);

    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      delete boardCopy[captureRow][captureCol];
    }
  }

  // Simulate move
  updateBoardAndPieceWithMove(boardCopy, pieceCopy, moveTo, true);

  // Once the simulation is done, check if the resulting position puts player in check
  const oponentPieces = piecesCopy[opositeColor];
  const putsMeInCheck = isPlayerInCheckAtPosition(boardCopy, oponentPieces);

  return putsMeInCheck;
}

function filterLegalMoves(piece: Piece): MoveType[] {
  const legalMoves: MoveType[] = [];

  // Anyting but King
  if (piece.name !== K) {
    piece.moves.forEach((move) => {
      if (!isPlayerInCheckAfterMove(piece, move)) {
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
        if (isPlayerInCheckAfterMove(piece, { moveTo: castleStep })) {
          castleIsLegal = false;
          break;
        }
      }

      if (castleIsLegal) {
        legalMoves.push(move);
      }
    } else {
      if (!isPlayerInCheckAfterMove(piece, move)) {
        legalMoves.push(move);
      }
    }
  });

  return legalMoves;
}

export { filterLegalMoves, isPlayerInCheckAtPosition };
