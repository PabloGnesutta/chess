import boardLib from './board.js';
const { board, displayMoves, displayCaptures } = boardLib;

let idCount = 0;
var selectedPiece = {};
const pieces = [];

function buildImg(type, color) {
  return `<div class="piece ${type} ${color}">${type}</div>`;
}

function piece(name, row, col, color) {
  return {
    id: ++idCount,
    name,
    row,
    col,
    color,
    placeAt() { }
  };
}

function bishopLikeMoves(piece) {
  const moves = [];
  const captures = [];
  let { row, col } = piece;

  while (row < ROW_Z && col < COL_Z) {
    const cell = [++row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }

  row = piece.row;
  col = piece.col;
  while (row > 0 && col > 0) {
    const cell = [--row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }
  row = piece.row;
  col = piece.col;
  while (row < ROW_Z && col > 0) {
    const cell = [++row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }
  row = piece.row;
  col = piece.col;
  while (row > 0 && col < COL_Z) {
    const cell = [--row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }

  return { moves, captures };
}

function rookLikeMoves(piece) {
  const moves = [];
  let row = -1;
  let col = piece.col;
  while (row < ROW_Z) {
    row++;
    if (row === piece.row) continue;
    moves.push([row, col]);
  }
  row = piece.row;
  col = -1;
  while (col < COL_Z) {
    col++;
    if (col === piece.col) continue;
    moves.push([row, col]);
  }

  return moves;
}


function pawn(row, col, color) {
  return {
    ...piece(P, row, col, color),
    img: buildImg(P, color),
    delta: color === 'b' ? 1 : -1,
    isAtStartingPosition: true,
    computeMoves() {
      const potentialMoves = [];
      const potentialCaptures = [];
      if (this.isAtStartingPosition) {
        potentialMoves.push(
          [this.row + this.delta, this.col],
          [this.row + this.delta * 2, this.col],
        );
      }
      displayMoves(potentialMoves);
    },
  };
}

function knight(row, col, color) {
  return {
    ...piece(N, row, col, color),
    img: buildImg(N, color),
    computeMoves() {
      let potentialMoves = [];
      const { row, col } = this;
      potentialMoves.push(
        [row + 1, col + 2],
        [row + 2, col + 1],
        [row - 1, col - 2],
        [row - 2, col - 1],
        [row - 1, col + 2],
        [row - 2, col + 1],
        [row + 1, col - 2],
        [row + 2, col - 1]
      );

      potentialMoves = potentialMoves.filter(([r, c]) =>
        r >= 0 && r <= ROW_Z && c >= 0 && c <= COL_Z
      );

      displayMoves(potentialMoves);
    },
  };
}

function bishop(row, col, color) {
  return {
    ...piece(B, row, col, color),
    img: buildImg(B, color),
    computeMoves() {
      const { moves, captures } = bishopLikeMoves(this);
      displayMoves(moves);
      displayCaptures(captures);
    },
  };
}

function rook(row, col, color) {
  return {
    ...piece(R, row, col, color),
    img: buildImg(R, color),
    computeMoves() {
      const moves = rookLikeMoves(this);
      displayMoves(moves);
    },
  };
}

function queen(row, col, color) {
  return {
    ...piece(Q, row, col, color),
    img: buildImg(Q, color),
    computeMoves() {
      const moves = bishopLikeMoves(this).concat(rookLikeMoves(this));

      displayMoves(moves);
    },
  };
}



export default { pawn, knight, bishop, rook, queen, selectedPiece, pieces };