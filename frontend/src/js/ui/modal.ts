const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('modal-content');

function LookingForPlayers() {
  return `
    <h1>Looking for players</h1>
    <p>Hang in there bruh...</p>
  `;
}

const buildModal: { [key: string]: (args?: any) => string } = {
  LookingForPlayers,
};

function showModal(modalName = 'LookingForPlayers', classList: string[] = []) {
  modalContent!.innerHTML = buildModal[modalName]();
  modal!.classList.remove('display-none');
  modal!.classList.add(...classList);
}

function closeModal() {
  modal!.classList.add('display-none');
}

closeModalBtn!.onclick = () => closeModal();

export { showModal, closeModal };
