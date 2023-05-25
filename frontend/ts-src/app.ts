import { initializeBoard } from './ui/board.js';
import { initApp } from './initialize.js';
import { m_Welcome } from './ui/modal.js';

initializeBoard();

if (false) {
  initApp('SOLO');
  initApp('ONLINE');
} else {
  m_Welcome();
}
