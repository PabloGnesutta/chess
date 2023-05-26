import { _board } from '../ui/board';
import { _footer } from '../ui/footer-UI.js';
import { _roomIdElement } from '../ui/lobby-UI.js';

export type AppState = {
  isMultiplayer: boolean;
  isWSOpen: boolean;
  clientId: number;
  activeRoomId: number;
  audioReady: boolean;
};

const appState: AppState = {
  isMultiplayer: false,
  isWSOpen: false,
  clientId: 0,
  activeRoomId: 0,
  audioReady: false,
};

function resetAppState(): void {
  appState.activeRoomId = 0;
  _roomIdElement.innerText = '';
  _footer.classList.add('display-none');
  _board.classList.add('display-none');
}
export { appState, resetAppState };
