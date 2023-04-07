import { state, board, colorPieces } from './gameState.js';
import { copyBoard, copyPieces, isPlayerInCheckAtPosition } from './utils/utils.js';

function doesMovePutMeInCheck(moveOrCapture, piece, [row, col]) {
  const opositeColor = state.opositeColor;

  const boardCopy = copyBoard(board);
  const colorPiecesCopy = copyPieces(colorPieces);

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

  piece.row = row;
  piece.col = col;

  // Move puts me in check?
  const oponentPieces = colorPiecesCopy[opositeColor];
  const putsMeInCheck = isPlayerInCheckAtPosition(boardCopy, oponentPieces);

  return putsMeInCheck;
}

function computeLegalMoves(piece) {
  const legalMoves = [];
  piece.moves.forEach(move => {
    const putsMeInCheck = doesMovePutMeInCheck('move', { ...piece }, move);
    if (!putsMeInCheck) {
      legalMoves.push(move);
    }
  });

  const legalCaptures = [];
  piece.captures.forEach(capture => {
    const putsMeInCheck = doesMovePutMeInCheck('capture', { ...piece }, capture);
    if (!putsMeInCheck) {
      legalCaptures.push(capture);
    }
  });

  return { legalMoves, legalCaptures };
}

export { computeLegalMoves };
