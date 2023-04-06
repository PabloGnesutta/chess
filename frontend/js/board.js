import { state, board, passTurn, makeMove } from './gameState.js';

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

const _imgContainers = [
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

function drawBoard(pov = 'w') {
  const _board = document.getElementById('board');
  _board.innerHTML = null;

  let rowStart = 0;
  let rowEval = row => row <= ROW_Z;
  let rowInc = 1;

  let colStart = 0;
  let colEval = col => col <= COL_Z;
  let colInc = 1;

  if (pov === 'b') {
    rowStart = ROW_Z;
    rowEval = row => row >= 0;
    rowInc = -1;

    colStart = COL_Z;
    colEval = col => col >= 0;
    colInc = -1;
  }

  for (let row = rowStart; rowEval(row); row += rowInc) {
    const _row = document.createElement('div');
    _row.className = 'row';

    for (let col = colStart; colEval(col); col += colInc) {
      const _square = document.createElement('div');

      const _rowCol = document.createElement('div');
      _rowCol.innerText = row + '_' + col;
      _rowCol.classList.add('row-col-indicator');
      _square.appendChild(_rowCol);

      const _imgContainer = document.createElement('div');
      _imgContainer.classList.add('img-container');
      _square.appendChild(_imgContainer);

      const piece = board[row][col];
      _square.className = 'square';
      _square.setAttribute('row', row);
      _square.setAttribute('col', col);
      if (piece) {
        _imgContainer.innerHTML = piece.img;
        _square.classList.add(piece.name, piece.color);
      }

      _square.addEventListener('mousedown', () => squareClick([row, col]));
      _squares[row][col] = _square;
      _imgContainers[row][col] = _imgContainer;
      _row.appendChild(_square);
    }

    _board.appendChild(_row);
  }
}

var moveSquares = [];
var captureSquares = [];

function clearMarks() {
  clearMoves();
  clearCaptures();
}

function clearMoves() {
  moveSquares.forEach(_square => _square.classList.remove('potential-move'));
  moveSquares = [];
}

function displayMovesInBoard(moves) {
  clearMoves();
  moves.forEach(([row, col]) => {
    const _square = _squares[row][col];
    _square.classList.add('potential-move');
    moveSquares.push(_square);
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
    const _square = _squares[row][col];
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

  const { selectedPiece, currentColor } = state;

  if (selectedPiece) {
    if (currentColor === selectedPiece.color) {
      // Make move
      const pieceCanMoveHere = selectedPiece.moves.find(
        move => move[0] === row && move[1] === col
      );

      if (pieceCanMoveHere) return makeMove(selectedPiece, 'move', [row, col]);

      const pieceCanCaptureHere = selectedPiece.captures.find(
        capture => capture[0] === row && capture[1] === col
      );

      if (pieceCanCaptureHere)
        return makeMove(selectedPiece, 'capture', [row, col]);
    }
  }

  state.selectedPiece = null;

  const piece = board[row][col];
  if (!piece) return;

  state.selectedPiece = piece;
  piece.showMoves();
}

export {
  _imgContainers,
  drawBoard,
  displayMovesInBoard,
  displayCapturesInBoard,
};
