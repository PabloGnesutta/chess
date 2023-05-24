import { log, warn } from './globals.js';
import { connectWebSocket, joinRoom } from './ws/ws.js';
import { appState } from './state/appState.js';
import { initGame } from './engine/gameFlow.js';
import { initializeBoard } from './engine/board.js';
import { m_LookingForPlayers, m_Welcome } from './ui/modal.js';
import { singlePlayerBtn, findGameBtn } from './ui/lobby-UI.js';

// TODO: Remove all top-level async/await, they create __awaiter and __generatot functions

function findGame(): void {
  appState.isMultiplayer = true;
  joinRoom();
  m_LookingForPlayers();
}

// SINGLE PLAYER
singlePlayerBtn!.onclick = () => {
  appState.isMultiplayer = false;
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

initializeBoard();

setTimeout(() => {
  // singlePlayerBtn!.click();
  // findGameBtn!.click();
}, 300);

m_Welcome();
