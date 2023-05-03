'use strict';

function copyBoard(board) {
  const copiedBoard = [];
  for (let row = 0; row < 8; row++) {
    const tempRow = [];
    for (let col = 0; col < 8; col++) {
      tempRow.push(board[row][col]);
    }
    copiedBoard.push(tempRow);
  }
  return copiedBoard;
}

function copyColorPieces(colorPieces) {
  const copiedPieces = { w: [], b: [] };
  colorPieces.w.forEach(piece => {
    copiedPieces.w.push({ ...piece });
  });
  colorPieces.b.forEach(piece => {
    copiedPieces.b.push({ ...piece });
  });
  return copiedPieces;
}

function isPlayerInCheckAtPosition(board, oponentPieces) {
  let playerIsInCheck = false;
  for (let p = 0; p < oponentPieces.length; p++) {
    const piece = oponentPieces[p];
    piece.computeMoves(board);

    const captures = [];
    const moves = piece.moves;
    for (let m = 0; m < moves.length; m++) {
      const move = moves[m];
      if (move.captureAt) {
        captures.push([move.captureAt[0], move.captureAt[1]]);
      }
    }

    if (!captures.length) continue;

    for (let c = 0; c < captures.length; c++) {
      const [row, col] = captures[c];
      const target = board[row][col];
      if (target && target.name === K) {
        playerIsInCheck = true;
        break;
      }
    }
  }
  return playerIsInCheck;
}

export { copyBoard, copyColorPieces, isPlayerInCheckAtPosition };
