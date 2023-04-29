const { log } = require('./utils/utils');

const roomClientsLimit = 2;

const roomIds = [];
const rooms = [];

const getRoomIdIndex = roomId => roomIds.findIndex(rId => rId === roomId);

const getRoomById = roomId => {
  const roomIndex = getRoomIdIndex(roomId);
  if (roomIndex !== -1) return rooms[roomIndex];
  else return null;
};

let idCount = 0;

function createRoom(clientId) {
  const roomId = ++idCount;

  const room = {
    id: roomId,
    name: 'room_' + Date.now(),
    createdBy: clientId,
    activeClientIds: [],
  };

  rooms.push(room);
  roomIds.push(roomId);

  return room;
}

function joinOrCreateRoom(clientId) {
  let room = rooms.find(r => r.activeClientIds.length < roomClientsLimit);

  if (!room) {
    room = createRoom(clientId);
  }

  room.activeClientIds.push(clientId);

  return room;
}

function leaveRoom(roomId, clientId) {
  const room = getRoomById(roomId);
  if (!room) {
    return log('Attepted to leave non existent room');
  }

  const activeClientIndex = room.activeClientIds.findIndex(
    id => id === clientId
  );
  if (activeClientIndex === -1) {
    return log('Client not found in room');
  }

  room.activeClientIds.splice(activeClientIndex, 1);
}

// TODO: Encapsulate room-related functions in this file 

module.exports = {
  rooms,
  roomIds,
  roomClientsLimit,
  createRoom,
  joinOrCreateRoom,
  leaveRoom,
  getRoomIdIndex,
};
