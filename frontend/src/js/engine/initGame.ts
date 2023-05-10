'use strict';

import { createPiece } from './piecesLib.js';
import { drawBoard, drawPieces, clearLastMoveMarks } from './board.js';
import { ColorType, boardPieces, colorPieces, PieceNameType, putPieceOnBoard, resetState, startTurn } from './gameState.js';

let initialPieces: [number, PieceNameType, number, number, ColorType][];

initialPieces = [
  [1, K, 7, 4, 'w'],
  [2, Q, 7, 3, 'w'],
  [3, R, 7, 0, 'w'],
  [4, R, 7, 7, 'w'],
  [5, B, 7, 2, 'w'],
  [6, B, 7, 5, 'w'],
  [7, N, 7, 1, 'w'],
  [8, N, 7, 6, 'w'],
  [9, P, 6, 0, 'w'],
  [10, P, 6, 1, 'w'],
  [11, P, 6, 2, 'w'],
  [12, P, 6, 3, 'w'],
  [13, P, 6, 4, 'w'],
  [14, P, 6, 5, 'w'],
  [15, P, 6, 6, 'w'],
  [16, P, 6, 7, 'w'],

  [17, K, 0, 4, 'b'],
  [18, Q, 0, 3, 'b'],
  [19, R, 0, 0, 'b'],
  [20, R, 0, 7, 'b'],
  [21, B, 0, 2, 'b'],
  [22, B, 0, 5, 'b'],
  [23, N, 0, 1, 'b'],
  [24, N, 0, 6, 'b'],
  [25, P, 1, 0, 'b'],
  [26, P, 1, 1, 'b'],
  [27, P, 1, 2, 'b'],
  [28, P, 1, 3, 'b'],
  [29, P, 1, 4, 'b'],
  [30, P, 1, 5, 'b'],
  [31, P, 1, 6, 'b'],
  [32, P, 1, 7, 'b'],
];

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
      const [id, type, row, col, color] = initialPieces[i];
      const piece = createPiece[type](id, row, col, color);
      colorPieces[color].push(piece);
      // Put 'em on the board
      putPieceOnBoard(piece, boardPieces)
    }

    drawBoard(playerColor);
    drawPieces(colorPieces);
  }

  startTurn();
}

export { initGame };
