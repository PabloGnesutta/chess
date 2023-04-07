import { board, colorPieces, state } from './gameState.js';
import { copyBoard, copyPieces, isPlayerInCheckAtPosition } from './utils/utils.js';

function doesMovePutMeInCheck(piece, move) {
  const { type, moveTo, captureAt } = move;
  const [row, col] = moveTo;

  const opositeColor = state.opositeColor;

  const boardCopy = copyBoard(board);
  const colorPiecesCopy = copyPieces(colorPieces);

  boardCopy[piece.row][piece.col] = null;

  // Capture:
  if (captureAt) {
    const [_row, _col] = captureAt;
    const capturablePiece = boardCopy[_row][_col];
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
    const putsMeInCheck = doesMovePutMeInCheck({ ...piece }, move);
    if (!putsMeInCheck) {
      legalMoves.push(move);
    }
  });

  return legalMoves;
}

export { computeLegalMoves };
