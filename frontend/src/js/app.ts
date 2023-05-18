'use strict';

import { _imgContainers, initBoard } from './engine/board.js';
import { state } from './engine/gameState.js';
import { connectWebSocket, joinRoom } from './ws/ws.js';
import { singlePlayerBtn, findGameBtn } from './ui/lobby-UI.js';
import { initGame } from './engine/initGame.js';
import { showModal } from './ui/modal.js';

// TODO: Remove all top-level async/await, they create __awaiter and __generatot functions

function findGame(): void {
  state.isMultiPlayer = true;
  joinRoom();
  showModal();
}

// SINGLE PLAYER
singlePlayerBtn!.onclick = () => {
  state.isMultiPlayer = false;
  // TODO: Disable if it's currently in a multiplayer game
  initGame('w');
};

// MULTI PLAYER
findGameBtn!.onclick = async () => {
  try {
    const connectionMessage = await connectWebSocket();
    log(connectionMessage);
    findGame();
  } catch (err) {
    warn('Error connecting to websocket', err);
  }
};

initBoard();

setTimeout(() => {
  // singlePlayerBtn!.click();
  findGameBtn!.click();
}, 300);
