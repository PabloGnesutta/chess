import { COL_MAP, NAME_MAP, ROW_MAP } from '../globals.js';
import { HistoryItem, gameState } from '../state/gameState.js';

import { $, createElement } from './DOM.js';
import { drawPositionHistoryItem } from './board.js';

const _mvHistory = $('mv-history')!;

function addMvHistoryItem(lastMove: HistoryItem | null, isCheck: boolean): void {
  let itemText = '[*]'; // Starting position

  if (lastMove) {
    const { color, piece, to } = lastMove;
    itemText = color + NAME_MAP[piece] + COL_MAP[to[1]] + ROW_MAP[to[0]];
  }

  if (isCheck) itemText += '!';

  const item = createElement('div', { className: 'mv-history-item', text: itemText });
  const historyIndex = gameState.positionHistory.length - 1;
  item.addEventListener('click', () => {
    drawPositionHistoryItem(gameState.positionHistory[historyIndex].position);
  });

  _mvHistory.appendChild(item);
}

export { _mvHistory, addMvHistoryItem };
