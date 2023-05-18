console.log(' * Building frontend environment');

const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

config();

const FRONTEND_DIR = path.join(__dirname, '../', 'frontend', 'build', 'js');

fs.writeFileSync(
  path.join(FRONTEND_DIR, 'env.js'),
  `
export const API_URL='${process.env.API_URL}';
export const WS_URL='${process.env.WS_URL}';
`
);

console.log(' * Building complete');
