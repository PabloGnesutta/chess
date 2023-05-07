'use strict';

import { initGame } from '../engine/initGame.js';
import { makeRemoteMove, resetState, state } from '../engine/gameState.js';
import { clientIdElement, roomIdElement } from '../ui/lobby-UI.js';
import { closeModal } from '../ui/modal.js';

// STATE
let wsSend = function () {};
let isWSOpen = false;
let clientId = null;
let activeRoomId: number = 0;

function connectWebSocket() {
  return new Promise((resolve, reject) => {
    if (isWSOpen) return resolve('Connection already open');

    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = e => {
      isWSOpen = true;
      wsSend = jsonPayload => ws.send(JSON.stringify(jsonPayload));
      resolve('Connection established');
    };

    ws.onerror = e => {
      flushSocket(ws, 'ERROR', e);
      reject(e);
    };

    ws.onmessage = e => processMessage(JSON.parse(e.data));

    ws.onclose = e => flushSocket(ws, 'CLOSE', e);
  });
}

function flushSocket(ws: WebSocket, cause: string, event: Event) {
  log('Websocket flushed due to', cause, '-', event);
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;
  ws.onopen = null;
  wsSend = null;
  isWSOpen = false;
  clientId = null;
  activeRoomId = 0;
  clientIdElement.innerText = 'Offline';
  roomIdElement.innerText = '';
}

// -----------------------------
// Receive messages from server:
// -----------------------------

function processMessage(data: any): void {
  log('Incoming message', data);
  switch (data.type) {
    case 'CLIENT_REGISTERED':
      return CLIENT_REGISTERED(data);
    case 'ROOM_READY':
      return ROOM_READY(data);
    case 'ROOM_LEFT':
      return ROOM_LEFT(data);
    case 'OPONENT_MOVED':
      return OPONENT_MOVED(data);
    case 'OPONENT_ABANDONED':
      return OPONENT_ABANDONED(data);
    default:
      return log('Message type not supported');
  }
}

function CLIENT_REGISTERED(data: any): void {
  clientId = data.clientId;
  clientIdElement.innerText = 'Online | Client ID: ' + clientId;
}

function ROOM_READY(data) {
  log(' * READY TO START GAME');
  activeRoomId = data.roomId;
  roomIdElement.innerText = 'On Room ' + activeRoomId;
  state.playerColor = data.playerColor;
  initGame(state.playerColor);
  closeModal();
}

function OPONENT_MOVED(data) {
  makeRemoteMove(data.moveData);
}

function ROOM_LEFT() {
  activeRoomId = 0;
  resetState();
  document.getElementById('board').classList.add('display-none');
}

function OPONENT_ABANDONED() {
  log(' * OPONENT ABANDONED, YOU WIN');
  activeRoomId = 0;
  resetState();
  document.getElementById('board').classList.add('display-none');
}

// ------------------------
// Send messages to server:
// ------------------------

function joinRoom() {
  if (activeRoomId)
    return warn('Leave the current room before joining another one');

  wsSend({ type: 'JOIN_ROOM' });
}

function signalMove(pieceId, move) {
  wsSend({
    type: 'SIGNAL_MOVE',
    moveData: { pieceId, move },
  });
}

export { connectWebSocket, joinRoom, signalMove };
