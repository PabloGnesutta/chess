import { log, warn } from '../utils/utils';
import { CellType } from '../chess/types';
import { newMatch, validateMove } from '../chess/match/match';
import { makeLocalMove } from '../chess/engine/gameFlow';
import { findOrCreateRoom, clientLeftRoom } from '../rooms';

import { Client, WSMessage } from './clients';
import { sendMoveToOponent, sendRoomMessage, sendRoomReadyToPlayers } from './outgoingMessages';

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
    sendRoomReadyToPlayers(room, room.match);
  }
}

function LEAVE_GAME(client: Client): void {
  clientLeftRoom(client);
}

function PROCESS_MOVE(client: Client, incommingMoveData: IncommingMoveData): void {
  const room = client.activeRoom;

  if (!room) throw new Error('--- client room not found @PROCESS_MOVE');

  const state = room.match;

  if (!state) throw new Error('--- Room has no match @PROCESS_MOVE');

  try {
    const { piece, move } = validateMove(state, client, incommingMoveData.from, incommingMoveData.to);

    const moveResult = makeLocalMove(state, piece, move);

    sendMoveToOponent(client.id, room, { move, pieceId: piece.id, moveResult });
  } catch (err) {
    sendRoomMessage(room, { type: 'MOVE_ERROR' });
    warn('Error processing Move', { err, state, incommingMoveData }, '@PROCESS_MOVE');
  }
}

export { processIncommingMessage };
