import { MatchState } from '../chess/types';
import { Client, ClientsById } from '../clients/clients';
import { RoomType } from '../rooms';

const log = console.log;
const warn = console.warn;

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

export { log, logRoom, logClients, logMatch, warn };
