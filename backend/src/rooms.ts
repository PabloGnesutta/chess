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
  var room = rooms.find(r => r.numActiveClients < 2);
  if (!room) room = newRoom();
  room.clients[client.id] = client;
  room.numActiveClients++;
  return room;
}

function resetRoomsClientsAndInformOponent(room: RoomType, initiator: Client) {
  const clients = room.clients;
  for (const clientId in clients) {
    const client = clients[clientId];
    client.activeRoom = null;
    client.playerColor = '';
  }

  sendRoomMessage(room, { type: 'OPONENT_ABANDONED' }, initiator.id);
}

/**
 * Resets the room's clients, numActiveClients and match properties.
 * Reset the room clients' activeRoom and playerColor properties.
 * Closes the match if it exists: set its status to CLOSED.
 * Informs the other player that the current player abandoned the game.
 * @param {Client} client
 * @returns {void}
 */
function clientLeftRoom(client: Client): void {
  const room = client.activeRoom;

  if (!room) return warn(`--- room property not set in client ${client.id} @clientLeftRoom`);

  const match = room.match;

  if (match) {
    match.status = 'CLOSED';
    match.statusDetail = 'PLAYER_LEFT';
  }

  resetRoomsClientsAndInformOponent(room, client);

  room.match = undefined;
  room.clients = {};
  room.numActiveClients = 0;
}

export { rooms, findOrCreateRoom, clientLeftRoom };
