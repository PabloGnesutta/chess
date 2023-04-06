import createPiece from './js/pieces.js';
import { colorPieces } from './js/pieces.js';
import { drawBoard } from './js/board.js';
import { board, startTurn } from './js/gameState.js';
import { boardCopy, colorPiecesCopy } from './js/simulation.js';

// const initialPieces = [
//   [K, 7, 3, 'w'],

//   [K, 0, 4, 'b'],
//   [Q, 1, 3, 'b'],
//   [R, 0, 0, 'b'],
// ]
const initialPieces = [
  [K, 7, 4, 'w'],
  [Q, 7, 3, 'w'],
  [R, 7, 0, 'w'],
  [R, 7, 7, 'w'],
  [B, 7, 2, 'w'],
  [B, 7, 5, 'w'],
  [N, 7, 1, 'w'],
  [N, 7, 6, 'w'],
  [P, 6, 0, 'w'],
  [P, 6, 1, 'w'],
  [P, 6, 2, 'w'],
  [P, 6, 3, 'w'],
  [P, 6, 4, 'w'],
  [P, 6, 5, 'w'],
  [P, 6, 6, 'w'],
  [P, 6, 7, 'w'],

  [K, 0, 4, 'b'],
  [Q, 0, 3, 'b'],
  [R, 0, 0, 'b'],
  [R, 0, 7, 'b'],
  [B, 0, 2, 'b'],
  [B, 0, 5, 'b'],
  [N, 0, 1, 'b'],
  [N, 0, 6, 'b'],
  [P, 1, 0, 'b'],
  [P, 1, 1, 'b'],
  [P, 1, 2, 'b'],
  [P, 1, 3, 'b'],
  [P, 1, 4, 'b'],
  [P, 1, 5, 'b'],
  [P, 1, 6, 'b'],
  [P, 1, 7, 'b'],
];

function initGame() {
  for (let c = 0; c < initialPieces.length; c++) {
    const [type, row, col, color] = initialPieces[c];
    const piece = createPiece[type](row, col, color);
    colorPieces[color].push(piece);
    colorPiecesCopy[color].push({ ...piece });
    board.putPiece(piece);
    boardCopy.putPiece({ ...piece });
  }

  drawBoard();
  startTurn();

  log('colorPieces', colorPieces);
  log('colorPiecesCopy', colorPiecesCopy);
  // log('boardCopy', boardCopy);
}

initGame();
