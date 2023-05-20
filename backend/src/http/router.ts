import * as fs from 'node:fs';
import path = require('node:path');
import { IncomingMessage, ServerResponse } from 'node:http';

import { log, logClients, logRoom } from '../utils/utils';
import { clients } from '../clients/clients';
import { rooms } from '../rooms';

const FRONTEND_DIR = path.join(__dirname, '../', '../', '../', 'frontend');
const HTML_DIR = path.join(FRONTEND_DIR, 'src', 'index.html');
const CSS_DIR = path.join(FRONTEND_DIR, 'src', 'css');
const SVG_DIR = path.join(FRONTEND_DIR, 'src', 'svg');
const JS_DIR = path.join(FRONTEND_DIR, 'build', 'js');

// LOGGING
function doTheLogging(): void {
  log(' ----------------- ');
  log(' ** ROOMS');
  rooms.forEach(room => {
    logRoom(room);
  });
  log(' ');

  log(' ** CLIENTS');
  logClients(clients);
  log(' ');

  log(' ** MATCHES');
  // for (const id in matches) logMatch(matches[id]);
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
  // log('url', url);

  try {
    if (url === '/') {
      // HTML Index
      sendAssetFile(res, HTML_DIR, 'text/html');
    } else if (pathArray[1] === 'css') {
      // CSS
      const filePath = path.join(CSS_DIR, ...pathArray.slice(2, pathLen));
      sendAssetFile(res, filePath, 'text/css');
    } else if (pathArray[1] === 'build') {
      // JavaScript
      const filePath = path.join(JS_DIR, ...pathArray.slice(3, pathLen));
      sendAssetFile(res, filePath, 'application/javascript');
    } else if (pathArray[1] === 'svg') {
      // SVG
      const filePath = path.join(SVG_DIR, ...pathArray.slice(2, pathLen));
      sendAssetFile(res, filePath, 'image/svg+xml');
    } else if (url === '/logs') {
      // LOGGING
      doTheLogging();
      res.end('Logs OK');
    } else {
      res.writeHead(404);
      res.end('Resource not found');
    }
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
