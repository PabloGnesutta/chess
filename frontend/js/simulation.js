import { state, board, colorPieces } from './gameState.js';
import { copyBoard, copyPieces } from './utils/utils.js';

function isMoveLegal(moveOrCapture, piece, [row, col]) {
  const opositeColor = state.opositeColor;

  const boardCopy = copyBoard(board);
  let colorPiecesCopy = copyPieces(colorPieces);

  boardCopy[piece.row][piece.col] = null;

  // Capture:
  if (moveOrCapture === 'capture') {
    const capturablePiece = boardCopy[row][col];
    const pieceIdx = colorPiecesCopy[opositeColor].findIndex(
      p => p.id === capturablePiece.id
    );

    colorPiecesCopy[opositeColor].splice(pieceIdx, 1);
  }

  boardCopy[row][col] = piece;

  // Pawn promotion
  if (piece.name === P && (row === 0 || row === COL_Z)) {
    // TODO
  }

  piece.row = row;
  piece.col = col;

  // Am I in check?
  const checks = [];
  const oponentCaptures = [];

  colorPiecesCopy[opositeColor].forEach(piece => {
    piece.computeMoves(boardCopy);
    oponentCaptures.push(...piece.captures);
  });

  oponentCaptures.forEach(([row, col]) => {
    const target = boardCopy[row][col];
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
