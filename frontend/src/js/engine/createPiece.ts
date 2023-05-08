'use strict';

import { _imgContainers } from './board.js';
import { KingMoveType, MoveType } from './computePieceMovements.js';
import { CellType, boardPieces, colorPieces, players, putPieceOnBoard, state } from './gameState.js';

let idCount = 0;

export type ColorType = 'w'|'b';

export type Piece = {
  id: number,
  name: string,
  row: number,
  col: number,
  color: ColorType,
  moves: MoveType[],
  hasntMoveYet: boolean,
  doMove: any,
}
export type King = Piece & {
  moves: KingMoveType[]
}
export type Pawn = Piece & {
  delta: number,
  startingRow: number,
  enPassantRow: number,
}


function piece(name: string, row: number, col: number, color: ColorType): Piece|King|Pawn {
  return {
    id: ++idCount,
    name,
    row,
    col,
    color,
    moves: [],
    hasntMoveYet: true,

    doMove(move: MoveType) {
      _doMove(this, move);
    },
  };
}

function resetPieceIdCount() {
  idCount = 0;
}

function getPieceImage(piece: Piece) {
  const colorCode = piece.color === 'w' ? 'l' : 'd';
  let pieceCode = piece.name[0];
  if (piece.name === 'knight') pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  const filePath = `./svg/${fileName}`;
  return `<img src=${filePath} class="piece ${piece.name} ${piece.color}"></img>`;
}

function displcePieceTo(piece: Piece, moveTo: any) {
  const { row, col } = piece;
  const [rowTo, colTo] = moveTo;

  // Remove piece from the board at current position
  delete boardPieces[row][col];
  _imgContainers[row][col].innerHTML = null; // render

  // Place piece on the board at new position
  piece.row = rowTo;
  piece.col = colTo;
  boardPieces[rowTo][colTo] = piece;
  _imgContainers[rowTo][colTo].innerHTML = getPieceImage(piece); // render
  piece.hasntMoveYet = false;
}

function promotePawnAt(pawn: Pawn, [row, col]: CellType) {
  const { currentColor } = state;
  const pieceIndex = colorPieces[currentColor].findIndex(
    piece => piece.id === pawn.id
  );
  colorPieces[currentColor].splice(pieceIndex, 1);
  delete boardPieces[row][col];

  const promotedPiece = queen(row, col, currentColor);
  colorPieces[currentColor].push(promotedPiece);
  putPieceOnBoard(promotedPiece, boardPieces)
  _imgContainers[row][col].innerHTML = getPieceImage(promotedPiece); // render
}

function _doMove(piece: Piece, move: MoveType) {
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
    const [capturedPiece] = colorPieces[opositeColor].splice(pieceIndex, 1);
    // Add to player's captures
    players[currentColor].captures.push(capturedPiece);
    // en-passant
    if (colTo !== colCapt || rowTo !== rowCapt) {
      delete boardPieces[rowCapt][colCapt];
      _imgContainers[rowCapt][colCapt].innerHTML = null; // render
    }
  }

  // Pawn Promotion
  if (piece.name === P && (rowTo === 0 || rowTo === _Z)) {
    promotePawnAt(piece as Pawn, [rowTo, colTo]);
  }
}

function pawn(row: number, col: number, color: ColorType): Pawn {
  return {
    ...piece(P, row, col, color),
    delta: color === 'w' ? -1 : 1,
    startingRow: color === 'w' ? 6 : 1,
    enPassantRow: color === 'w' ? 3 : 4,
  };
}

function knight(row: number, col: number, color: ColorType): Piece {
  return {
    ...piece(N, row, col, color),
  };
}

function bishop(row: number, col: number, color: ColorType): Piece {
  return {
    ...piece(B, row, col, color),
  };
}

function rook(row: number, col: number, color: ColorType): Piece {
  return {
    ...piece(R, row, col, color),
  };
}

function queen(row: number, col: number, color: ColorType): Piece {
  return {
    ...piece(Q, row, col, color),
  };
}

function _doCastle(piece: King, move: KingMoveType) {
  const { moveTo, rookFrom, rookTo } = move;

  displcePieceTo(piece, moveTo);

  if (!rookFrom) return warn('rookFrom not provided');
  // Move corresponding rook
  const [_row, _col] = rookFrom;
  const rook = boardPieces[_row][_col];

  if (!rook) return warn('Rook not found while castling');

  displcePieceTo(rook as Piece, rookTo);
}

function king(row: number, col: number, color: ColorType): King {
  const pieceBlueprint = piece(K, row, col, color) as King;
  return {
    ...pieceBlueprint,

    // Overwrite inherited doMove method
    doMove(move: KingMoveType) {
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
