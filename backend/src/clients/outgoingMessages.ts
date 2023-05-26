import { initialPieces } from '../chess/constants';
import { MoveResult } from '../chess/engine/gameFlow';
import { MatchState, MoveType } from '../chess/types';
import { RoomType } from '../rooms';

import { WSPayloadType } from './clients';
import { writeSocket } from './websocket';

export type MoveDataPayload = {
  move: MoveType;
  pieceId: number;
  moveResult: MoveResult;
};

/**
 * Send message to all clients in the room.
 * If exceptClientId is provided, do not send to that client.
 * @param {RoomType} room
 * @param {JSON} msg
 * @param {number} exceptClientId
 * @returns {void}
 */
function sendRoomMessage(room: RoomType, payload: WSPayloadType, exceptClientId?: number): void {
  const roomClients = room.clients;

  for (const clientId in roomClients) {
    const roomClient = roomClients[clientId];

    if (roomClient.id !== exceptClientId) {
      writeSocket(roomClient._s, payload);
    }
  }
}

function sendRoomReadyToPlayers(room: RoomType, match: MatchState) {
  for (const color in match.players) {
    const player = match.players[color];

    const client = room.clients[player.clientId];

    client.playerColor = color;

    writeSocket(client._s, {
      type: 'ROOM_READY',
      data: {
        initialPieces,
        roomId: room.id,
        playerColor: color,
      },
    });
  }
}

function sendMoveToOponent(clientId: number, room: RoomType, moveData: MoveDataPayload): void {
  sendRoomMessage(room, { type: 'OPONENT_MOVED', data: moveData }, clientId);
}

export { sendMoveToOponent, sendRoomMessage, sendRoomReadyToPlayers };
