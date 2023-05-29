import { log } from '../globals.js';
import { signalLeaveGameToServer } from '../ws/outgoingMessages.js';
import { appState, resetAppState } from '../state/appState.js';
import { gameState, resetGameState } from '../state/gameState.js';

import { $ } from './DOM.js';
import { m_Welcome } from './modal.js';
import { drawBoard, drawPieces } from './board.js';

const _footer = $('footer')!;
const _debug = $('debug')!;

// GAME CONTROLS:

const flipBoard = $('flip-board')!;
let pov = 'w';
flipBoard.addEventListener('click', () => {
  pov = pov === 'w' ? 'b' : 'w';
  drawBoard(pov);
  drawPieces(gameState.colorPieces);
});

const leaveGame = $('leave-game')!;
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

const showState = $('show-state')!;
showState.addEventListener('click', () => {
  log(gameState);
});

const showBoard = $('show-board')!;
showBoard.addEventListener('click', () => {
  log(gameState.boardPieces);
});

const showPieces = $('show-pieces')!;
showPieces.addEventListener('click', () => {
  log(gameState.colorPieces);
});

const showMovesHistory = $('show-moves-history')!;
showMovesHistory.addEventListener('click', () => {
  log(gameState.movesHistory);
});

export { _debug, _footer };
