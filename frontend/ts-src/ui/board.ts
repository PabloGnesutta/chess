import { COL_MAP, NAME_MAP_INITIALS, R, ROW_MAP, _Z } from '../globals.js';
import { appState } from '../state/appState.js';
import { CellType, ColorPiecesType, ColorType, gameState } from '../state/gameState.js';
import { makeLocalMoveAndPassTurn, signalMoveMultiplayer } from '../engine/gameFlow.js';
import { getPieceImage, MoveType, Piece } from '../engine/piecesLib.js';

import { $, createElement } from './DOM.js';

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

const _board = $('board')!;

var selectedSquare: HTMLElement | null = null;
var movementMarkSquares: HTMLElement[] = [];
var lastMoveCells: CellType[] = [
  [0, 0], // from
  [0, 0], // to
];

type Indicators = {
  rankIndicatorAtCol: number;
  fileIndicatorAtRow: number;
};

function initializeBoard() {
  const indicatorsByColor: { [key: string]: Indicators } = {
    w: {
      rankIndicatorAtCol: 0,
      fileIndicatorAtRow: _Z,
    },
    b: {
      rankIndicatorAtCol: _Z,
      fileIndicatorAtRow: 0,
    },
  };

  for (let row = 0; row <= _Z; row++) {
    const _row = createElement('div', { className: 'row' });

    for (let col = 0; col <= _Z; col++) {
      const _square = createElement('div', { className: 'square' });
      _square.setAttribute('row', row.toString());
      _square.setAttribute('col', col.toString());
      _square.addEventListener('mousedown', () => squareClick([row, col]));
      _squares[row][col] = _square;

      const _imgContainer = createElement('div', { className: 'img-container' });
      _imgContainers[row][col] = _imgContainer;

      _square.appendChild(_imgContainer);
      _row.appendChild(_square);

      // debug
      const _rowCol = createElement('div', { className: 'row-col-indicator', text: row + '_' + col });
      _square.appendChild(_rowCol);

      for (const color in indicatorsByColor) {
        const indicators = indicatorsByColor[color];
        if (col === indicators.rankIndicatorAtCol) {
          const rankIndicator = createElement('div', {
            classList: ['rank-indicator', 'pov-' + color],
            text: ROW_MAP[row].toString(),
          });
          _square.appendChild(rankIndicator);
        }
        if (row === indicators.fileIndicatorAtRow) {
          const fileIndicator = createElement('div', {
            classList: ['file-indicator', 'pov-' + color],
            text: COL_MAP[col].toString(),
          });
          _square.appendChild(fileIndicator);
        }
      }
    }
  }
}

function drawBoard(pov = 'w') {
  _board.innerHTML = '';
  _board.classList.remove('pov-w');
  _board.classList.remove('pov-b');
  _board.classList.add('pov-' + pov);

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

  for (let row = rowStart; rowEval(row); row += rowInc) {
    const _row = createElement('div', { className: 'row' });
    for (let col = colStart; colEval(col); col += colInc) {
      const _square = _squares[row][col];
      _row.appendChild(_square);
    }
    _board.appendChild(_row);
  }
}

function drawPieces(colorPieces: ColorPiecesType) {
  for (const color in colorPieces) {
    const pieces = colorPieces[color];
    pieces.forEach(piece => {
      _imgContainers[piece.row][piece.col].innerHTML = getPieceImage(piece.name, color as ColorType);
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

  // Make move
  if (appState.viewMode === 'GAME') {
    if (selectedPiece) {
      if (currentColor === selectedPiece.color) {
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
  }

  const piece = gameState.boardPieces[row][col];

  if (piece) {
    gameState.selectedPiece = piece;
    displayMoves(piece.moves);
  } else {
    gameState.selectedPiece = null;
  }
}

function drawPositionHistoryItem(position: string) {
  for (let row = 0; row <= _Z; row++) {
    for (let col = 0; col <= _Z; col++) _imgContainers[row][col].innerHTML = '';
  }

  const pieces = position.split(';');

  pieces.forEach(piece => {
    const color = piece[0] as ColorType;
    const name = piece[1];
    const row = +piece[2];
    const col = +piece[3];
    _imgContainers[row][col].innerHTML = getPieceImage(NAME_MAP_INITIALS[name], color);
  });
}

function drawMove(piece: Piece, move: MoveType): void {
  const { moveTo } = move;
  let rowFrom = piece.row;
  let colFrom = piece.col;
  let [rowTo, colTo] = moveTo;
  _imgContainers[rowFrom][colFrom].innerHTML = null;
  _imgContainers[rowTo][colTo].innerHTML = getPieceImage(piece.name, piece.color);

  if (move.castleSteps) {
    const { rookFrom, rookTo } = move;
    [rowFrom, colFrom] = rookFrom!;
    [rowTo, colTo] = rookTo!;
    _imgContainers[rowFrom][colFrom].innerHTML = null;
    _imgContainers[rowTo][colTo].innerHTML = getPieceImage(R, piece.color);
  }
}

export {
  _board,
  _imgContainers,
  unselectCurrentSquare,
  clearLastMoveMarks,
  markLastMove,
  initializeBoard,
  drawBoard,
  drawMove,
  drawPieces,
  drawPositionHistoryItem,
};
