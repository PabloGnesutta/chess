import { drawBoard } from '../board.js';
import { movesHistory } from '../gameState.js';

const flipBoard = document.getElementById('flip-board');
const showHistory = document.getElementById('show-history');

let pov = 'w';

flipBoard.addEventListener('click', function () {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
});

showHistory.addEventListener('click', function () {
  log(movesHistory);
});
