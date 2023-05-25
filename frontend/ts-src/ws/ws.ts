import { WS_URL } from '../env.js';
import { log } from '../globals.js';
import { appState } from '../state/appState.js';
import { clientIdElement, roomIdElement } from '../ui/lobby-UI.js';

import { processIncomingMessage } from './incomingMessages.js';

export type WSMessage = {
  type: string;
  data?: any;
};

let wsSend: (payload: WSMessage) => void;

function connectWebSocket() {
  return new Promise((resolve, reject) => {
    if (appState.isWSOpen) return resolve('Connection already open');

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      appState.isWSOpen = true;
      wsSend = (payload: WSMessage) => ws.send(JSON.stringify(payload));
      resolve('Connection established');
    };

    ws.onerror = e => {
      flushSocket(ws, 'ERROR', e);
      reject(e);
    };

    ws.onmessage = e => processIncomingMessage(JSON.parse(e.data));

    ws.onclose = e => flushSocket(ws, 'CLOSE', e);
  });
}

function flushSocket(ws: WebSocket, cause: string, event: Event) {
  log('Websocket flushed due to', cause, '-', event);
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;
  ws.onopen = null;
  appState.isWSOpen = false;
  appState.clientId = 0;
  appState.activeRoomId = 0;
  roomIdElement.innerText = '';
  clientIdElement.innerText = 'Offline';
}

export { connectWebSocket, wsSend };
