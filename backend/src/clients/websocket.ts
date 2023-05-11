import { log } from '../utils/utils';
import { Client, WSPayloadType } from './clients';
import { processIncommingMessage } from './incommingMessages';
import { Duplex } from 'stream';

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
function writeSocket(_s: Duplex, payload: WSPayloadType): void {
  let msgString: string;
  try {
    msgString = JSON.stringify(payload);
  } catch (err) {
    return log('---error stringigying JSON ', { payload, err }, '@writeSocket');
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

export { readSocket, writeSocket };
