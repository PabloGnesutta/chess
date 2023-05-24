import { log } from '../globals.js';
import { drawBoard, drawPieces } from '../engine/board.js';
import { gameState } from '../state/gameState.js';

const footer = document.getElementById('footer');
const debug = document.getElementById('debug');

const showState = document.getElementById('show-state');
showState!.addEventListener('click', () => {
  log(gameState);
});

const showBoard = document.getElementById('show-board');
showBoard!.addEventListener('click', () => {
  log(gameState.boardPieces);
});

const showPieces = document.getElementById('show-pieces');
showPieces!.addEventListener('click', () => {
  log(gameState.colorPieces);
});

let pov = 'w';
const flipBoard = document.getElementById('flip-board');
flipBoard!.addEventListener('click', () => {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
  drawPieces(gameState.colorPieces);
});

const showMovesHistory = document.getElementById('show-moves-history');
showMovesHistory!.addEventListener('click', () => {
  log(gameState.movesHistory);
});

export { debug, footer };
