import { Duplex } from 'stream';

import { log } from'./utils/utils';
import {
  joinOrCreateRoom,
  RoomType,
  removeClientAndDestroyRoom,
} from'./rooms';
import { type } from 'os';


export type Client = {
  id: number,
  activeRoom: RoomType | null,
  playerColor: string, // coold be a bit, black/white
  _s: Duplex,
}

type Clients = { [key: number]: Client }

const clients: Clients = {}

type PayloadType = any;

let idCount = 0;

/**
 * Register new web socket client and its metadata
 * @param {Socket} _s
 */
function registerClient(_s: Duplex): void {
  const clientId = ++idCount;

  clients[clientId] = {
    id: clientId,
    _s,
    activeRoom: null,
    playerColor: '',
  }

  const client = clients[clientId]


  writeSocket(_s, { type: 'CLIENT_REGISTERED', clientId });

  _s.on('readable', () => readSocket(client));

  _s.on('close', () => {
    log('Socket closed'), deleteClient(client);
  });

  _s.on('end', () => log(' / socket end'));
  _s.on('error', () => log(' / socket error'));
  // _s.on('data', chunk => {});
}

function deleteClient(client: Client): void {
  log(' / @deleteClient');
  
  client._s.destroy();

  removeClientAndDestroyRoom(client);

  delete clients[client.id];
}

// -----------------------------
// Process messages from client:
// -----------------------------

function processIncommingMessage(client: Client, data: any): void {
  log('processIncommingMessage', data);
  try {
    switch (data.type) {
      case 'JOIN_ROOM':
        return JOIN_ROOM(client);
      case 'SIGNAL_MOVE':
        return SIGNAL_MOVE(client, data.moveData);
      default:
        return log('---Invalid message type @processIncommingMessage');
    }
  } catch (err) {
    log('error @processIncommingMessage', err);
  }
}

function JOIN_ROOM(client: Client): void {
  joinOrCreateRoom(client);
}

function SIGNAL_MOVE(client: Client, moveData: any): void {
  const room = client.activeRoom;
  if (!room) {
    return log('client room not found @SIGNAL_MOVE');
  }
  sendRoomMessage(
    room,
    {
      type: 'OPONENT_MOVED',
      moveData,
    },
    client.id
  );
}

/**
 * Send message to all clients in the room.
 * If exceptClientId is provided, do not send to that client.
 * @param {RoomType} room 
 * @param {JSON} msg 
 * @param {number} exceptClientId 
 * @returns {void}
 */
function sendRoomMessage(room: RoomType, payload: PayloadType, exceptClientId?: number): void {
  const roomClients = room.clients;

  for (const roomClient of roomClients) {
    if (roomClient.id !== exceptClientId) {
      writeSocket(roomClient._s, payload);
    }
  }
}

function parseJSON(unmaskedData: Buffer, client: Client): void {
  try {
    const jsonData = JSON.parse(unmaskedData as unknown as string);
    processIncommingMessage(client, jsonData);
  } catch (error) {
    return log('---Invalid JSON:', unmaskedData);
  }
}


const WS_MAX_RESPONSE_LENGTH = 65535;

/**
 * Read Socket. 
 * Does not account for messages that span múltiple frames
 * Nor frames out of phase with the buffer
 * @param {Duplex} _s
 * @param {number} clientId
 * @returns {void}
 */
function readSocket(client: Client): void {
  const _s = client._s;

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
    case 0x8:
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

  // Parse to JSON and route message to action
  parseJSON(unmaskedData, client);

  // Excess data. Should never reach here.
  let b = _s.read(1);
  if (b) {
    log(' * Excess data');
    while ((b = _s.read(1))) log('  b:', b);
  }
}

/**
 * Write JSON to Socket
 * @param {Duplex} _s
 * @param {JSON} _msg
 * @returns {void}
 */
function writeSocket(_s: Duplex, payload: PayloadType): void {
  let msgString: string;
  try {
    msgString = JSON.stringify(payload);
  } catch (err) {
    return log('---error stringigying JSON ', {payload, err}, '@writeSocket');
  }

  const msgBuffer = Buffer.from(msgString);
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

export {registerClient, writeSocket}
