'use strict';

import { K } from '../constants';
import { computeMoves } from '../engine/computePieceMovements';
import { BoardPiecesType, ColorPiecesType, ColorType, Piece } from '../types';

const invertColor = (currentColor: ColorType) => currentColor === 'w' ? 'b' : 'w';

function copyBoard(boardPieces: BoardPiecesType): BoardPiecesType {
  const copiedBoard: BoardPiecesType = [];
  for (let row = 0; row < 8; row++) {
    copiedBoard[row] = {};
    for (let col = 0; col < 8; col++) {
      const boardPiece = boardPieces[row][col]
      if (boardPiece) {
        copiedBoard[row][col] = boardPieces[row][col]
      }
    }
  }
  return copiedBoard;
}

function copyColorPieces(colorPieces: ColorPiecesType): ColorPiecesType {
  const copiedPieces: ColorPiecesType = { w: [], b: [] };
  colorPieces.w.forEach(piece => {
    copiedPieces.w.push({ ...piece });
  });
  colorPieces.b.forEach(piece => {
    copiedPieces.b.push({ ...piece });
  });
  return copiedPieces;
}

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

export { copyBoard, copyColorPieces, invertColor, isPlayerInCheckAtPosition };
