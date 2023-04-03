import piecesLib from "./pieces.js";

const board = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
];

var selectedSquare = null;

const _squares = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null]
];

board.putPiece = function (piece) {
  this[piece.row][piece.col] = piece;
  return this;
};

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
      _square.addEventListener('mousedown', () =>
        squareClick(row, col)
      );
      _squares[row][col] = _square;
      _row.appendChild(_square);
    }
    _board.appendChild(_row);
  }
}

var potentialMoveSquares = [];
var captureSquares = [];

function clearPotentialMoves() {
  potentialMoveSquares.forEach(_square => _square.classList.remove('potential-move'));
  potentialMoveSquares = [];
}

function displayMoves(moves) {
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
  captureSquares.forEach(_square => _square.classList.remove('potential-capture'));
  potentialMoveSquares = [];
}

function displayCaptures(captures) {
  clearCaptures();
  captures.forEach(([row, col]) => {
    if (row < 0 || col < 0 || row > ROW_Z || col > COL_Z) {
      return log('Invalid square', { row, col });
    }
    const _square = _squares[row][col];
    if (!_square) return log('inexistent square');
    _square.classList.add('potential-capture');
    potentialMoveSquares.push(_square);
  });
}

function unselectCurrentSquare() {
  clearPotentialMoves();

  if (!selectedSquare) return;
  selectedSquare.classList.remove('highlight');
  selectedSquare = null;

  piecesLib.selectedPiece = null;
}


function selectSquare(row, col) {
  selectedSquare = _squares[row][col];
  selectedSquare.classList.add('highlight');
}

function squareClick(row, col) {
  unselectCurrentSquare();
  selectSquare(row, col);

  const piece = board[row][col];
  if (!piece) return;

  piecesLib.selectedPiece = piece;
  piece.computeMoves();
}

const exportObj = { board, drawBoard, displayMoves, displayCaptures };

export default exportObj;