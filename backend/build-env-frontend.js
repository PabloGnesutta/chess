console.log('   - Building frontend environment');

const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

config();

const FRONTEND_DIR = path.join(__dirname, '../', 'frontend', 'public', 'js-build');

// Remember to update frontend's env.ts

fs.writeFileSync(
  path.join(FRONTEND_DIR, 'env.js'),
  `
export const ALLOW_DEBUG='${process.env.ALLOW_DEBUG}';
export const API_URL='${process.env.API_URL}';
export const WS_URL='${process.env.WS_URL}';
`
);

console.log('   - Building complete');
