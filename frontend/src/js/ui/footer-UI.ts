'use strict';

import { drawBoard, drawPieces } from '../engine/board.js';
import { boardPieces, colorPieces, movesHistory, state } from '../engine/gameState.js';

const footer = document.getElementById('footer');
const debug = document.getElementById('debug');

const showState = document.getElementById('show-state');
showState!.addEventListener('click', () => {
  log(state);
});

const showBoard = document.getElementById('show-board');
showBoard!.addEventListener('click', () => {
  log(boardPieces);
});

const showPieces = document.getElementById('show-pieces');
showPieces!.addEventListener('click', () => {
  log(colorPieces);
});

let pov = 'w';
const flipBoard = document.getElementById('flip-board');
flipBoard!.addEventListener('click', () => {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
  drawPieces(colorPieces);
});

const showMovesHistory = document.getElementById('show-moves-history');
showMovesHistory!.addEventListener('click', () => {
  log(movesHistory);
});

export { debug, footer };
