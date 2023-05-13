import { log } from './utils/utils';
import { MatchState } from './chess/types';
import { newMatch } from './chess/match/match';
import { Client, WSPayloadType } from './clients/clients';
import { writeSocket } from './clients/websocket';

export type ClientsById = { [key: number]: Client };

export type RoomType = {
  id: number;
  name: string;
  createdBy?: number;
  clients: ClientsById;
  numActiveClients: number;
  match?: MatchState;
};

const roomIds: number[] = [];

const rooms: RoomType[] = [];

var roomIdCount = 0;

function getRoomIndex(roomId: number) {
  return roomIds.findIndex(rId => rId === roomId);
}

function getRoom(roomId: number): RoomType | null {
  const roomIndex = getRoomIndex(roomId);
  if (roomIndex !== -1) return rooms[roomIndex];
  else return null;
}

function createRoom(): RoomType {
  const roomId = ++roomIdCount;

  const room = {
    id: roomId,
    name: 'room_' + Date.now(),
    clients: [],
    numActiveClients: 0,
  };

  rooms.push(room);
  roomIds.push(roomId);

  return room;
}

function joinOrCreateRoom(client: Client): void {
  var room = rooms.find(r => r.numActiveClients < 2);

  if (!room) room = createRoom();

  room.clients[client.id] = client;
  room.numActiveClients++;

  client.activeRoom = room;

  if (room.numActiveClients === 2) {
    // Room is ready. Create match & notify clients

    const match: MatchState = newMatch(room.clients);

    room.match = match;

    sendRoomReadyToPlayers(room, match);
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
        roomId: room.id,
        playerColor: color,
      },
    });
  }
}

function removeClientAndDestroyRoom(client: Client): void {
  const room = client.activeRoom;

  if (!room) return;

  // send OPONENT_ABANDONED message to the other player (if any)
  for (const clientId in room.clients) {
    const roomClient = room.clients[clientId];

    if (roomClient.id !== client.id) {
      writeSocket(roomClient._s, { type: 'OPONENT_ABANDONED', data: {} });
    }
  }
}

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

export { getRoom, createRoom, joinOrCreateRoom, removeClientAndDestroyRoom, sendRoomMessage };
