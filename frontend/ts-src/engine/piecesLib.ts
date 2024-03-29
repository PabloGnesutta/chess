import { B, K, N, P, Q, R, _Z } from '../globals.js';
import { BoardPiecesType, CellType, ColorType, LocalMoveResult, PieceNameType, gameState } from '../state/gameState.js';
import { _imgContainers } from '../ui/board.js';

import { putPieceOnBoard } from './gameFlow.js';

export type MoveType = {
  moveTo: CellType;
  captureAt?: CellType;
  castleSteps?: CellType[];
  rookFrom?: CellType;
  rookTo?: CellType;
};

export type Piece = {
  id: number;
  name: PieceNameType;
  row: number;
  col: number;
  color: ColorType;
  moves: MoveType[];
  hasntMoveYet: boolean;
};

export type Pawn = Piece & {
  delta: number;
  startingRow: number;
  enPassantRow: number;
};

function newPiece(id: number, name: PieceNameType, row: number, col: number, color: ColorType): Piece | Pawn {
  return {
    id,
    name,
    row,
    col,
    color,
    moves: [],
    hasntMoveYet: true,
  };
}

/**
 * Removes the piece from its original position
 * and puts it in the new position
 * @param boardPieces
 * @param piece
 * @param moveTo
 * @param isSimulation
 */
function updateBoardAndPieceWithMove(
  boardPieces: BoardPiecesType,
  piece: Piece,
  moveTo: any,
  isSimulation: boolean = false
): void {
  const { row: rowFrom, col: colFrom } = piece;
  const [rowTo, colTo] = moveTo;

  // Remove piece from the board at current position
  delete boardPieces[rowFrom][colFrom];

  // Place piece on the board at new position
  piece.row = rowTo;
  piece.col = colTo;
  piece.hasntMoveYet = false;
  putPieceOnBoard(piece, boardPieces);

  if (!isSimulation) {
    // piece.hasntMoveYet = false;
    // _imgContainers[rowFrom][colFrom].innerHTML = null;
    // _imgContainers[rowTo][colTo].innerHTML = getPieceImage(piece);
  }
}

function doMove(piece: Piece, move: MoveType): LocalMoveResult {
  const { boardPieces, colorPieces, currentColor, opositeColor, players } = gameState;
  const { moveTo, captureAt } = move;

  const [rowTo, colTo] = moveTo;

  let moveResult: LocalMoveResult = 'MOVE_SELF';

  // Capture:
  if (captureAt) {
    moveResult = 'CAPTURE';

    const [captureRow, captureCol] = captureAt;
    const captueredBoardPiece = boardPieces[captureRow][captureCol];

    // Remove captured piece from colorPieces
    const colorPieceIndex = colorPieces[opositeColor].findIndex(piece => piece.id === captueredBoardPiece.id);
    const [capturedColorPiece] = colorPieces[opositeColor].splice(colorPieceIndex, 1);

    // Add to player's captures
    players[currentColor].captures.push(capturedColorPiece);

    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      delete boardPieces[captureRow][captureCol];
      // _imgContainers[captureRow][captureCol].innerHTML = null;
    }
  }

  updateBoardAndPieceWithMove(boardPieces, piece, moveTo, false);

  // Pawn Promotion
  if (piece.name === P && (rowTo === 0 || rowTo === _Z)) {
    promotePawnAt(boardPieces, piece as Pawn, [rowTo, colTo]);
    moveResult = 'PROMOTE';
  }

  return moveResult;
}

function doCastle(king: Piece, move: MoveType): void {
  const { boardPieces } = gameState;
  const { moveTo, rookFrom, rookTo } = move;

  // Move king
  updateBoardAndPieceWithMove(boardPieces, king, moveTo);

  // Move corresponding rook
  const [_row, _col] = rookFrom!;
  const rook = boardPieces[_row][_col];
  updateBoardAndPieceWithMove(boardPieces, rook, rookTo);
}

function promotePawnAt(boardPieces: BoardPiecesType, pawn: Pawn, [row, col]: CellType): void {
  const { currentColor, colorPieces } = gameState;

  const pieceIndex = colorPieces[currentColor].findIndex(piece => piece.id === pawn.id);
  colorPieces[currentColor].splice(pieceIndex, 1);
  delete boardPieces[row][col];

  // TODO: Select which piece to promote to
  const promotedPiece = queen(pawn.id, row, col, currentColor);
  colorPieces[currentColor].push(promotedPiece);
  putPieceOnBoard(promotedPiece, boardPieces);
  // _imgContainers[row][col].innerHTML = getPieceImage(promotedPiece.name, currentColor);
}

function king(id: number, row: number, col: number, color: ColorType): Piece {
  return { ...newPiece(id, K, row, col, color) };
}

function queen(id: number, row: number, col: number, color: ColorType): Piece {
  return { ...newPiece(id, Q, row, col, color) };
}

function rook(id: number, row: number, col: number, color: ColorType): Piece {
  return { ...newPiece(id, R, row, col, color) };
}

function bishop(id: number, row: number, col: number, color: ColorType): Piece {
  return { ...newPiece(id, B, row, col, color) };
}

function knight(id: number, row: number, col: number, color: ColorType): Piece {
  return { ...newPiece(id, N, row, col, color) };
}

function pawn(id: number, row: number, col: number, color: ColorType): Pawn {
  return {
    ...newPiece(id, P, row, col, color),
    delta: color === 'w' ? -1 : 1,
    startingRow: color === 'w' ? 6 : 1,
    enPassantRow: color === 'w' ? 3 : 4,
  };
}

function getPieceImage(pieceName: PieceNameType, color: ColorType): string {
  const colorCode = color === 'w' ? 'l' : 'd';
  let pieceCode = pieceName[0];
  if (pieceName === N) pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  const filePath = `./svg/${fileName}`;
  return `<img src=${filePath} class="piece ${pieceName} ${color}"></img>`;
}

const createPiece = {
  bishop,
  king,
  knight,
  pawn,
  queen,
  rook,
};

export { createPiece, doMove, doCastle, updateBoardAndPieceWithMove, getPieceImage };
