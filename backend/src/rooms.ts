import { newMatch } from './chess/match/match';
import { MatchState } from './chess/types';
import { Client, writeSocket } from './clients';
import { log } from './utils/utils';

let roomIdCount = 0;

export type RoomType = {
  id: number;
  name: string;
  createdBy?: number;
  clients: { [key: number]: Client };
  numActiveClients: number;
  match?: MatchState;
};

const roomIds: number[] = [];
const rooms: RoomType[] = [];

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

  const room: RoomType = {
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

  if (!room) {
    room = createRoom();
  }

  room.clients[client.id] = client;
  room.numActiveClients++;

  client.activeRoom = room;

  if (room.numActiveClients === 2) {
    // Room is ready. Create match & notify clients

    const clientIds: number[] = [];
    for (const clientId in room.clients) {
      clientIds.push(parseInt(clientId));
    }
    const match: MatchState = newMatch(clientIds);

    room.match = match;
    // log('match', match);

    // log('room', room);

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

export { getRoom, createRoom, joinOrCreateRoom, removeClientAndDestroyRoom };
