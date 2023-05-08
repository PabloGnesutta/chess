'use strict';

import { computeMoves } from '../engine/computePieceMovements.js';
import { Piece } from '../engine/createPiece.js';
import { BoardPiecesType, ColorPiecesType } from '../engine/gameState.js';

function copyBoard(boardPieces: BoardPiecesType): BoardPiecesType {
  const copiedBoard: BoardPiecesType = [];
  for (let row = 0; row < 8; row++) {
    copiedBoard[row] = {};
    for (let col = 0; col < 8; col++) {
      copiedBoard[row][col] = boardPieces[row][col]
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
 * Compute all movements and captures for oponent.
 * If one of those captures targets the player's king, then it's check
 * @param {BoardPieces} boardPieces 
 * @param {Pieces} oponentPieces 
 * @returns {boolean}
 */
function isPlayerInCheckAtPosition(boardPieces: BoardPiecesType, oponentPieces: Piece[]) {
  let playerIsInCheck = false;
  for (let p = 0; p < oponentPieces.length; p++) {
    const oponentsPiece = oponentPieces[p];

    // COMPUTE MOVES
    computeMoves[oponentsPiece.name](boardPieces, oponentsPiece);

    const captures = [];
    const moves = oponentsPiece.moves;
    for (let m = 0; m < moves.length; m++) {
      const move = moves[m];
      if (move.captureAt) {
        captures.push([move.captureAt[0], move.captureAt[1]]);
      }
    }

    if (!captures.length) continue;

    for (let c = 0; c < captures.length; c++) {
      const [row, col] = captures[c];
      const target = boardPieces[row][col];
      if (target && target.name === K) {
        playerIsInCheck = true;
        break;
      }
    }
  }
  return playerIsInCheck;
}

export { copyBoard, copyColorPieces, isPlayerInCheckAtPosition };
