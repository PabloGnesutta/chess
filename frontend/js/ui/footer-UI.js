'use strict';

import { drawBoard } from '../board.js';
import {
  board,
  pieces,
  movesHistory,
  boardHistory,
  state,
} from '../gameState.js';

const showState = document.getElementById('show-state');
showState.addEventListener('click', () => {
  log(state);
});

const showBoard = document.getElementById('show-board');
showBoard.addEventListener('click', () => {
  log(board);
});

const showPieces = document.getElementById('show-pieces');
showPieces.addEventListener('click', () => {
  log(pieces);
});

let pov = 'w';
const flipBoard = document.getElementById('flip-board');
flipBoard.addEventListener('click', () => {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(board, pov);
});

const showMovesHistory = document.getElementById('show-moves-history');
showMovesHistory.addEventListener('click', () => {
  log(movesHistory);
});

const showBoardHistory = document.getElementById('show-board-history');
showBoardHistory.addEventListener('click', () => {
  log(boardHistory);
});
