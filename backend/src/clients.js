const { joinRandomRoom, rooms } = require('./rooms');
const { log } = require('./utils/utils');

const WS_MAX_RESPONSE_LENGTH = 65535;

const clientIds = [];
const clientsData = [];
const sockets = [];

const getClientIdIndex = id => clientIds.findIndex(cId => cId === id);

let idCount = 0;

/**
 * Register new web socket client
 * @param {Socket} _s
 */
function registerClient(_s) {
  const clientId = ++idCount;

  sockets.push(_s);
  clientIds.push(clientId);
  clientsData.push({
    // id: clientId,
    roomIsIn: null,
  });

  sendMessage(_s, { type: 'CLIENT_REGISTERED', clientId });

  _s.on('readable', () => readSocket(_s, clientId));

  _s.on('close', () => flushSocket(_s, clientId));

  _s.on('end', () => log('end'));
  _s.on('error', () => log('error'));

  // _s.on('data', chunk => {});
}

function flushSocket(_s, clientId) {
  log('socket closed');

  _s.destroy();
  const clientIdIndex = getClientIdIndex(clientId);

  const roomIsIn = clientsData[clientIdIndex].roomIsIn;

  // Remove client from room and finish match if existent
  if (roomIsIn) {
    const room = rooms.find(room => room.id === roomIsIn);
    if (room) {
      log('leaving room', clientId);
      const room = rooms.find(r => r.id === roomIsIn);
      if (!room) return log(' * Room does not exist @LEAVE_ROOM');

      let roomClientIndex = -1;
      for (let i = 0; i <= room.activeClientIds.length; i++) {
        roomClientIndex = i;
        const roomClientId = room.activeClientIds[roomClientIndex];
        if (clientId === roomClientId) {
          sendMessage(_s, { type: 'ROOM_LEFT', roomId: roomIsIn });
        } else {
          const clientIdIndex = getClientIdIndex(roomClientId);
          if (clientIdIndex !== -1) {
            sendMessage(sockets[clientIdIndex], {
              type: 'OPONENT_ABANDONED',
              roomId: roomIsIn,
            });
          } else {
            log(' * Could not find client to send OPONENT_ABANDONED message');
          }
        }
      }
    } else {
      log('could not find room @flushSocket');
    }
  }

  sockets.splice(clientIdIndex, 1);
  clientIds.splice(clientIdIndex, 1);
  clientsData.splice(clientIdIndex, 1);
}

function sendMsgToChannel(roomId, msg, exceptClientId) {
  const room = rooms.find(r => r.id === roomId);
  if (!room) return log(' * Room not found @sendMsgToChannel');

  const roomClientIds = room.activeClientIds;

  roomClientIds.forEach(roomClientId => {
    if (roomClientId !== exceptClientId) {
      const clientIdIndex = getClientIdIndex(roomClientId);
      if (clientIdIndex !== -1) {
        sendMessage(sockets[clientIdIndex], msg);
      } else {
        log(' * client not found in room @sendMsgToChannel');
      }
    }
  });
}

function processMessage(_s, clientId, data) {
  log(' - @processMessage', data);
  // sendMessage(_s, { type: 'ACKNOWLEDGE', clientId });

  switch (data.type) {
    case 'JOIN_ROOM': {
      const room = joinRandomRoom(clientId);
      const isRoomFilledAndReady =
        room.activeClientIds.length === room.peopleLimit;

      clientsData[getClientIdIndex(clientId)].roomIsIn = room.id;

      sendMessage(_s, {
        type: 'ROOM_JOINED',
        room,
        isRoomFilledAndReady,
        playerIsColorInRoom: room.activeClientIds.length === 1 ? 'w' : 'b',
      });

      if (isRoomFilledAndReady) {
        sendMsgToChannel(
          room.id,
          {
            type: 'ROOM_READY',
            room,
            isRoomFilledAndReady,
          },
          clientId
        );
      }
      break;
    }

    case 'SIGNAL_MOVE': {
      const clientIdIndex = getClientIdIndex(clientId);
      const roomId = clientsData[clientIdIndex].roomIsIn;
      sendMsgToChannel(
        roomId,
        {
          type: 'OPONENT_MOVED',
          moveData: data.moveData,
        },
        clientId
      );
      break;
    }

    case 'LEAVE_ROOM': {
      break;
    }

    case 'ROOM_MESSAGE':
      break;

    default:
      log(' * Invalid message type');
      break;
  }
}

