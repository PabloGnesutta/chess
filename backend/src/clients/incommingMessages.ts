import { log } from '../utils/utils';
import { makeLocalMove } from '../chess/engine/gameState';
import { validateMove } from '../chess/match/match';
import { CellType } from '../chess/types';
import { joinOrCreateRoom, sendRoomMessage } from '../rooms';
import { Client, WSMessage } from './clients';

type MoveData = {
  from: CellType;
  to: CellType;
};

// -----------------------------
// Process messages from client:
// -----------------------------

function processIncommingMessage(client: Client, msg: WSMessage): void {
  log('Incomming message', msg);

  try {
    switch (msg.type) {
      case 'JOIN_ROOM':
        return JOIN_ROOM(client);
      case 'SIGNAL_MOVE':
        return receiveMoveFromClient(client, msg.data);
      default:
        return log('---Invalid message type @processIncommingMessage');
    }
  } catch (err) {
    log('error @processIncommingMessage', err);
  }
}

function JOIN_ROOM(client: Client): void {
  // Mutates the client
  joinOrCreateRoom(client);
}

function receiveMoveFromClient(client: Client, incommingMoveData: MoveData): void {
  const room = client.activeRoom;
  if (!room) return log('---client room not found @receiveMoveFromClient');

  const state = room.match;
  if (!state) return log('---Room has no match @receiveMoveFromClient');

  try {
    const { piece, move } = validateMove(state, client, incommingMoveData.from, incommingMoveData.to);

    makeLocalMove(state, piece, move);

    // Inform oponent
    sendRoomMessage(
      room,
      {
        type: 'OPONENT_MOVED',
        data: {
          move,
          pieceId: piece.id,
        },
      },
      client.id
    );
  } catch (err) {
    log({ err, state, incommingMoveData }, '@receiveMoveFromClient');

    sendRoomMessage(room, {
      type: 'MOVE_ERROR',
      data: { errMsg: 'Error processing move', err },
    });
  }
}

export { processIncommingMessage };
