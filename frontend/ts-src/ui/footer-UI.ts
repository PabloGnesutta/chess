import { log } from '../globals.js';
import { signalLeaveGameToServer } from '../ws/outgoingMessages.js';
import { appState, resetAppState } from '../state/appState.js';
import { gameState, resetGameState } from '../state/gameState.js';

import { drawBoard, drawPieces } from './board.js';

import { m_Welcome } from './modal.js';

const _footer = document.getElementById('footer')!;
const _debug = document.getElementById('debug')!;

// GAME CONTROLS:

const flipBoard = document.getElementById('flip-board')!;
let pov = 'w';
flipBoard.addEventListener('click', () => {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
  drawPieces(gameState.colorPieces);
});

const leaveGame = document.getElementById('leave-game')!;
leaveGame.addEventListener('click', () => {
  if (!confirm('Sure you want to leave the current game?')) return;

  if (appState.isMultiplayer) {
    signalLeaveGameToServer();
  }

  resetAppState();
  resetGameState();
  m_Welcome();
});

// DEBUG CONTROLS:

const showState = document.getElementById('show-state')!;
showState.addEventListener('click', () => {
  log(gameState);
});

const showBoard = document.getElementById('show-board')!;
showBoard.addEventListener('click', () => {
  log(gameState.boardPieces);
});

const showPieces = document.getElementById('show-pieces')!;
showPieces.addEventListener('click', () => {
  log(gameState.colorPieces);
});

const showMovesHistory = document.getElementById('show-moves-history')!;
showMovesHistory.addEventListener('click', () => {
  log(gameState.movesHistory);
});

export { _debug, _footer };
