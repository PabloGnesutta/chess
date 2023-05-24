import { BoardPiecesType, ColorPiecesType } from '../state/gameState.js';

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
  colorPieces.w.forEach(piece => {
    copiedPieces.w.push({ ...piece });
  });
  colorPieces.b.forEach(piece => {
    copiedPieces.b.push({ ...piece });
  });
  return copiedPieces;
}

export { copyBoard, copyColorPieces };
