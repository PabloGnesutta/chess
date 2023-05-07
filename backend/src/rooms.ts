import { Client, writeSocket } from './clients';
import { log } from './utils/utils';

let idCount = 0;

export type RoomType = {
  id: number,
  name: string,
  createdBy?: number,
  clients: Client[],
}

const roomIds: number[] = [];
const rooms: RoomType[] = [];

function getRoomIndex(roomId: number) {return roomIds.findIndex(rId => rId === roomId)};

function getRoom(roomId: number): RoomType | null {
  const roomIndex = getRoomIndex(roomId);
  if (roomIndex !== -1) return rooms[roomIndex];
  else return null;
};

function createRoom(): RoomType {
  const roomId = ++idCount;

  const room = {
    id: roomId,
    name: 'room_' + Date.now(),
    clients: [],
  };

  rooms.push(room);
  roomIds.push(roomId);

  return room;
}

function joinOrCreateRoom(client: Client): void {
  var room = rooms.find(r => r.clients.length < 2);

  if (!room) {
    room = createRoom();
  }

  client.activeRoom = room;
  client.playerColor = room.clients.length ? 'w' : 'b';

  room.clients.push(client);

  if (room.clients.length === 2) {
    // Room is ready, notify clients
    for (const roomClient of room.clients) {
      writeSocket(
        roomClient._s,
        {
          type: 'ROOM_READY',
          roomId: room.id,
          playerColor: roomClient.playerColor
        }
      );
    }
  }
}

function  removeClientAndDestroyRoom(client: Client): void {
  const room = client.activeRoom;
  if (!room) return;
  // send OPONENT_ABANDONED message to the other player (if any)
  for (const roomClient of room.clients) {
    if (roomClient.id !== client.id) {
      writeSocket(roomClient._s, { type: 'OPONENT_ABANDONED' });
    }
  }
}

export {
  getRoom,
  createRoom,
  joinOrCreateRoom,
  removeClientAndDestroyRoom,
};
