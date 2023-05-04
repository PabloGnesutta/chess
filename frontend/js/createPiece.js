'use strict';

import { _imgContainers } from './board.js';
import { boardPieces, colorPieces, players, state } from './gameState.js';

let idCount = 0;

function piece(name, row, col, color) {
  return {
    id: ++idCount,
    name,
    row,
    col,
    color,
    moves: [],
    hasntMoveYet: true,

    doMove(move) {
      _doMove(this, move);
    },
  };
}

function resetPieceIdCount() {
  idCount = 0;
}

function getPieceImage(piece) {
  const colorCode = piece.color === 'w' ? 'l' : 'd';
  let pieceCode = piece.name[0];
  if (piece.name === 'knight') pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  const filePath = `./svg/${fileName}`;
  return `<img src=${filePath} class="piece ${piece.name} ${piece.color}"></img>`;
}

function displcePieceTo(piece, moveTo) {
  const { row, col } = piece;
  const [rowTo, colTo] = moveTo;

  // Remove piece from the board at current position
  boardPieces[row][col] = null;
  _imgContainers[row][col].innerHTML = null; // render

  // Place piece on the board at new position
  piece.row = rowTo;
  piece.col = colTo;
  boardPieces[rowTo][colTo] = piece;
  _imgContainers[rowTo][colTo].innerHTML = getPieceImage(piece); // render
  piece.hasntMoveYet = false;
}

function promotePawnAt(pawn, [row, col]) {
  const { currentColor } = state;
  const pieceIndex = colorPieces[currentColor].findIndex(
    piece => piece.id === pawn.id
  );
  colorPieces[currentColor].splice(pieceIndex, 1);
  boardPieces[row][col] = null;

  const promotedPiece = queen(row, col, currentColor);
  colorPieces[currentColor].push(promotedPiece);
  boardPieces.putPiece(promotedPiece);
  _imgContainers[row][col].innerHTML = getPieceImage(promotedPiece); // render
}

function _doMove(piece, move) {
  const { currentColor, opositeColor } = state;
  const { moveTo, captureAt } = move;
  const [rowTo, colTo] = moveTo;

  displcePieceTo(piece, moveTo);

  // Capture:
  if (captureAt) {
    // Remove captured piece from board
    const [rowCapt, colCapt] = captureAt;
    const captuerdBoardPiece = boardPieces[rowCapt][colCapt];
    // Remove it from colorPieces
    const pieceIndex = colorPieces[opositeColor].findIndex(
      piece => piece.id === captuerdBoardPiece.id
    );
    const capturedPiece = colorPieces[opositeColor].splice(pieceIndex, 1);
    // Add to player's captures
    players[currentColor].captures.push(capturedPiece);
    // en-passant
    if (colTo !== colCapt || rowTo !== rowCapt) {
      boardPieces[rowCapt][colCapt] = null;
      _imgContainers[rowCapt][colCapt].innerHTML = null; // render
    }
  }

  // Pawn Promotion
  if (piece.name === P && (rowTo === 0 || rowTo === _Z)) {
    promotePawnAt(piece, [rowTo, colTo]);
  }
}

function pawn(row, col, color) {
  return {
    ...piece(P, row, col, color),
    delta: color === 'w' ? -1 : 1,
    startingRow: color === 'w' ? 6 : 1,
    enPassantRow: color === 'w' ? 3 : 4,
  };
}

function knight(row, col, color) {
  return {
    ...piece(N, row, col, color),
  };
}

function bishop(row, col, color) {
  return {
    ...piece(B, row, col, color),
  };
}

function rook(row, col, color) {
  return {
    ...piece(R, row, col, color),
  };
}

function queen(row, col, color) {
  return {
    ...piece(Q, row, col, color),
  };
}

function _doCastle(piece, move) {
  const { moveTo, rookFrom, rookTo } = move;

  displcePieceTo(piece, moveTo);

  // Move corresponding rook
  const [_row, _col] = rookFrom;
  const rook = boardPieces[_row][_col];

  if (!rook) return warn('Rook not found while castling');

  displcePieceTo(rook, rookTo);
}

function king(row, col, color) {
  return {
    ...piece(K, row, col, color),

    // Overwrite inherited doMove method
    doMove(move) {
      if (move.rookFrom) {
        _doCastle(this, move);
      } else {
        _doMove(this, move);
      }
    },
  };
}

export default {
  bishop,
  king,
  knight,
  pawn,
  queen,
  rook,
  resetPieceIdCount,
  getPieceImage,
};
