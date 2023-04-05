import { state, board, passTurn } from './gameState.js';

const _squares = [
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
  new Array(8).fill(null),
];

var selectedSquare = null;

function drawBoard() {
  const _board = document.getElementById('board');

  for (let row = 0; row < 8; row++) {
    const _row = document.createElement('div');
    _row.className = 'row';
    for (let col = 0; col < 8; col++) {
      const _square = document.createElement('div');
      const piece = board[row][col];
      _square.className = 'square';
      _square.setAttribute('row', row);
      _square.setAttribute('col', col);
      if (piece) {
        _square.innerHTML = piece.img;
        _square.classList.add(piece.name, piece.color);
      }
      _square.addEventListener('mousedown', () => squareClick([row, col]));
      _squares[row][col] = _square;
      _row.appendChild(_square);
    }
    _board.appendChild(_row);
  }
}

var potentialMoveSquares = [];
var captureSquares = [];

function clearMarks() {
  clearPotentialMoves();
  clearCaptures();
}

function clearPotentialMoves() {
  potentialMoveSquares.forEach(_square =>
    _square.classList.remove('potential-move')
  );
  potentialMoveSquares = [];
}

function displayMovesInBoard(moves) {
  clearPotentialMoves();
  moves.forEach(([row, col]) => {
    if (row < 0 || col < 0 || row > ROW_Z || col > COL_Z) {
      return log('Invalid square', { row, col });
    }
    const _square = _squares[row][col];
    if (!_square) return log('inexistent square');
    _square.classList.add('potential-move');
    potentialMoveSquares.push(_square);
  });
}

function clearCaptures() {
  captureSquares.forEach(_square =>
    _square.classList.remove('potential-capture')
  );
  captureSquares = [];
}

function displayCapturesInBoard(captures) {
  clearCaptures();
  captures.forEach(([row, col]) => {
    if (row < 0 || col < 0 || row > ROW_Z || col > COL_Z) {
      return log('Invalid square', { row, col });
    }
    const _square = _squares[row][col];
    if (!_square) return log('inexistent square');
    _square.classList.add('potential-capture');
    captureSquares.push(_square);
  });
}

function unselectCurrentSquare() {
  clearMarks();

  if (!selectedSquare) return;
  selectedSquare.classList.remove('highlight');
  selectedSquare = null;
}

function selectSquare([row, col]) {
  selectedSquare = _squares[row][col];
  selectedSquare.classList.add('highlight');
}

function squareClick([row, col]) {
  unselectCurrentSquare();
  selectSquare([row, col]);

  const selectedPiece = state.selectedPiece;
  if (selectedPiece) {
    if (state.currentColor === selectedPiece.color) {
      const selectedPieceCanMoveHere = selectedPiece.moves.find(
        move => move[0] === row && move[1] === col
      );
      if (selectedPieceCanMoveHere) {
        selectedPiece.placeAt([row, col]);
        passTurn();
        return;
      }
    }
  }

  state.selectedPiece = null;

  const piece = board[row][col];
  if (!piece) return;

  state.selectedPiece = piece;
  piece.showMoves();
}

export {
  board,
  _squares,
  drawBoard,
  displayMovesInBoard,
  displayCapturesInBoard,
};
