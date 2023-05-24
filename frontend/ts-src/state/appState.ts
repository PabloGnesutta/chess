import { footer } from '../ui/footer-UI.js';
import { roomIdElement } from '../ui/lobby-UI.js';

export type AppState = {
  isMultiplayer: boolean;
  isWSOpen: boolean;
  clientId: number;
  activeRoomId: number;
};

const appState: AppState = {
  isMultiplayer: false,
  isWSOpen: false,
  clientId: 0,
  activeRoomId: 0,
};

function resetAppState(): void {
  appState.activeRoomId = 0;
  roomIdElement.innerText = '';
  footer.classList.add('display-none');
  document.getElementById('board')!.classList.add('display-none');
}
export { appState, resetAppState };