import { log } from './utils/utils';

const roomClientsLimit = 2;

let idCount = 0;

type RoomType = {
  id: number,
  name: string,
  createdBy: number,
  clients: number[],
}

const roomIds: number[] = [];
const rooms: RoomType[] = [];

const getRoomIndex = (roomId: number) => roomIds.findIndex(rId => rId === roomId);

const getRoom = (roomId: number) => {
  const roomIndex = getRoomIndex(roomId);
  if (roomIndex !== -1) return rooms[roomIndex];
  else return null;
};

const getRoomClients = (roomId: number) => {
  const room = getRoom(roomId);
  return room && room.clients || [] ;
};

function createRoom(clientId: number) {
  const roomId = ++idCount;

  const room = {
    id: roomId,
    name: 'room_' + Date.now(),
    createdBy: clientId,
    clients: [],
  };

  rooms.push(room);
  roomIds.push(roomId);

  return room;
}

function joinOrCreateRoom(clientId: number) {
  let room = rooms.find(r => r.clients.length < roomClientsLimit);

  if (!room) {
    room = createRoom(clientId);
  }

  room.clients.push(clientId);

  return room;
}

function leaveRoom(roomId: number, clientId: number) {
  const room = getRoom(roomId);
  if (!room) {
    return log('Attepted to leave non existent room');
  }

  const activeClientIndex = room.clients.findIndex(id => id === clientId);
  if (activeClientIndex === -1) {
    return log('Client not found in room');
  }

  room.clients.splice(activeClientIndex, 1);
}

// TODO: Encapsulate room-related functions in this file

export {
  rooms,
  roomIds,
  roomClientsLimit,
  getRoom,
  getRoomClients,
  createRoom,
  joinOrCreateRoom,
  leaveRoom,
  getRoomIndex,
};