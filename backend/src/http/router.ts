import * as fs from 'node:fs';
import path = require('node:path');
import { IncomingMessage, ServerResponse } from 'node:http';

import { log, logClients, logMatch, logRoom } from '../utils/utils';
import { clients } from '../clients/clients';
import { rooms } from '../rooms';
import { matches } from '../chess/match/match';

const PUBLIC_DIR = path.join(__dirname, '../', '../', '../', 'frontend', 'public');
const HTML_DIR = path.join(PUBLIC_DIR, 'index.html');

// LOGGING
function doTheLogging(): void {
  log(' ----------------- ');
  log(' ** ROOMS');
  rooms.forEach((room) => {
    logRoom(room);
  });
  log(' ');

  log(' ** CLIENTS');
  logClients(clients);
  log(' ');

  log(' ** MATCHES');
  for (const id in matches) logMatch(matches[id]);
  log(' ');
}

function sendAssetFile(res: ServerResponse, filePath: string, contentType: string): void {
  try {
    const assetFile = fs.readFileSync(filePath);
    res.writeHead(200, { 'content-type': contentType });
    res.end(assetFile);
  } catch (err) {
    log('---Error @sendAssetFile', err);
    res.writeHead(500, 'Could not fetch asset');
    res.end();
  }
}

function router(req: IncomingMessage, res: ServerResponse): any {
  const url = req.url as string;

  const pathArray = url.split('/');
  const pathLen = pathArray.length;

  try {
    if (url === '/') {
      // HTML Index
      return sendAssetFile(res, HTML_DIR, 'text/html');
    }

    const pathBase = pathArray[1];
    const pathRoute = pathArray.slice(1, pathLen);

    if (pathBase === 'logs') {
      doTheLogging();
      return res.end('Logs OK');
    }

    if (pathBase === 'api') {
      log('API not implemented yet');
      res.writeHead(404);
      return res.end('API not implemented yet');
    }

    const filePath = path.join(PUBLIC_DIR, ...pathRoute);

    if (pathBase === 'css') return sendAssetFile(res, filePath, 'text/css');
    if (pathBase === 'js-build') return sendAssetFile(res, filePath, 'application/javascript');
    if (pathBase === 'svg') return sendAssetFile(res, filePath, 'image/svg+xml');
    if (pathBase === 'audio-assets') return sendAssetFile(res, filePath, 'audio/mp3');

    // Catch-all 404

    // log('Resource not found', pathArray);

    res.writeHead(404);
    res.end('Resource not found');
  } catch (error) {
    res.writeHead(503);
    res.end('Something went wrong');
    log('---Error @router', error);
  }
}

export { router };

// TEST CACHE
// log(' --- test cache hit');
// const assetFile = fs.readFileSync(path.join(__dirname, 'test-cache.js'));
// res.writeHead(200, {
//   'content-type': 'application/javascript',
//   // 'cache-control': 'max-age=60',
//   // 'cache-control': 'public',
//   'last-modified': 'Wed, 17 May 2023 02:59:00 GMT',
//   // etag: 'aaaabbb',
// });
// res.end(assetFile);
