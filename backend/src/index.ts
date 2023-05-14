import * as crypto from 'crypto';
import { createServer } from 'http';
import { Duplex } from 'stream';

import { log } from './utils/utils';
import { Client, ClientsById, clients, registerClient } from './clients/clients';
import { RoomType, rooms } from './rooms';
import { matches } from './chess/match/match';
import { MatchState } from './chess/types';
import { match } from 'assert';

function logClients(clients: ClientsById, label = 'client') {
  for (const id in clients) {
    const client: Partial<Client> = { ...clients[id] };
    delete client._s;
    delete client.activeRoom;
    log(label, client);
  }
}

function logRoom(room: RoomType) {
  const _room: Partial<RoomType> = { ...room };
  delete _room.clients;
  delete _room.match;
  log('room', room);

  logClients(room.clients, '  room client');

  if (room.match) {
    log('  room match id', room.match.id);
  }
}

function logMatch(match: MatchState, label = 'match') {
  log(label, match);
}
// -------
// SERVER:

const server = createServer((req, res) => {
  log(' ** ROOMS');
  rooms.forEach((room) => {
    logRoom(room);
  });

  log(' ** CLIENTS');
  logClients(clients);

  log('** MATCHES');
  for (const id in matches) {
    logMatch(matches[id]);
  }

  res.end('OK');
});

server.listen(3000, () => log('listening on port', 3000));

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
