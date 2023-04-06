import { drawBoard } from '../board.js';

const header = document.getElementById('header');
const flipBoard = document.getElementById('flip-board');

let pov = 'w';

flipBoard.addEventListener('click', function () {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
});
