import { COL_MAP, NAME_MAP, ROW_MAP } from '../globals.js';
import { appState } from '../state/appState.js';
import { HistoryItem, gameState } from '../state/gameState.js';

import { $, createElement } from './DOM.js';
import { drawPositionHistoryItem } from './board.js';

const _mvHistory = $('mv-history')!;

const _mvHistoryItems: HTMLElement[] = [];

function addMvHistoryItem(lastMove: HistoryItem | null, isCheck: boolean): void {
  let itemText = '[*]'; // Starting position

  if (lastMove) {
    const { color, piece, to } = lastMove;
    itemText = color + NAME_MAP[piece] + COL_MAP[to[1]] + ROW_MAP[to[0]];
  }

  if (isCheck) itemText += '!';

  const historyIndex = gameState.positionHistory.length - 1;

  const _mvHistoryItem = createElement('div', { className: 'mv-history-item', text: itemText });

  _mvHistoryItem.addEventListener('click', () => {
    if (historyIndex === gameState.positionHistory.length - 1) {
      appState.viewMode = 'GAME';
    } else {
      appState.viewMode = 'HISTORY';
    }
    drawPositionHistoryItem(gameState.positionHistory[historyIndex].position);

    unselectSelectedItem();

    _mvHistoryItem.classList.add('selected');
  });

  _mvHistoryItems.push(_mvHistoryItem);
  _mvHistory.appendChild(_mvHistoryItem);
}

function unselectSelectedItem() {
  const selectedHistoryItem = document.querySelector('.mv-history-item.selected');
  if (selectedHistoryItem) {
    selectedHistoryItem.classList.remove('selected');
  }
}

function selectLastHistoryItem() {
  unselectSelectedItem();
  const lastItem = _mvHistoryItems[_mvHistoryItems.length - 1];
  lastItem?.classList.add('selected');
}

export { _mvHistory, addMvHistoryItem, selectLastHistoryItem };
