const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
// const modalContent = document.getElementById('modal-content');

closeModalBtn.onclick = e => closeModal();

function showModal() {
  modal.classList.remove('display-none');
}

function closeModal() {
  modal.classList.add('display-none');
}

export { showModal, closeModal };
