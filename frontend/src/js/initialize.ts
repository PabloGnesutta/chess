import { initAudio } from './audio/audio.js';
import { state } from './engine/gameState.js';
import { initGame } from './engine/initGame.js';
import { closeModal, m_LookingForPlayers } from './ui/modal.js';
import { connectWebSocket, joinRoom } from './ws/ws.js';

async function initApp(playMode: string) {
  initAudio();

  if (playMode === 'SOLO') {
    state.isMultiPlayer = false;
    initGame('w');
    closeModal();
  } else {
    try {
      const connectionMessage = await connectWebSocket();
      log(connectionMessage);
      state.isMultiPlayer = true;
      joinRoom();
      m_LookingForPlayers();
    } catch (err) {
      warn('Error connecting to websocket', err);
    }
  }
}

export { initApp };
