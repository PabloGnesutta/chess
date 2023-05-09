'use strict';

import { _imgContainers } from './board.js';
import { BoardPiecesType, CellType, boardPieces, colorPieces, players, putPieceOnBoard, state } from './gameState.js';

export type ColorType = 'w'|'b';

export type MoveType = {
  moveTo: CellType, 
  captureAt?: CellType
  castleSteps?: CellType[]
}
export type KingMoveType = MoveType & {
  rookFrom?: CellType,
  rookTo?: CellType,
}

export type Piece = {
  id: number,
  name: string,
  row: number,
  col: number,
  color: ColorType,
  moves: MoveType[],
  hasntMoveYet: boolean,
}
export type King = Piece & {
  moves: KingMoveType[]
}
export type Pawn = Piece & {
  delta: number,
  startingRow: number,
  enPassantRow: number,
}

let idCount = 0;

function resetPieceIdCount() {
  idCount = 0;
}

function newPiece(name: string, row: number, col: number, color: ColorType): Piece|King|Pawn {
  return {
    id: ++idCount,
    name,
    row,
    col,
    color,
    moves: [],
    hasntMoveYet: true,
  };
}

function updateBoardAndPieceWithMove(
  boardPieces: BoardPiecesType,
  piece: Piece,
  moveTo: any,
  isSimulation: boolean = false,
): void {
  const { row: rowFrom, col: colFrom } = piece;
  const [rowTo, colTo] = moveTo;

  // Remove piece from the board at current position
  delete boardPieces[rowFrom][colFrom];

  // Place piece on the board at new position
  piece.row = rowTo;
  piece.col = colTo;
  boardPieces[rowTo][colTo] = piece;
  
  if (!isSimulation) {
    _imgContainers[rowFrom][colFrom].innerHTML = null; // render
    _imgContainers[rowTo][colTo].innerHTML = getPieceImage(piece); // render
    piece.hasntMoveYet = false;
  }
}

function doMove(
  piece: Piece,
  move: MoveType
): void {
  const { currentColor, opositeColor } = state;
  const { moveTo, captureAt } = move;
  const [rowTo, colTo] = moveTo;

  updateBoardAndPieceWithMove(boardPieces, piece, moveTo, false);

  // Capture:
  if (captureAt) {
    const [captureRow, captureCol] = captureAt;
    const captueredBoardPiece = boardPieces[captureRow][captureCol];
    // Remove captured piece from colorPieces
    const colorPieceIndex = colorPieces[opositeColor].findIndex(
      piece => piece.id === captueredBoardPiece.id
    );

    {
      const [capturedColorPiece] = colorPieces[opositeColor].splice(colorPieceIndex, 1);
      // Add to player's captures
      players[currentColor].captures.push(capturedColorPiece);
    }

    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      delete boardPieces[captureRow][captureCol];
      _imgContainers[captureRow][captureCol].innerHTML = null; // render
    }
  }

  // Pawn Promotion
  if (piece.name === P && (rowTo === 0 || rowTo === _Z)) {
    promotePawnAt(boardPieces, piece as Pawn, [rowTo, colTo]);
  }
}

function doCastle(king: King, move: KingMoveType): void {
  const { moveTo, rookFrom, rookTo } = move;
  // Move king
  updateBoardAndPieceWithMove(boardPieces, king, moveTo);

  // Move corresponding rook
  if (!rookFrom) return warn('rookFrom not provided');
  const [_row, _col] = rookFrom;
  const rook = boardPieces[_row][_col];
  if (!rook) return warn('Rook not found while castling');
  updateBoardAndPieceWithMove(boardPieces, rook, rookTo);
}

function promotePawnAt(boardPieces: BoardPiecesType, pawn: Pawn, [row, col]: CellType): void {
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

function king(row: number, col: number, color: ColorType): King {
  const pieceBlueprint = newPiece(K, row, col, color) as King;
  return {
    ...pieceBlueprint,
  };
}

function queen(row: number, col: number, color: ColorType): Piece {
  return {
    ...newPiece(Q, row, col, color),
  };
}

function rook(row: number, col: number, color: ColorType): Piece {
  return {
    ...newPiece(R, row, col, color),
  };
}

function bishop(row: number, col: number, color: ColorType): Piece {
  return {
    ...newPiece(B, row, col, color),
  };
}

function knight(row: number, col: number, color: ColorType): Piece {
  return {
    ...newPiece(N, row, col, color),
  };
}

function pawn(row: number, col: number, color: ColorType): Pawn {
  return {
    ...newPiece(P, row, col, color),
    delta: color === 'w' ? -1 : 1,
    startingRow: color === 'w' ? 6 : 1,
    enPassantRow: color === 'w' ? 3 : 4,
  };
}

function getPieceImage(piece: Piece): string {
  const colorCode = piece.color === 'w' ? 'l' : 'd';
  let pieceCode = piece.name[0];
  if (piece.name === 'knight') pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  const filePath = `./svg/${fileName}`;
  return `<img src=${filePath} class="piece ${piece.name} ${piece.color}"></img>`;
}

const createPiece = {
  bishop,
  king,
  knight,
  pawn,
  queen,
  rook,
}

export {
  createPiece,
  doMove,
  doCastle,
  resetPieceIdCount,
  updateBoardAndPieceWithMove,
  getPieceImage,
}
