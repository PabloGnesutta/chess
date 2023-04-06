import { state, board, colorPieces } from './gameState.js';

function generateTempBoard() {
  const tempBoard = [];
  for (let row = 0; row < 8; row++) {
    const tempRow = [];
    for (let col = 0; col < 8; col++) {
      tempRow.push(board[row][col]);
    }
    tempBoard.push(tempRow);
  }
  return tempBoard;
}

function generateTempColorPieces() {
  const tempColorPieces = { w: [], b: [] };
  colorPieces.w.forEach(piece => {
    tempColorPieces.w.push({ ...piece });
  });
  colorPieces.b.forEach(piece => {
    tempColorPieces.b.push({ ...piece });
  });
  return tempColorPieces;
}

function isMoveLegal(moveOrCapture, piece, [row, col]) {
  const opositeColor = state.opositeColor;
  const board = generateTempBoard();
  let colorPieces = generateTempColorPieces();

  board[piece.row][piece.col] = null;

  // Capture:
  if (moveOrCapture === 'capture') {
    const capturablePiece = board[row][col];
    const pieceIdx = colorPieces[opositeColor].findIndex(
      p => p.id === capturablePiece.id
    );

    colorPieces[opositeColor].splice(pieceIdx, 1);
  }

  board[row][col] = piece;

  // Pawn promotion
  if (piece.name === P && (row === 0 || row === COL_Z)) {
    // TODO
  }

  piece.row = row;
  piece.col = col;

  // Am I in check?
  const checks = [];
  const oponentCaptures = [];

  colorPieces[opositeColor].forEach(piece => {
    piece.computeMoves(board);
    oponentCaptures.push(...piece.captures);
  });

  oponentCaptures.forEach(([row, col]) => {
    const target = board[row][col];
    if (target && target.name === K) {
      checks.push([row, col]);
    }
  });

  if (checks.length) {
    return false;
  } else {
    return true;
  }
}

function computeLegalMoves(piece) {
  const legalMoves = [];
  piece.moves.forEach(move => {
    const isLegal = isMoveLegal('move', { ...piece }, move);
    if (isLegal) {
      legalMoves.push(move);
    }
  });

  const legalCaptures = [];
  piece.captures.forEach(capture => {
    const isLegal = isMoveLegal('capture', { ...piece }, capture);
    if (isLegal) {
      legalCaptures.push(capture);
    }
  });

  return { legalMoves, legalCaptures };
}

export { computeLegalMoves };
