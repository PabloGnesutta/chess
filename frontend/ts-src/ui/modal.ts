import { log } from '../globals';
import { initApp } from '../initialize.js';
import { ColorType } from '../state/gameState';
import { EndGameStatus } from '../engine/gameFlow';

import { createElement } from './DOM.js';

const modal = document.getElementById('modal')!;
const modalContent = document.getElementById('modal-content')!;
const closeModalBtn = document.getElementById('close-modal-btn')!;

// Reusable elements
const playSolo = createElement('button', { text: 'Play Solo' });
const playOnline = createElement('button', { text: 'Play Online' });
playSolo.addEventListener('click', () => initApp('SOLO'));
playOnline.addEventListener('click', () => initApp('ONLINE'));

type ModalOptions = {
  modalClassList?: string[];
  contentClassList?: string[];
  hideCloseBtn?: boolean;
  onClose?: () => void;
};

function showModal(content: HTMLElement, options?: ModalOptions) {
  content.classList.add('modal-content-inner');
  modalContent.innerHTML = '';
  modalContent.appendChild(content);

  modal.classList.remove('display-none');

  if (!options) return;

  if (options.modalClassList) modal.classList.add(...options.modalClassList);
  if (options.contentClassList) modalContent.classList.add(...options.contentClassList);

  if (options.hideCloseBtn) {
    closeModalBtn.classList.add('display-none');
  } else {
    closeModalBtn.classList.remove('display-none');
    if (options.onClose) closeModalBtn.onclick = () => closeModal(options.onClose);
  }
}

function closeModal(callback?: () => void) {
  modal.classList.add('display-none');
  if (callback) callback();
}

function wrapElements(elements: HTMLElement[], className = ''): HTMLElement {
  const container = createElement('div');
  container.className = className;
  elements.forEach(el => container.appendChild(el));
  return container;
}

function m_Welcome() {
  const h1 = createElement('h1', { text: 'Welcome to Chess' });
  const p = createElement('p', { text: 'Wanna play?' });
  const buttons = wrapElements([playSolo, playOnline], 'modal-bottom-buttons-container');

  const content = wrapElements([h1, p, buttons]);
  showModal(content, { hideCloseBtn: false });
}

function m_LookingForPlayers() {
  const h1 = createElement('h1', { text: 'Looking for players' });
  const p = createElement('p', { text: 'Hang in there...' });

  const content = wrapElements([h1, p]);
  showModal(content, { hideCloseBtn: true });
}

function m_OponentAbandoned() {
  const h1 = createElement('h1', { text: 'Oponent abandoned. You Win!' });
  const p = createElement('p', { text: 'What do you wanna do next?' });
  const buttons = wrapElements([playSolo, playOnline], 'modal-bottom-buttons-container');

  const content = wrapElements([h1, p, buttons]);
  showModal(content, { hideCloseBtn: true });
}

function m_gameEnded(status: EndGameStatus, currentColor: ColorType): void {
  alert(`Game ended: ${status} - ${currentColor}`);
  log(status, currentColor);
}

closeModalBtn.onclick = () => closeModal();

export { closeModal, m_gameEnded, m_LookingForPlayers, m_OponentAbandoned, m_Welcome };
