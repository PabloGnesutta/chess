'use strict';

import { InitialPieces, initGame } from '../engine/initGame.js';
import { CellType, ColorType, makeRemoteMove, resetState, state } from '../engine/gameState.js';
import { clientIdElement, roomIdElement } from '../ui/lobby-UI.js';
import { closeModal } from '../ui/modal.js';
import { MoveType } from '../engine/piecesLib.js';
import { WS_URL } from '../env.js';
 
type WSMessage = {
  type: string;
  data: any;
};

// STATE
let wsSend: (payload: WSMessage) => void;
// let wsSend = function (payload: WSMessage): void {};
let isWSOpen = false;
let clientId = null;
let activeRoomId: number = 0;

function connectWebSocket() {
  return new Promise((resolve, reject) => {
    if (isWSOpen) return resolve('Connection already open');

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      isWSOpen = true;
      wsSend = (payload: WSMessage) => ws.send(JSON.stringify(payload));
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
  isWSOpen = false;
  clientId = null;
  activeRoomId = 0;
  clientIdElement!.innerText = 'Offline';
  roomIdElement!.innerText = '';
}

// -----------------------------
// Receive messages from server:
// -----------------------------

function processMessage(msg: WSMessage): void {
  log('Incoming message', msg);
  switch (msg.type) {
    case 'CLIENT_REGISTERED':
      return CLIENT_REGISTERED(msg.data);
    case 'ROOM_READY':
      return ROOM_READY(msg.data);
    case 'ROOM_LEFT':
      return ROOM_LEFT();
    case 'OPONENT_MOVED':
      return OPONENT_MOVED(msg.data);
    case 'OPONENT_ABANDONED':
      return OPONENT_ABANDONED();
    default:
      return log('Message type not supported');
  }
}

function CLIENT_REGISTERED(data: any): void {
  clientId = data.clientId;
  clientIdElement!.innerText = 'Online | Client ID: ' + clientId;
}

// todo: add to backend
type RoomReady = {
  roomId: number;
  playerColor: ColorType;
  initialPieces: InitialPieces;
};

function ROOM_READY(data: RoomReady) {
  log(' * READY TO START GAME');
  activeRoomId = data.roomId;
  roomIdElement!.innerText = 'On Room ' + activeRoomId;
  state.playerColor = data.playerColor;
  initGame(state.playerColor, data.initialPieces);
  closeModal();
}

export type MoveData = {
  pieceId: number;
  move: MoveType;
};

function OPONENT_MOVED(data: MoveData) {
  makeRemoteMove(data);
}

function ROOM_LEFT() {
  activeRoomId = 0;
  resetState();
  document.getElementById('board')?.classList.add('display-none');
}

function OPONENT_ABANDONED() {
  log(' * OPONENT ABANDONED, YOU WIN');
  activeRoomId = 0;
  resetState();
  document.getElementById('board')?.classList.add('display-none');
}

// ------------------------
// Send messages to server:
// ------------------------

function joinRoom() {
  if (activeRoomId) return warn('Leave the current room before joining another one');

  wsSend({ type: 'JOIN_ROOM', data: {} });
}

function signalMoveToServer(from: CellType, to: CellType) {
  wsSend({
    type: 'SIGNAL_MOVE',
    data: { from, to },
  });
}

export { connectWebSocket, joinRoom, signalMoveToServer };
