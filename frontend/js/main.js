import piecesLib from "./pieces.js";
import boardLib from "./board.js";

const { pieces } = piecesLib;
const { board, drawBoard } = boardLib;

const initialPieces = [
  [P, 2, 0, 'b'],
  // [P, 2, 1, 'b'],
  // [P, 2, 2, 'b'],
  // [P, 2, 3, 'b'],
  // [P, 2, 4, 'b'],
  [P, 2, 5, 'b'],
  // [P, 2, 6, 'b'],
  // [P, 2, 7, 'b'],
  [B, 0, 2, 'b'],
  // [B, 4, 3, 'w'],
  [K, 5, 6, 'b'],
  [N, 3, 1, 'w'],
  [N, 3, 0, 'w'],
  [R, 3, 4, 'b'],
  [Q, 3, 2, 'w'],
  [P, 6, 0, 'w'],
  [P, 6, 1, 'w'],
  [P, 6, 2, 'w'],
  [P, 6, 3, 'w'],
  [P, 6, 4, 'w'],
  [P, 6, 5, 'w'],
  [P, 6, 6, 'w'],
  [P, 6, 7, 'w'],
];


function initGame() {
  for (let c = 0; c < initialPieces.length; c++) {
    const [pieceType, row, col, color] = initialPieces[c];
    const piece = piecesLib[pieceType](row, col, color);
    pieces.push(piece);
    board.putPiece(piece);
  }

  drawBoard();
};

initGame();

// setInterval(() => {
//   log(piecesLib.selectedPiece);
// }, 1000);