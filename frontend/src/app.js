'use strict';

import { _imgContainers, initBoard } from './js/engine/board.js';
import { state } from './js/engine/gameState.js';
import { connectWebSocket, joinRoom } from './js/ws/ws.js';
import { singlePlayerBtn, findGameBtn } from './js/ui/lobby-UI.js';
import { initGame } from './js/engine/initGame.js';
import { showModal } from './js/ui/modal.js';

function findGame() {
  state.isMultiPlayer = true;
  joinRoom();
  showModal();
}

// SINGLE PLAYER
singlePlayerBtn.onclick = e => {
  state.isMultiplayer = false;
  // TODO: Disable if it's currently in a multiplayer game
  initGame('w');
};

// MULTI PLAYER
findGameBtn.onclick = async e => {
  try {
    findGame();
  } catch (err) {
    warn('Error connecting to websocket', err);
  }
};

try {
  const connectionMessage = await connectWebSocket();
  log(connectionMessage);
} catch (err) {
  log('Error conecting to websocket', err);
}

initBoard();

// singlePlayerBtn.click();
findGameBtn.click();