/**
 * @param {Socket} _s
 * @returns {void}
 */
function readSocket(_s, clientId) {
  const [b1] = _s.read(1);

  // if first bit=1, this is the final frame of the current message
  if (!(b1 & 0x80) === 0x80) {
    // 0x80=1000
    log('FIN=0. Message will continue on subsecuent frames');
  }

  const opCode = b1 & 0xf; // 0xF=1111

  switch (opCode) {
    case 0x0:
      log(' - opCode=0. Message will continue on subsecuent frames');
      break;
    case 0x1:
      log(' - Text frame');
      break;
    case 0x2:
      log(' - Binary frame: not supported');
      _s.destroy();
      return;
    case 0x8:
      log(' - Connection closed');
      _s.destroy();
      return;
    default:
      log(' - opCode not supported: ', opCode);
      _s.destroy();
      return;
  }

  const [b2] = _s.read(1);

  // if first bit=1, message is masked
  if (!(b2 & 0x80) === 0x80) {
    log('Message not masked!');
    return;
  }

  // 7 bits
  let payloadLen = b2 & 0x7f; // 0x7f=01111111

  if (payloadLen > 125) {
    if (payloadLen === 126) {
      // 16 bits
      const [_a] = _s.read(1);
      const [_b] = _s.read(1);
      payloadLen = parseInt(_a.toString(2) + _b.toString(2), 2);
    } else {
      // 64 bits messages not supported
      log(' * Payload too large');
      return;
    }
  }

  const maskKey = _s.read(4);
  const maskedData = _s.read(payloadLen);

  const unmaskedData = Buffer.allocUnsafe(payloadLen);
  for (let i = 0; i <= maskedData.length; i++) {
    unmaskedData[i] = maskedData[i] ^ maskKey[i % 4];
  }

  try {
    const jsonData = JSON.parse(unmaskedData);
    processMessage(_s, clientId, jsonData);
  } catch (error) {
    return log('Invalid JSON:', unmaskedData);
  }

  // Excess data. Should never reach here.
  let b = _s.read(1);
  if (b) {
    log('excess data');
    while ((b = _s.read(1))) {
      log('  b:', b);
    }
  }
}

/**
 *
 * @param {Socket} _s
 * @param {JSON} _msg
 * @returns {void}
 */
function sendMessage(_s, _msg) {
  const msg = JSON.stringify(_msg);

  const msgBuffer = Buffer.from(msg);
  const msgByteLength = msgBuffer.byteLength;

  let headerBuffer;
  let lengthByte = msgByteLength;

  if (msgByteLength > 125) {
    if (msgByteLength < WS_MAX_RESPONSE_LENGTH) {
      // 16 bits
      lengthByte = 126;
      headerBuffer = Buffer.allocUnsafe(4);
    } else {
      // 64 bits messages not supported
      log('Response message too large');
      return;
    }
  } else {
    // 7 bits
    headerBuffer = Buffer.allocUnsafe(2);
  }

  headerBuffer.writeUInt8(0b10000001, 0); // FIN=1 - OpCode=1
  headerBuffer.writeUInt8(lengthByte, 1);

  if (lengthByte === 126) {
    // Extended length
    headerBuffer.writeInt16BE(msgByteLength, 2);
  }

  _s.write(Buffer.concat([headerBuffer, msgBuffer]));
}

module.exports = {
  registerClient,
};
