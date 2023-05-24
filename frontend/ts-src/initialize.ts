import { log, warn } from './globals.js';
import { connectWebSocket } from './ws/ws.js';
import { joinRoom } from './ws/outgoingMessages.js';
import { appState } from './state/appState.js';
import { initAudio } from './audio/audio.js';
import { initGame } from './engine/gameFlow.js';
import { closeModal, m_LookingForPlayers } from './ui/modal.js';

export type PlayMode = 'SOLO' | 'ONLINE';

async function initApp(playMode: PlayMode) {
  initAudio();

  if (playMode === 'SOLO') {
    appState.isMultiplayer = false;
    initGame('w');
    closeModal();
  } else {
    try {
      const connectionMessage = await connectWebSocket();
      log(connectionMessage);
      appState.isMultiplayer = true;
      joinRoom();
      m_LookingForPlayers();
    } catch (err) {
      warn('Error connecting to websocket', err);
    }
  }
}

export { initApp };
