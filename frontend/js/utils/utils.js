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

export { copyBoard, copyPieces };
