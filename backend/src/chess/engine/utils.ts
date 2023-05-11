'use strict';

import { BoardPiecesType, ColorPiecesType, ColorType, MatchState, Piece } from '../types';

const invertColor = (currentColor: ColorType) => (currentColor === 'w' ? 'b' : 'w');

function copyBoard(boardPieces: BoardPiecesType): BoardPiecesType {
  const copiedBoard: BoardPiecesType = [];
  for (let row = 0; row < 8; row++) {
    copiedBoard[row] = {};
    for (let col = 0; col < 8; col++) {
      const boardPiece = boardPieces[row][col];
      if (boardPiece) {
        copiedBoard[row][col] = boardPieces[row][col];
      }
    }
  }
  return copiedBoard;
}

function copyColorPieces(colorPieces: ColorPiecesType): ColorPiecesType {
  const copiedPieces: ColorPiecesType = { w: [], b: [] };
  colorPieces.w.forEach((piece) => {
    copiedPieces.w.push({ ...piece });
  });
  colorPieces.b.forEach((piece) => {
    copiedPieces.b.push({ ...piece });
  });
  return copiedPieces;
}

export { copyBoard, copyColorPieces, invertColor };
