import { log, warn } from '../utils/utils';
import { CellType } from '../chess/types';
import { newMatch, validateMove } from '../chess/match/match';
import { makeLocalMoveAndPassTurn, startTurn } from '../chess/engine/gameFlow';
import { findOrCreateRoom, resetRoomMatchAndClients } from '../rooms';

import { Client, WSMessage, deleteClient } from './clients';
import { sendGameEndedToPlayer, sendMoveToOponent, sendRoomMessage, sendRoomReadyToPlayers } from './outgoingMessages';

type IncommingMoveData = {
  from: CellType;
  to: CellType;
};

function processIncommingMessage(client: Client, msg: WSMessage): void {
  log('Incomming message', msg);

  try {
    switch (msg.type) {
      case 'JOIN_ROOM':
        return JOIN_ROOM(client);
      case 'SIGNAL_MOVE':
        return PROCESS_MOVE(client, msg.data);
      case 'LEAVE_GAME':
        return LEAVE_GAME(client);
      default:
        deleteClient(client);
        return log('--- Invalid message type @processIncommingMessage');
    }
  } catch (err) {
    log('--- error @processIncommingMessage', err);
  }
}

function JOIN_ROOM(client: Client): void {
  const room = findOrCreateRoom(client);

  client.activeRoom = room;

  if (room.numActiveClients === 2) {
    room.match = newMatch(room.clients);
    startTurn(room.match);
    sendRoomReadyToPlayers(room, room.match);
  }
}

function LEAVE_GAME(client: Client): void {
  const room = client.activeRoom;
  if (!room) return warn('--- Room not assigned to client @LEAVE_GAME');
  sendRoomMessage(room, { type: 'OPONENT_ABANDONED' }, client.id);
  resetRoomMatchAndClients(room);
}

function PROCESS_MOVE(client: Client, incommingMoveData: IncommingMoveData): void {
  const room = client.activeRoom;

  if (!room) {
    deleteClient(client);
    throw new Error('--- Client has no active Room @PROCESS_MOVE');
  }

  const state = room.match;

  if (!state) {
    resetRoomMatchAndClients(room);
    throw new Error('--- Room has no Match @PROCESS_MOVE');
  }

  try {
    const { piece, move } = validateMove(state, client, incommingMoveData.from, incommingMoveData.to);

    const moveResult = makeLocalMoveAndPassTurn(state, piece, move);

    sendMoveToOponent(client.id, room, { move, pieceId: piece.id, moveResult });

    // Game ended
    if (moveResult.status) {
      if (moveResult.status !== 'CHECK') {
        log(' * * * Game ended due to ', moveResult.status, moveResult.target);
        sendGameEndedToPlayer(client, moveResult);
        resetRoomMatchAndClients(room);
      }
    }
  } catch (err) {
    warn('Error processing Move', { err, state, incommingMoveData }, '@PROCESS_MOVE');
    sendRoomMessage(room, { type: 'MOVE_ERROR' });
  }
}

export { processIncommingMessage };
