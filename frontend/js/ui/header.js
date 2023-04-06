import { drawBoard } from '../board.js';
import { movesHistory, boardHistory } from '../gameState.js';

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
