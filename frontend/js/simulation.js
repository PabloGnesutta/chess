'use strict';

import { boardPieces, colorPieces, state } from './gameState.js';
import {
  copyBoard,
  copyColorPieces,
  isPlayerInCheckAtPosition,
} from './utils/utils.js';

function _doesMovePutMeInCheck(piece, move) {
  const { moveTo, captureAt } = move;
  const [row, col] = moveTo;

  const opositeColor = state.opositeColor;

  const boardCopy = copyBoard(boardPieces);
  const piecesCopy = copyColorPieces(colorPieces);

  // Simulate the move

  boardCopy[piece.row][piece.col] = null;

  if (captureAt) {
    // Simulate the capture:
    const [_row, _col] = captureAt;
    const capturablePiece = boardCopy[_row][_col];
    const pieceIdx = piecesCopy[opositeColor].findIndex(
      p => p.id === capturablePiece.id
    );

    piecesCopy[opositeColor].splice(pieceIdx, 1);
  }

  boardCopy[row][col] = piece;

  piece.row = row;
  piece.col = col;

  // Once the simulation is done, check if the resulting position puts player in check
  const oponentPieces = piecesCopy[opositeColor];
  const putsMeInCheck = isPlayerInCheckAtPosition(boardCopy, oponentPieces);

  return putsMeInCheck;
}

function computeLegalMoves(piece) {
  const legalMoves = [];

  // Anyting but King
  if (piece.name !== K) {
    piece.moves.forEach(move => {
      const putsMeInCheck = _doesMovePutMeInCheck({ ...piece }, move);
      if (!putsMeInCheck) {
        legalMoves.push(move);
      }
    });

    return legalMoves;
  }

  // King
  piece.moves.forEach(move => {
    const castleSteps = move.castleSteps;
    if (castleSteps) {
      // Castle
      let castleIsLegal = true;

      for (let s = 0; s < castleSteps.length; s++) {
        const castleStep = castleSteps[s];
        const putsMeInCheck = _doesMovePutMeInCheck(
          { ...piece },
          { moveTo: castleStep }
        );
        if (putsMeInCheck) {
          castleIsLegal = false;
          break;
        }
      }

      if (castleIsLegal) {
        legalMoves.push(move);
      }
    } else {
      const putsMeInCheck = _doesMovePutMeInCheck({ ...piece }, move);
      if (!putsMeInCheck) {
        legalMoves.push(move);
      }
    }
  });

  return legalMoves;
}

export { computeLegalMoves };
