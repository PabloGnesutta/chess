import * as crypto from 'crypto';
import { createServer } from 'http';
import { Duplex } from 'stream';

import { log } from './utils/utils';
import { registerClient } from './clients/clients';
import { router } from './http/router';

import { config } from 'dotenv';

config();

const PORT = process.env.PORT;

// -------
// SERVER:

const server = createServer(router);

server.listen(PORT, () => log('listening on port', PORT));

// ------------------------------
// UPGRADE to WebSocket Protocol:

const WS_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

server.on('upgrade', (req, socket: Duplex) => {
  if (req.headers['upgrade'] !== 'websocket') {
    return socket.end('HTTP/1.1 400 Bad Request\r\n');
  }

  const wsKey = req.headers['sec-websocket-key'];

  const wsAccept = crypto
    .createHash('sha1')
    .update(wsKey + WS_MAGIC_STRING)
    .digest('base64');

  const responseHeaders = [
    'HTTP/1.1 101 Web Socket Protocol Handshake',
    'Upgrade: WebSocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${wsAccept}`,
  ];

  socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

  registerClient(socket);

  return;
});
