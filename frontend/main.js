import { _imgContainers, drawBoard } from './js/board.js';
import { board, state } from './js/gameState.js';
import { connectWebSocket, joinRoom } from './js/ws/ws.js';
import { singlePlayerBtn, multiPlayerBtn } from './js/ui/lobby-UI.js';
import { initGame } from './js/initGame.js';

// SINGLE PLAYER
singlePlayerBtn.onclick = e => {
  state.isMultiplayer = false;
  drawBoard(board);
  initGame();
};

// MULTI PLAYER
multiPlayerBtn.onclick = async e => {
  try {
    await connectWebSocket();
    state.isMultiPlayer = true;
    joinRoom();
  } catch (error) {
    warn('error connecting to websocket', error);
  }
};
