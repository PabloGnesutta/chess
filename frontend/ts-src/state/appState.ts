import { _board } from '../ui/board.js';
import { _footer } from '../ui/footer-UI.js';
import { _mvHistory } from '../ui/mvHistory.js';
import { _roomIdElement } from '../ui/lobby-UI.js';

type ViewMode = 'GAME' | 'HISTORY';

export type AppState = {
  isMultiplayer: boolean;
  isWSOpen: boolean;
  clientId: number;
  activeRoomId: number;
  audioReady: boolean;
  viewMode: ViewMode;
};

const appState: AppState = {
  isMultiplayer: false,
  isWSOpen: false,
  clientId: 0,
  activeRoomId: 0,
  audioReady: false,
  viewMode: 'GAME',
};

function resetAppState(): void {
  appState.activeRoomId = 0;
  resetUIState();
}

function resetUIState(): void {
  _roomIdElement.innerText = '';
  _footer.classList.add('display-none');
  _board.classList.add('display-none');
  _mvHistory.innerHTML = '';
}

export { appState, resetAppState };
