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

function copyPieces(colorPieces) {
  const copiedColorPieces = { w: [], b: [] };
  colorPieces.w.forEach(piece => {
    copiedColorPieces.w.push({ ...piece });
  });
  colorPieces.b.forEach(piece => {
    copiedColorPieces.b.push({ ...piece });
  });
  return copiedColorPieces;
}

function isPlayerInCheckAtPosition(board, oponentPieces) {
  let playerIsInCheck = false;
  for (let p = 0; p < oponentPieces.length; p++) {
    const piece = oponentPieces[p];
    piece.computeMoves(board);
    const captures = piece.captures;
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

export { copyBoard, copyPieces, isPlayerInCheckAtPosition };
