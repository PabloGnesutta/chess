import { board, pieces, state } from './gameState.js';
import {
  copyBoard,
  copyPieces,
  isPlayerInCheckAtPosition,
} from './utils/utils.js';

function _doesMovePutMeInCheck(piece, move) {
  const { moveTo, captureAt } = move;
  const [row, col] = moveTo;

  const opositeColor = state.opositeColor;

  const boardCopy = copyBoard(board);
  const piecesCopy = copyPieces(pieces);

  boardCopy[piece.row][piece.col] = null;

  // Capture:
  if (captureAt) {
    const [_row, _col] = captureAt;
    const capturablePiece = boardCopy[_row][_col];
    const pieceIdx = piecesCopy[opositeColor].findIndex(
      p => p.id === capturablePiece.id
    );

    piecesCopy[opositeColor].splice(pieceIdx, 1);
  }

  boardCopy[row][col] = piece;

  piece.row = row;
  piece.col = col;

  // Move puts me in check?
  const oponentPieces = piecesCopy[opositeColor];
  const putsMeInCheck = isPlayerInCheckAtPosition(boardCopy, oponentPieces);

  return putsMeInCheck;
}

function computeLegalMoves(piece) {
  const legalMoves = [];

  // Anyting but King
  if (piece.name !== K) {
    piece.moves.forEach(move => {
      const putsMeInCheck = _doesMovePutMeInCheck({ ...piece }, move);
      if (!putsMeInCheck) {
        legalMoves.push(move);
      }
    });

    return legalMoves;
  }

  // King
  piece.moves.forEach(move => {
    const castleSteps = move.steps;
    if (castleSteps) {
      // Castle
      let castleIsLegal = true;
      for (let s = 0; s < castleSteps.length; s++) {
        const step = castleSteps[s];
        const putsMeInCheck = _doesMovePutMeInCheck(
          { ...piece },
          { moveTo: step }
        );
        if (putsMeInCheck) {
          castleIsLegal = false;
          break;
        }
      }
      if (castleIsLegal) {
        legalMoves.push(move);
      }
    } else {
      const putsMeInCheck = _doesMovePutMeInCheck({ ...piece }, move);
      if (!putsMeInCheck) {
        legalMoves.push(move);
      }
    }
  });

  return legalMoves;
}

export { computeLegalMoves };
