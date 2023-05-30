import { log, warn } from '../globals.js';
import { appState, resetAppState } from '../state/appState.js';
import { ColorType, gameState, resetGameState } from '../state/gameState.js';
import { InitialPieces, initGame, makeRemoteMove } from '../engine/gameFlow.js';
import { MoveType } from '../engine/piecesLib.js';
import { closeModal, m_OponentAbandoned } from '../ui/modal.js';
import { _clientIdElement, _roomIdElement } from '../ui/lobby-UI.js';

import { WSMessage } from './ws.js';

type IncommingRoomReadyData = {
  roomId: number;
  playerColor: ColorType;
  initialPieces: InitialPieces;
};

type IncommingMoveResultStatus = 'CHECK' | 'CHECKMATE' | 'STALEMATE_BY_DRAWN_KING' | 'STALEMATE_BY_REPETITION' | '';

type IncommingMoveResult = {
  status: IncommingMoveResultStatus;
  target: string;
};

type IncommingGameEndedData = {
  moveResult: IncommingMoveResult;
};

export type IncommingMoveData = {
  pieceId: number;
  move: MoveType;
  moveResult: IncommingMoveResult;
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
    case 'OPONENT_DISCONECTED':
      return OPONENT_ABANDONED();
    case 'GAME_ENDED':
      return GAME_ENDED(msg.data);
    default:
      return warn('--- Message type not supported');
  }
}

function CLIENT_REGISTERED(data: any): void {
  appState.clientId = data.clientId;
  _clientIdElement.innerText = 'Online | Client ID: ' + data.clientId;
}

function ROOM_READY(data: IncommingRoomReadyData) {
  appState.activeRoomId = data.roomId;
  gameState.playerColor = data.playerColor;
  _roomIdElement.innerText = 'On Room ' + data.roomId;

  initGame(gameState.playerColor, data.initialPieces);
  closeModal();
}

function OPONENT_MOVED(data: IncommingMoveData) {
  makeRemoteMove(data);
}

function GAME_ENDED(data: IncommingGameEndedData) {
  log('GAME ENDED', data);
}

function OPONENT_ABANDONED() {
  resetGameState();
  resetAppState();
  m_OponentAbandoned();
}

export { processIncomingMessage };
