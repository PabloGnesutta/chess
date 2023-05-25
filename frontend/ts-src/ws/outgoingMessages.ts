import { warn } from '../globals.js';
import { appState } from '../state/appState.js';
import { CellType } from '../state/gameState.js';

import { wsSend } from './ws.js';

function joinRoom() {
  if (appState.activeRoomId) return warn('Leave the current room before joining another one');

  wsSend({ type: 'JOIN_ROOM' });
}

function signalMoveToServer(from: CellType, to: CellType) {
  wsSend({
    type: 'SIGNAL_MOVE',
    data: { from, to },
  });
}

function signalLeaveGameToServer(): void {
  if (!appState.activeRoomId) return warn('Not currently in a room');

  wsSend({ type: 'LEAVE_GAME' });
}

export { joinRoom, signalLeaveGameToServer, signalMoveToServer };
