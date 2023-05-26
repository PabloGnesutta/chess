import { COL_MAP, ROW_MAP, _Z } from '../globals.js';
import { appState } from '../state/appState.js';
import { CellType, ColorPiecesType, gameState } from '../state/gameState.js';

import { makeLocalMoveAndPassTurn, signalMoveMultiplayer } from '../engine/gameFlow.js';
import { MoveType, getPieceImage } from '../engine/piecesLib.js';

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

var selectedSquare: HTMLElement | null = null;
var movementMarkSquares: HTMLElement[] = [];
var lastMoveCells: CellType[] = [
  [0, 0], // from
  [0, 0], // to
];

function initializeBoard() {
  for (let row = 0; row <= _Z; row++) {
    const _row = document.createElement('row');
    _row.className = 'row';

    for (let col = 0; col <= _Z; col++) {
      const _square = document.createElement('div');
      _square.className = 'square';
      _square.setAttribute('row', row.toString());
      _square.setAttribute('col', col.toString());
      _square.addEventListener('mousedown', () => squareClick([row, col]));

      const _imgContainer = document.createElement('div');
      _imgContainer.classList.add('img-container');
      _square.appendChild(_imgContainer);

      _imgContainers[row][col] = _imgContainer;
      _squares[row][col] = _square;

      _row.appendChild(_square);

      // debug
      const _rowCol = document.createElement('div');
      _rowCol.innerText = row + '_' + col;
      _rowCol.classList.add('row-col-indicator');
      _square.appendChild(_rowCol);
    }
  }
}

function drawBoard(pov = 'w') {
  const _board = document.getElementById('board');
  _board!.innerHTML = '';

  let rowStart = 0;
  let rowEval = (row: number) => row <= _Z;
  let rowInc = 1;

  let colStart = 0;
  let colEval = (col: number) => col <= _Z;
  let colInc = 1;

  if (pov === 'b') {
    rowStart = _Z;
    rowEval = (row: number) => row >= 0;
    rowInc = -1;

    colStart = _Z;
    colEval = (col: number) => col >= 0;
    colInc = -1;
  }

  let rankIndicatorAtCol = pov === 'w' ? 0 : _Z;
  let fileIndicatorAtRow = pov === 'w' ? _Z : 0;

  for (let row = rowStart; rowEval(row); row += rowInc) {
    const _row = document.createElement('div');
    _row.className = 'row';
    for (let col = colStart; colEval(col); col += colInc) {
      const _square = _squares[row][col];
      _row.appendChild(_square);
      if (col === rankIndicatorAtCol) {
        const rankIndicator = document.createElement('div');
        rankIndicator.classList.add('rank-indicator');
        rankIndicator.innerText = ROW_MAP[row].toString();
        _square.appendChild(rankIndicator);
      }
      if (row === fileIndicatorAtRow) {
        const fileIndicator = document.createElement('div');
        fileIndicator.classList.add('file-indicator');
        fileIndicator.innerText = COL_MAP[col];
        _square.appendChild(fileIndicator);
      }
    }
    _board!.appendChild(_row);
  }
}

function drawPieces(colorPieces: ColorPiecesType) {
  for (const color in colorPieces) {
    const pieces = colorPieces[color];
    pieces.forEach(piece => {
      _imgContainers[piece.row][piece.col].innerHTML = getPieceImage(piece);
    });
  }
}

function clearLastMoveMarks() {
  const [row, col] = lastMoveCells[0];
  _imgContainers[row][col].classList.remove('last-move-from');
  const [_row, _col] = lastMoveCells[1];
  _imgContainers[_row][_col].classList.remove('last-move-to');
}

function markLastMove(from: CellType, to: CellType) {
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

function displayMoves(moves: MoveType[]) {
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

function selectSquare([row, col]: [number, number]) {
  unselectCurrentSquare();
  selectedSquare = _squares[row][col];
  selectedSquare!.classList.add('highlight');
}

function squareClick([row, col]: [number, number]) {
  selectSquare([row, col]);

  const { selectedPiece, currentColor } = gameState;

  if (selectedPiece) {
    if (currentColor === selectedPiece.color) {
      // Make move
      const move = selectedPiece.moves.find(({ moveTo }) => moveTo[0] === row && moveTo[1] === col);

      if (move) {
        if (appState.isMultiplayer) {
          if (gameState.playerColor === currentColor) {
            signalMoveMultiplayer(selectedPiece, move);
          }
        } else {
          makeLocalMoveAndPassTurn(selectedPiece, move);
        }
        return;
      }
    }
  }

  const piece = gameState.boardPieces[row][col];

  if (piece) {
    gameState.selectedPiece = piece;
    displayMoves(piece.moves);
  } else {
    gameState.selectedPiece = null;
  }
}

export {
  _imgContainers,
  unselectCurrentSquare,
  clearLastMoveMarks,
  markLastMove,
  initializeBoard,
  drawBoard,
  drawPieces,
};
