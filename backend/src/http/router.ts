import * as fs from 'fs';
import path = require('path');
import { IncomingMessage, ServerResponse } from 'http';

import { log, logClients, logRoom } from '../utils/utils';
import { clients } from '../clients/clients';
import { rooms } from '../rooms';

const FRONTEND_DIR = path.join('../', 'frontend');
const CSS_DIR = path.join(FRONTEND_DIR, 'src', 'css');
const SVG_DIR = path.join(FRONTEND_DIR, 'src', 'svg');
const JS_DIR = path.join(FRONTEND_DIR, 'build', 'js');

function router(req: IncomingMessage, res: ServerResponse): any {
  const url = req.url as string;

  const pathArray = url.split('/');
  const pathLen = pathArray.length;

  // log('url', url);

  try {
    if (url === '/') {
      // HTML Index
      const indexHTML = fs.readFileSync('../frontend/src/index.html');
      res.write(indexHTML);
      res.end();
    } else if (pathArray[1] === 'css') {
      // CSS
      const filePath = path.join(CSS_DIR, pathArray.slice(2, pathLen).join('/'));
      const assetFile = fs.readFileSync(filePath);
      res.writeHead(200, { 'content-type': 'text/css' });
      res.end(assetFile);
    } else if (pathArray[1] === 'build') {
      // JavaScript
      const filePath = path.join(JS_DIR, pathArray.slice(3, pathLen).join('/'));
      const assetFile = fs.readFileSync(filePath);
      res.writeHead(200, { 'content-type': 'application/javascript' });
      res.end(assetFile);
    } else if (pathArray[1] === 'svg') {
      // SVG
      const filePath = path.join(SVG_DIR, pathArray.slice(2, pathLen).join('/'));
      const assetFile = fs.readFileSync(filePath);
      res.writeHead(200, { 'content-type': 'image/svg+xml' });
      res.end(assetFile);
    } else if (url === '/logs') {
      // LOGGING
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
      // for (const id in matches) logMatch(matches[id]);
      log(' ');
      res.end('Logs OK');
    } else {
      res.writeHead(404);
      res.end('Resource not found');
    }
  } catch (error) {
    res.writeHead(503);
    res.end('Something went wrong');
    log('error @router', error);
  }
}

export { router };
