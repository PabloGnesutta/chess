import { MatchState } from './chess/types';
import { Client, ClientsById, resetClient } from './clients/clients';
import { deleteMatch } from './chess/match/match';

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
  var room = rooms.find(r => r.numActiveClients < 2);

  if (!room) room = newRoom();

  room.clients[client.id] = client;
  room.numActiveClients++;

  return room;
}

function resetRoomMatchAndClients(room: RoomType): void {
  if (room.match) {
    deleteMatch(room.match.id);
  }

  for (const clientId in room.clients) {
    resetClient(room.clients[clientId]);
  }

  room.match = undefined;
  room.clients = {};
  room.numActiveClients = 0;
}

export { rooms, findOrCreateRoom, resetRoomMatchAndClients };
