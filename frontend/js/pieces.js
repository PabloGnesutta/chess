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
  const captures = [];
  let { row, col } = piece;

  while (row < ROW_Z) {
    const cell = [++row, col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }

  row = piece.row;
  while (row > 0) {
    const cell = [--row, col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }

  row = piece.row;
  while (col < COL_Z) {
    const cell = [row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }

  col = piece.col;
  while (col > 0) {
    const cell = [row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) captures.push(cell);
      break;
    }
    moves.push(cell);
  }

  return { moves, captures };
}


function pawn(row, col, color) {
  return {
    ...piece(P, row, col, color),
    img: buildImg(P, color),
    delta: color === 'b' ? 1 : -1,
    isAtStartingPosition: true,
    computeMoves() {
      let boardPiece;
      const moves = [];

      const oneStep = [this.row + this.delta, this.col];
      boardPiece = board[oneStep[0]][oneStep[1]];
      if (!boardPiece) {
        moves.push(oneStep);
        if (this.isAtStartingPosition) {
          const twoSteps = [this.row + this.delta * 2, this.col];
          boardPiece = board[twoSteps[0]][twoSteps[1]];
          if (!boardPiece) {
            moves.push(twoSteps);
          }
        }
      }

      const captures = [];
      const oneWay = [this.row + this.delta, this.col + 1];
      boardPiece = board[oneWay[0]][oneWay[1]];
      if (boardPiece && boardPiece.color !== this.color) {
        captures.push(oneWay);
      }

      const theOther = [this.row + this.delta, this.col - 1];
      boardPiece = board[theOther[0]][theOther[1]];
      if (boardPiece && boardPiece.color !== this.color) {
        captures.push(theOther);
      }

      // TODO: EN PASSANT

      displayMoves(moves);
      displayCaptures(captures);
    },
  };
}

function knight(row, col, color) {
  return {
    ...piece(N, row, col, color),
    img: buildImg(N, color),
    computeMoves() {
      const { row, col } = this;
      const potentialMoves = [
        [row + 1, col + 2],
        [row + 2, col + 1],
        [row - 1, col - 2],
        [row - 2, col - 1],
        [row - 1, col + 2],
        [row - 2, col + 1],
        [row + 1, col - 2],
        [row + 2, col - 1]

      ];

      const moves = [];
      const captures = [];
      for (let i = 0; i < potentialMoves.length; i++) {
        const [row, col] = potentialMoves[i];
        if (row > ROW_Z || row < 0 || col > COL_Z || col < 0) continue;
        const boardPiece = board[row][col];
        if (boardPiece) {
          if (boardPiece.color !== this.color) {
            captures.push([row, col]);
          }
          continue;
        }
        moves.push([row, col]);
      }

      displayMoves(moves);
      displayCaptures(captures);
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
      const { moves, captures } = rookLikeMoves(this);
      displayMoves(moves);
      displayCaptures(captures);
    },
  };
}

function queen(row, col, color) {
  return {
    ...piece(Q, row, col, color),
    img: buildImg(Q, color),
    computeMoves() {
      const bishopLike = bishopLikeMoves(this);
      const rookLike = rookLikeMoves(this);
      const moves = bishopLike.moves.concat(rookLike.moves);
      const captures = bishopLike.captures.concat(rookLike.captures);

      displayMoves(moves);
      displayCaptures(captures);
    },
  };
}

function king(row, col, color) {
  return {
    ...piece(K, row, col, color),
    img: buildImg(K, color),
    computeMoves() {
      const moves = [];
      const captures = [];

      displayMoves(moves);
      displayCaptures(captures);
    },
  };
}



export default { pawn, knight, bishop, rook, queen, king, selectedPiece, pieces };