import { board, makeMove, state } from './gameState.js';

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
      _square.className = 'square';
      _square.setAttribute('row', row);
      _square.setAttribute('col', col);
      _square.addEventListener('mousedown', () => squareClick([row, col]));

      const _rowCol = document.createElement('div');
      _rowCol.innerText = row + '_' + col;
      _rowCol.classList.add('row-col-indicator');
      _square.appendChild(_rowCol);

      const _imgContainer = document.createElement('div');
      _imgContainer.classList.add('img-container');
      _square.appendChild(_imgContainer);

      const piece = board[row][col];
      if (piece) {
        _imgContainer.innerHTML = piece.img;
      }

      _squares[row][col] = _square;
      _imgContainers[row][col] = _imgContainer;
      _row.appendChild(_square);
    }

    _board.appendChild(_row);
  }
}

var moveSquares = [];

function clearMoves() {
  moveSquares.forEach(_square => {
    _square.classList.remove('potential-move');
    _square.classList.remove('potential-capture');
  });
  moveSquares = [];
}

function displayMoves(moves) {
  clearMoves();
  moves.forEach((move) => {
    const [row, col] = move.moveTo;
    const _square = _squares[row][col];
    const type = move.captureAt ? 'capture' : 'move';
    _square.classList.add('potential-' + type);
    moveSquares.push(_square);
  });
}

function unselectCurrentSquare() {
  clearMoves();
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
      const move = selectedPiece.moves.find(
        ({ moveTo }) => moveTo[0] === row && moveTo[1] === col
      );

      if (move) return makeMove(selectedPiece, move);
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
  displayMoves,
  drawBoard,
};
