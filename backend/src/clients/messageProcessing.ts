import { log } from '../utils/utils';
import { makeLocalMove } from '../chess/engine/gameFlow';
import { validateMove } from '../chess/match/match';
import { CellType, MoveType } from '../chess/types';
import { RoomType, joinOrCreateRoom, sendRoomMessage } from '../rooms';
import { Client, WSMessage } from './clients';

type IncommingMoveData = {
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
        return joinRoom(client);
      case 'SIGNAL_MOVE':
        return processMove(client, msg.data);
      default:
        return log('---Invalid message type @processIncommingMessage');
    }
  } catch (err) {
    log('---error @processIncommingMessage', err);
  }
}

function joinRoom(client: Client): void {
  // Mutates the client
  joinOrCreateRoom(client);
}

function processMove(client: Client, incommingMoveData: IncommingMoveData): void {
  const room = client.activeRoom;

  if (!room) throw new Error('---client room not found @processMove');

  const state = room.match;

  if (!state) throw new Error('---Room has no match @processMove');

  try {
    const { piece, move } = validateMove(state, client, incommingMoveData.from, incommingMoveData.to);

    makeLocalMove(state, piece, move);

    sendMoveToOponent(client.id, room, move, piece.id);
  } catch (err) {
    sendRoomMessage(room, {
      type: 'MOVE_ERROR',
      data: { errMsg: 'Error processing move', err },
    });

    log({ err, state, incommingMoveData }, '@processMove');
  }
}

function sendMoveToOponent(clientId: number, room: RoomType, move: MoveType, pieceId: number): void {
  sendRoomMessage(
    room,
    {
      type: 'OPONENT_MOVED',
      data: {
        move,
        pieceId,
      },
    },
    clientId
  );
}

export { processIncommingMessage };
