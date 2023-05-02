'use strict';

import { drawBoard } from '../board.js';
import { initGame } from '../initGame.js';
import { board, makeRemoteMove, resetState, state } from '../gameState.js';
import { clientIdElement, roomIdElement } from '../ui/lobby-UI.js';
import { closeModal } from '../ui/modal.js';

// STATE
let wsSend = function () {};
let isWSOpen = false;
let clientId = null;
let activeRoomId = null;

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

function flushSocket(ws, cause, event) {
  log('Websocket flushed due to', cause, '-', event);
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;
  ws.onopen = null;
  send = null;
  isWSOpen = false;
  clientId = null;
  activeRoomId = null;
  clientIdElement.innerText = 'Offline';
  roomIdElement.innerText = '';
}

// -----------------------------
// Receive messages from server:
// -----------------------------

function processMessage(data) {
  log('Incoming message', data);
  switch (data.type) {
    case 'CLIENT_REGISTERED':
      return CLIENT_REGISTERED(data);
    case 'ROOM_JOINED':
      return ROOM_JOINED(data);
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

function CLIENT_REGISTERED(data) {
  clientId = data.clientId;
  clientIdElement.innerText = 'Online | Client ID: ' + clientId;
}

// TODO: Make room joined and room ready a single event

function ROOM_JOINED(data) {
  activeRoomId = data.room.id;
  roomIdElement.innerText = 'On Room ' + activeRoomId;
  state.playerIsColor = data.playerIsColorInRoom;
  if (data.isRoomFilledAndReady) {
    drawBoard(board, state.playerIsColor);
    initGame();
    closeModal();
  } else {
    log(' * WAITING FOR OTHER PLAYER');
  }
}

function ROOM_READY(data) {
  if (data.isRoomFilledAndReady) {
    log(' * READY TO START GAME');
    drawBoard(board, state.playerIsColor);
    initGame();
    closeModal();
  }
}

function OPONENT_MOVED(data) {
  makeRemoteMove(data.moveData);
}

function ROOM_LEFT() {
  activeRoomId = null;
  resetState();
  document.getElementById('board').classList.add('display-none');
}

function OPONENT_ABANDONED() {
  log(' * OPONENT ABANDONED, YOU WIN');
  activeRoomId = null;
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

function leaveRoom() {
  if (!activeRoomId) return warn('Not currently in a room, cannot leave');

  wsSend({ type: 'LEAVE_ROOM' });
}

function signalMove(pieceId, move) {
  wsSend({
    type: 'SIGNAL_MOVE',
    moveData: { pieceId, move },
  });
}

export { connectWebSocket, joinRoom, signalMove };
