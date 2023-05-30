import { log, warn } from './utils/utils';
import { MatchState } from './chess/types';
import { Client, ClientsById } from './clients/clients';
import { sendRoomMessage } from './clients/outgoingMessages';

export type RoomType = {
  id: number;
  name: string;
  clients: ClientsById;
  numActiveClients: number;
  match?: MatchState;
};

const roomIds: number[] = [];

const rooms: RoomType[] = [];

var roomIdCount = 0;

function newRoom(): RoomType {
  const roomId = ++roomIdCount;

  const room: RoomType = {
    id: roomId,
    name: 'room_' + Date.now(),
    clients: {},
    numActiveClients: 0,
    match: undefined,
  };

  rooms.push(room);
  roomIds.push(roomId);

  return room;
}

function findOrCreateRoom(client: Client): RoomType {
  var room = rooms.find((r) => r.numActiveClients < 2);
  if (!room) room = newRoom();
  room.clients[client.id] = client;
  room.numActiveClients++;
  return room;
}

function resetRoomAndItsClients(room: RoomType): void {
  const match = room.match;

  if (match) {
    match.status = 'CLOSED';
    match.statusDetail = 'PLAYER_LEFT';
  }

  const clients = room.clients;
  for (const clientId in clients) {
    const client = clients[clientId];
    client.activeRoom = null;
    client.playerColor = '';
  }

  room.match = undefined;
  room.clients = {};
  room.numActiveClients = 0;
}

export { rooms, findOrCreateRoom, resetRoomAndItsClients };
