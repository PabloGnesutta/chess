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

function simulateMove(piece, [row, col]) {
  const board = generateTempBoard();
  let colorPieces = generateTempColorPieces();
  let isCapture = false;

  board[piece.row][piece.col] = null;

  // Capture:
  const capturablePiece = board[row][col];
  if (capturablePiece) {
    isCapture = true;
    const colorPieceIndex = colorPieces[state.opositeColor].findIndex(
      _piece => _piece.id === capturablePiece.id
    );

    colorPieces[state.opositeColor].splice(colorPieceIndex, 1);
  }

  board[row][col] = piece;

  // Pawn promotion
  if (piece.name === P && (row === 0 || row === COL_Z)) {
    // TODO
  }

  piece.row = row;
  piece.col = col;

  // Am I in check?
  const enemyPotentialCaptures = [];
  colorPieces[state.opositeColor].forEach(piece => {
    piece.computeMoves(board);
    enemyPotentialCaptures.push(...piece.captures);
  });

  const checks = [];
  enemyPotentialCaptures.forEach(([row, col]) => {
    const target = board[row][col];
    if (target && target.name === K) {
      checks.push([row, col]);
    }
  });

  if (checks.length) {
    return { isLegal: false, isCapture };
  } else {
    return { isLegal: true, isCapture };
  }
}

function computeLegalMoves(piece) {
  const legalMoves = [];
  const legalCaptures = [];
  piece.moves.forEach(move => {
    const { isLegal, isCapture } = simulateMove({ ...piece }, move);
    if (isLegal) {
      legalMoves.push(move);
      if (isCapture) {
        legalCaptures.push(move);
      }
    }
  });

  return { legalMoves, legalCaptures };
}

export { computeLegalMoves };
