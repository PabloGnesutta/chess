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
var lastMoveCells = [
  [0, 0],
  [0, 0],
];
var movementMarkSquares = [];

function drawBoard(pov = 'w') {
  const _board = document.getElementById('board');
  _board.innerHTML = null;

  let rowStart = 0;
  let rowEval = row => row <= _Z;
  let rowInc = 1;

  let colStart = 0;
  let colEval = col => col <= _Z;
  let colInc = 1;

  if (pov === 'b') {
    rowStart = _Z;
    rowEval = row => row >= 0;
    rowInc = -1;

    colStart = _Z;
    colEval = col => col >= 0;
    colInc = -1;
  }

  let rankIndicatorAtCol = pov === 'w' ? 0 : _Z;
  let fileIndicatorAtRow = pov === 'w' ? _Z : 0;

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

      if (col === rankIndicatorAtCol) {
        const rankIndicator = document.createElement('div');
        rankIndicator.classList.add('rank-indicator');
        rankIndicator.innerText = ROW_MAP[row];
        _square.appendChild(rankIndicator);
      }
      if (row === fileIndicatorAtRow) {
        const fileIndicator = document.createElement('div');
        fileIndicator.classList.add('file-indicator');
        fileIndicator.innerText = COL_MAP[col];
        _square.appendChild(fileIndicator);
      }
    }

    _board.appendChild(_row);
  }
}

function clearLastMoveMarks() {
  const [row, col] = lastMoveCells[0];
  _imgContainers[row][col].classList.remove('last-move-from');
  const [_row, _col] = lastMoveCells[1];
  _imgContainers[_row][_col].classList.remove('last-move-to');
}

function markLastMove(from, to) {
  clearLastMoveMarks();
  const [row, col] = from;
  const fromSquare = _imgContainers[row][col];
  fromSquare.classList.add('last-move-from');
  lastMoveCells[0] = from;

  const [_row, _col] = to;
  const toSquare = _imgContainers[_row][_col];
  toSquare.classList.add('last-move-to');
  lastMoveCells[1] = to;
}

function clearMoves() {
  movementMarkSquares.forEach(_square => {
    _square.classList.remove('potential-move');
    _square.classList.remove('potential-capture');
  });
  movementMarkSquares = [];
}

function displayMoves(moves) {
  clearMoves();
  moves.forEach(move => {
    const [row, col] = move.moveTo;
    const _square = _squares[row][col];
    const type = move.captureAt ? 'capture' : 'move';
    _square.classList.add('potential-' + type);
    movementMarkSquares.push(_square);
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
  unselectCurrentSquare,
  markLastMove,
  displayMoves,
  drawBoard,
};
