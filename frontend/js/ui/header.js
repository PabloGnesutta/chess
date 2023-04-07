import { drawBoard } from '../board.js';
import { board, colorPieces, movesHistory, boardHistory } from '../gameState.js';

const showBoard = document.getElementById('show-board');
showBoard.addEventListener('click', function () {
  log(board);
});

const showPieces = document.getElementById('show-pieces');
showPieces.addEventListener('click', function () {
  log(colorPieces);
});

let pov = 'w';
const flipBoard = document.getElementById('flip-board');
flipBoard.addEventListener('click', function () {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
});

const showMovesHistory = document.getElementById('show-moves-history');
showMovesHistory.addEventListener('click', function () {
  log(movesHistory);
});

const showBoardHistory = document.getElementById('show-board-history');
showBoardHistory.addEventListener('click', function () {
  log(boardHistory);
});
