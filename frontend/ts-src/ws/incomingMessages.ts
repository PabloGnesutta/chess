import { log } from '../globals.js';
import { appState, resetAppState } from '../state/appState.js';
import { ColorType, gameState, resetGameState } from '../state/gameState.js';
import { InitialPieces, initGame, makeRemoteMove } from '../engine/gameFlow.js';
import { MoveType } from '../engine/piecesLib.js';
import { closeModal, m_OponentAbandoned } from '../ui/modal.js';
import { clientIdElement, roomIdElement } from '../ui/lobby-UI.js';

import { WSMessage } from './ws.js';

export type MoveData = {
  pieceId: number;
  move: MoveType;
};
type RoomReady = {
  roomId: number;
  playerColor: ColorType;
  initialPieces: InitialPieces;
};

function processIncomingMessage(msg: WSMessage): void {
  log('Incoming message', msg);
  switch (msg.type) {
    case 'CLIENT_REGISTERED':
      return CLIENT_REGISTERED(msg.data);
    case 'ROOM_READY':
      return ROOM_READY(msg.data);
    case 'OPONENT_MOVED':
      return OPONENT_MOVED(msg.data);
    case 'OPONENT_ABANDONED':
      return OPONENT_ABANDONED();
    // case 'ROOM_LEFT':
    //   return ROOM_LEFT();
    default:
      return log('Message type not supported');
  }
}

function CLIENT_REGISTERED(data: any): void {
  appState.clientId = data.clientId;
  clientIdElement.innerText = 'Online | Client ID: ' + data.clientId;
}

function ROOM_READY(data: RoomReady) {
  log(' * READY TO START GAME');
  appState.activeRoomId = data.roomId;
  gameState.playerColor = data.playerColor;
  roomIdElement.innerText = 'On Room ' + data.roomId;

  initGame(gameState.playerColor, data.initialPieces);
  closeModal();
}

function OPONENT_MOVED(data: MoveData) {
  makeRemoteMove(data);
}

function OPONENT_ABANDONED() {
  log(' * OPONENT ABANDONED, YOU WIN');
  resetGameState();
  resetAppState();
  m_OponentAbandoned();
}

// function ROOM_LEFT() {
//   resetGameState();
//   resetAppState();
// }

export { processIncomingMessage };
