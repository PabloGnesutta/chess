'use strict';

import { boardPieces, colorPieces, state } from './gameState.js';
import {
  copyBoard,
  copyColorPieces,
  isPlayerInCheckAtPosition,
} from '../utils/utils.js';
import { Piece, updateBoardAndPieceWithMove } from './createPiece.js';
import { KingMoveType, MoveType } from './computePieceMovements.js';


// TODO: The whole move simulation is practically identical in _doMove()
function doesMovePutMeInCheck(piece: Piece, move: MoveType): boolean {
  const { opositeColor } = state;
  const { moveTo, captureAt } = move;
  const [rowTo, colTo] = moveTo;

  // Simulate board state
  const boardCopy = copyBoard(boardPieces);
  const piecesCopy = copyColorPieces(colorPieces);

  // Simulate move
  updateBoardAndPieceWithMove(boardCopy, piece, moveTo, true)
  
  if (captureAt) {
    const [captureRow, captureCol] = captureAt;
    const captueredBoardPiece = boardCopy[captureRow][captureCol];
    // Remove captured piece from colorPieces
    const colorPieceIndex = piecesCopy[opositeColor].findIndex(
      p => p.id === captueredBoardPiece.id
    );

    {
      piecesCopy[opositeColor].splice(colorPieceIndex, 1);
    }
      
    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      delete boardCopy[captureRow][captureCol];
    }
  }

  // Once the simulation is done, check if the resulting position puts player in check
  const oponentPieces = piecesCopy[opositeColor];
  const putsMeInCheck = isPlayerInCheckAtPosition(boardCopy, oponentPieces);

  return putsMeInCheck;
}

function filterLegalMoves(piece: Piece): MoveType[] {
  const legalMoves: MoveType[] = [];

  // Anyting but King
  if (piece.name !== K) {
    piece.moves.forEach(move => {
      if (!doesMovePutMeInCheck({ ...piece }, move)) {
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
        if (doesMovePutMeInCheck({ ...piece }, { moveTo: castleStep })) {
          castleIsLegal = false;
          break;
        }
      }

      if (castleIsLegal) {
        legalMoves.push(move);
      }
    } else {
      if (!doesMovePutMeInCheck({ ...piece }, move)) {
        legalMoves.push(move);
      }
    }
  });

  return legalMoves;
}

export { filterLegalMoves };
