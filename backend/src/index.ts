import * as crypto from 'crypto';
import { createServer } from 'http';
import { Duplex } from 'stream';
import * as fs from 'fs';
import { log } from './utils/utils';
import { Client, ClientsById, clients, registerClient } from './clients/clients';
import { RoomType, rooms } from './rooms';
import { matches } from './chess/match/match';
import { MatchState } from './chess/types';

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
  log('room', _room);

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

const server = createServer((req, res): any => {
  // log(req.url);

  const url = req.url;

  if (!url) {
    log('  ---  !url');
    return res.end('WTF');
  }

  const pathArray = url.split('/');

  // log('url', url);

  try {
    if (url === '/') {
      const indexHTML = fs.readFileSync('../frontend/src/index.html');
      res.write(indexHTML);
      res.end();
      // } else if (url.match(/\/css\/([a-z])\w+\.css/)) {
    } else if (pathArray[1] === 'css') {
      const fileName = pathArray[pathArray.length - 1];
      const cssFile = fs.readFileSync('../frontend/src/css/' + fileName);
      res.write(cssFile);
      res.end();
    } else if (pathArray[1] === 'build') {
      const filePath = '../frontend/build/js/' + pathArray.slice(3, pathArray.length).join('/');
      log('filePath', filePath);
      const jsFile = fs.readFileSync(filePath);
      // log('jsFile', jsFile);
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.write(jsFile);
      res.end();
    } else if (url === '/logs') {
      log(' ----------------- ');
      log(' ** ROOMS');
      rooms.forEach((room) => {
        logRoom(room);
      });
      log(' ');

      log(' ** CLIENTS');
      // logClients(clients);
      log(' ');

      log(' ** MATCHES');
      // for (const id in matches) logMatch(matches[id]);
      log(' ');
      res.end('Logs OK');
    } else {
      res.end('404');
    }
  } catch (error) {
    log('error', error);
  }
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
