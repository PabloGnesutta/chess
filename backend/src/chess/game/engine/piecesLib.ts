'use strict';

import { invertColor, log } from '../../../utils/utils.js';
import { BoardPiecesType, CellType, ColorPiecesType, ColorType, King, KingMoveType, MatchState, MoveType, Pawn, Piece, PieceNameType, PlayersType } from '../types.js';
import { K, Q, R, B, N, P, _Z } from '../constants.js'
import { putPieceOnBoard } from './gameState.js';

let idCount = 0;

function resetPieceIdCount() {
  idCount = 0;
}

function newPiece(name: PieceNameType, row: number, col: number, color: ColorType): Piece|King|Pawn {
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
    piece.hasntMoveYet = false;
  }
}

function doMove(
  boardPieces: BoardPiecesType,
  colorPieces: ColorPiecesType,
  players: PlayersType,
  state: MatchState,
  piece: Piece,
  move: MoveType
): void {
  const { currentColor } = state;
  const opositeColor = invertColor(currentColor);
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
      // players[currentColor].captures.push(capturedColorPiece);
    }

    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      delete boardPieces[captureRow][captureCol];
    }
  }

  // Pawn Promotion
  if (piece.name === P && (rowTo === 0 || rowTo === _Z)) {
    promotePawnAt(boardPieces, colorPieces, state, piece as Pawn, [rowTo, colTo]);
  }
}

function doCastle(
  boardPieces: BoardPiecesType,
  king: King,
  move: KingMoveType
): void {
  const { moveTo, rookFrom, rookTo } = move;
  // Move king
  updateBoardAndPieceWithMove(boardPieces, king, moveTo);

  // Move corresponding rook
  if (!rookFrom) return log('rookFrom not provided');
  const [_row, _col] = rookFrom;
  const rook = boardPieces[_row][_col];
  if (!rook) return log('Rook not found while castling');
  updateBoardAndPieceWithMove(boardPieces, rook, rookTo);
}

function promotePawnAt(
  boardPieces: BoardPiecesType,
  colorPieces: ColorPiecesType,
  state: MatchState,
  pawn: Pawn,
  [row, col]: CellType
): void {
  const { currentColor } = state;
  const pieceIndex = colorPieces[currentColor].findIndex(
    piece => piece.id === pawn.id
  );
  colorPieces[currentColor].splice(pieceIndex, 1);
  delete boardPieces[row][col];

  const promotedPiece = queen(row, col, currentColor);
  colorPieces[currentColor].push(promotedPiece);
  putPieceOnBoard(promotedPiece, boardPieces)
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
}
