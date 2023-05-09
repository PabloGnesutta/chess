'use strict';

import { createPiece, ColorType } from './piecesLib.js';
import { drawBoard, drawPieces, clearLastMoveMarks } from './board.js';
import { boardPieces, colorPieces, putPieceOnBoard, resetState, startTurn } from './gameState.js';

type PieceName = 'king'|'queen'|'rook'|'bishop'|'knight'|'pawn' 

let initialPieces: [PieceName, number, number, ColorType][];
initialPieces = [
  [K, 7, 4, 'w'],
  [R, 7, 0, 'w'],
  // [R, 7, 7, 'w'],
  [P, 5, 1, 'w'],
  [K, 0, 3, 'b'],
  // [N, 3, 4, 'b'],
  [P, 1, 2, 'b'],
];
// initialPieces = [
//   [K, 7, 4, 'w'],
//   [Q, 7, 3, 'w'],
//   [R, 7, 0, 'w'],
//   [R, 7, 7, 'w'],
//   [B, 7, 2, 'w'],
//   [B, 7, 5, 'w'],
//   [N, 7, 1, 'w'],
//   [N, 7, 6, 'w'],
//   [P, 6, 0, 'w'],
//   [P, 6, 1, 'w'],
//   [P, 6, 2, 'w'],
//   [P, 6, 3, 'w'],
//   [P, 6, 4, 'w'],
//   [P, 6, 5, 'w'],
//   [P, 6, 6, 'w'],
//   [P, 6, 7, 'w'],

//   [K, 0, 4, 'b'],
//   [Q, 0, 3, 'b'],
//   [R, 0, 0, 'b'],
//   [R, 0, 7, 'b'],
//   [B, 0, 2, 'b'],
//   [B, 0, 5, 'b'],
//   [N, 0, 1, 'b'],
//   [N, 0, 6, 'b'],
//   [P, 1, 0, 'b'],
//   [P, 1, 1, 'b'],
//   [P, 1, 2, 'b'],
//   [P, 1, 3, 'b'],
//   [P, 1, 4, 'b'],
//   [P, 1, 5, 'b'],
//   [P, 1, 6, 'b'],
//   [P, 1, 7, 'b'],
// ];

function initGame(playerColor: ColorType) {
  document.getElementById('board')?.classList.remove('display-none');

  {
    // RESET STATE:
    resetState();
    clearLastMoveMarks();
  }

  {
    // INIT STATE:
    for (let i = 0; i < initialPieces.length; i++) {
      // Create pieces
      const [type, row, col, color] = initialPieces[i];
      const piece = createPiece[type](row, col, color);
      colorPieces[color].push(piece);
      // Put 'em in the board
      putPieceOnBoard(piece, boardPieces)
    }

    drawBoard(playerColor);
    drawPieces(colorPieces);
  }

  startTurn();
}

export { initGame };
