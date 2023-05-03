import { Duplex } from 'stream';

import { log } from'./utils/utils';
import {
  rooms,
  roomIds,
  roomClientsLimit,
  joinOrCreateRoom,
  getRoomIndex,
  getRoomClients,
} from'./rooms';

const WS_MAX_RESPONSE_LENGTH = 65535;

let idCount = 0;

type ClientData = {
  roomIsIn: number | null,
  playerColor: string | null,
}

const clientIds: number[] = [];
const clientsData: ClientData[] = [];
const sockets: Duplex[] = [];

const getClientIndex = (id: number) => clientIds.findIndex(cId => cId === id);

/**
 * Register new web socket client and its metadata
 * @param {Socket} _s
 */
function registerClient(_s: Duplex) {
  const clientId = ++idCount;

  sockets.push(_s);
  clientIds.push(clientId);
  clientsData.push({
    roomIsIn: null,
    playerColor: null
  });

  writeSocket(_s, { type: 'CLIENT_REGISTERED', clientId });

  _s.on('readable', () => readSocket(_s, clientId));

  _s.on('close', () => {
    log('Socket closed');
    deleteClient(_s, clientId);
  });

  _s.on('end', () => log(' / socket end'));
  _s.on('error', () => log(' / socket error'));
  // _s.on('data', chunk => {});
}

function deleteClient(_s: Duplex, clientId: number) {
  log(' / @deleteClient');
  _s.destroy();

  const clientIndex = getClientIndex(clientId);

  removeFromRoom: {
    // Remove client from room and the room itself
    const roomIsIn = clientsData[clientIndex].roomIsIn;

    if (!roomIsIn) break removeFromRoom;

    const roomIndex = getRoomIndex(roomIsIn);

    if (roomIndex === -1) {
      log(' * Could not find room in which the client is @flishSocket');
      break removeFromRoom;
    }

    const room = rooms[roomIndex];

    for (let i = 0; i < room.clients.length; i++) {
      const roomClient = room.clients[i];
      if (clientId === roomClient) {
        writeSocket(_s, { type: 'ROOM_LEFT' });
      } else {
        const clientIndex = getClientIndex(roomClient);
        if (clientIndex !== -1) {
          writeSocket(sockets[clientIndex], { type: 'OPONENT_ABANDONED' });
        } else {
          log(' * Could not find client to send OPONENT_ABANDONED message');
        }
      }
    }

    // Delete Room (move to rooms.js)
    rooms.splice(roomIndex, 1);
    roomIds.splice(roomIndex, 1);
  }

  sockets.splice(clientIndex, 1);
  clientIds.splice(clientIndex, 1);
  clientsData.splice(clientIndex, 1);
}

// -----------------------------
// Process messages from client:
// -----------------------------

function processMessage(_s: Duplex, clientId: number, data: any) {
  log(' - @processMessage', data);
  switch (data.type) {
    case 'JOIN_ROOM':
      return JOIN_ROOM(_s, clientId);
    case 'SIGNAL_MOVE':
      return SIGNAL_MOVE(clientId, data.moveData);
    case 'LEAVE_ROOM':
      return LEAVE_ROOM(clientId);
    default:
      return log(' * Invalid message type @processMessage');
  }
}

function JOIN_ROOM(_s: Duplex, clientId: number) {
  const room = joinOrCreateRoom(clientId);

  const clientData = clientsData[getClientIndex(clientId)];

  clientData.roomIsIn = room.id;
  clientData.playerColor = room.clients.length === 1 ? 'w' : 'b';

  const waitingForOtherPlayer = room.clients.length < roomClientsLimit;

  if (waitingForOtherPlayer)
    return;

  // Notify both players that the room is ready. Send them their colors

  const roomClients = getRoomClients(room.id);

  for (let i = 0; i < roomClients.length; i++) {
    const roomClient = roomClients[i];
    const clientIndex = getClientIndex(roomClient);

    if (clientIndex !== -1) {
      writeSocket(
        sockets[clientIndex],
        {
          type: 'ROOM_READY',
          room,
          playerColor: clientsData[clientIndex].playerColor
        }
      );
    } else {
      log(` * Client ${roomClient} not found in room ${room.id} @JOIN_ROOM`);
    }
  }
}

function SIGNAL_MOVE(clientId: number, moveData: any) {
  const clientIndex = getClientIndex(clientId);
  const roomId = clientsData[clientIndex].roomIsIn;
  if (!roomId) {
    return log('client room not found @SIGNAL_MOVE');
  }
  sendRoomMessage(
    roomId,
    {
      type: 'OPONENT_MOVED',
      moveData,
    },
    clientId
  );
}

function LEAVE_ROOM(data: any) {
  log(data, '@LEAVE_ROOM');
}

/**
 * Send message to all clients in the room.
 * If exceptClientId is provided, do not send to that client.
 * @param {number} roomId 
 * @param {JSON} msg 
 * @param {number} exceptClientId 
 * @returns {void}
 */
function sendRoomMessage(roomId: number, msg: any, exceptClientId?: number) {
  const roomClients = getRoomClients(roomId);

  for (let i = 0; i < roomClients.length; i++) {
    const roomClient = roomClients[i];
    if (roomClient === exceptClientId) {
      continue;
    }

    const clientIndex = getClientIndex(roomClient);

    if (clientIndex !== -1) writeSocket(sockets[clientIndex], msg);
    else return log(' * Client not found in room @sendRoomMessage');
  }
}

/**
 * Read Socket
 * @param {Socket} _s
 * @param {number} clientId
 * @returns {void}
 */
function readSocket(_s: Duplex, clientId: number) {
  const [b1] = _s.read(1);

  // if first bit=1, this is the final frame of the current message
  if (!((b1 & 0x80) === 0x80)) {
    // 0x80=1000
    log('FIN=0. Message will continue on subsecuent frames');
  }

  const opCode = b1 & 0xf; // 0xF=1111

  switch (opCode) {
    case 0x0:
      log(' - opCode=0. Message will continue on subsecuent frames');
      break;
    case 0x1:
      // log(' - Text frame');
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
  if (!((b2 & 0x80) === 0x80)) {
    log(' * Message not masked!');
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
    const jsonData = JSON.parse(unmaskedData as unknown as string);
    processMessage(_s, clientId, jsonData);
  } catch (error) {
    return log(' * Invalid JSON:', unmaskedData);
  }

  // Excess data. Should never reach here.
  let b = _s.read(1);
  if (b) {
    log(' * Excess data');
    while ((b = _s.read(1))) log('  b:', b);
  }
}

/**
 * Write JSON to Socket
 * @param {Socket} _s
 * @param {JSON} _msg
 * @returns {void}
 */
function writeSocket(_s: Duplex, _msg: any) {
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
      log(' * Response message too large');
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

export {registerClient}
