import { Duplex } from 'node:stream';

import { log } from '../utils/utils';
import { RoomType, clientLeftRoom } from '../rooms';

import { readSocket, writeSocket } from './websocket';

export type WSPayloadType = {
  type: string;
  data?: any;
};

export type WSMessage = {
  type: string;
  data?: any;
};

export type Client = {
  id: number;
  activeRoom: RoomType | null;
  playerColor: string;
  _s: Duplex;
};

export type ClientsById = { [key: number]: Client };

const clients: ClientsById = {};

let clientIdCount = 0;

/**
 * Register new web socket client and its metadata
 * @param {Socket} _s
 */
function registerClient(_s: Duplex): void {
  const clientId = ++clientIdCount;

  clients[clientId] = {
    id: clientId,
    _s,
    activeRoom: null,
    playerColor: '',
  };

  const client = clients[clientId];

  writeSocket(_s, { type: 'CLIENT_REGISTERED', data: { clientId } });

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
  clientLeftRoom(client);
  client._s.destroy();
  delete clients[client.id];
}

export { clients, registerClient };
