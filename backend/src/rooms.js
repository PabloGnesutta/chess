const { log } = require('./utils/utils');

const rooms = [];

let idCount = 0;

function createRoom(clientId) {
  roomId = ++idCount;

  const room = {
    id: roomId,
    name: 'room_' + Date.now(),
    createdBy: clientId,
    peopleLimit: 2,
    activeClientIds: [],
    activeClientsCount: 0,
  };
  rooms.push(room);

  return room;
}

function joinRandomRoom(clientId) {
  let isCreator = false;
  let room = rooms.find(r => r.activeClientsCount < r.peopleLimit);
  if (!room) {
    isCreator = true;
    room = createRoom(clientId);
  }

  room.activeClientIds.push(clientId);
  room.activeClientsCount++;

  return { room, isCreator };
}

function leaveRoom(roomId, clientId) {
  const room = room.find(r => r.id === roomId);
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
  room.activeClientsCount--;
}

module.exports = {
  rooms,
  createRoom,
  joinRandomRoom,
  leaveRoom,
};
