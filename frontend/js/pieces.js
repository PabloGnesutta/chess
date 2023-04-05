import {
  board,
  _squares,
  displayMovesInBoard,
  displayCapturesInBoard,
} from './board.js';

import { players, state } from './gameState.js';

let idCount = 0;

const allPieces = [];
const colorPieces = {
  w: [],
  b: [],
};

function buildImg(type, color) {
  const colorCode = color === 'w' ? 'l' : 'd';
  let pieceCode = type[0];
  if (type === 'knight') pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  return `<img src='./svg/${fileName}' class="piece ${type} ${color}"></img>`;
}

function piece(name, row, col, color) {
  return {
    id: ++idCount,
    name,
    row,
    col,
    color,
    moves: [],
    captures: [],
    movesComputedBeforeMoving: false,

    placeAt([row, col]) {
      board[this.row][this.col] = null;
      _squares[this.row][this.col].innerHTML = null;

      this.row = row;
      this.col = col;

      // Capture:
      const currentPieceInCell = board[row][col];
      if (currentPieceInCell && currentPieceInCell.color !== this.color) {
        const enemyPieceIdx = allPieces.findIndex(
          piece => piece.id === currentPieceInCell.id
        );

        const capturedPiece = allPieces.splice(enemyPieceIdx, 1)[0];

        const colorPieceIndex = colorPieces[capturedPiece.color].findIndex(
          piece => piece.id === capturedPiece.id
        );
        colorPieces[capturedPiece.color].splice(colorPieceIndex, 1);

        players[state.currentColor].captures.push(capturedPiece);
      }

      board[row][col] = this;
      _squares[row][col].innerHTML = this.img;

      // Pawn
      if (this.name === P) {
        this.isAtStartingPosition = false;
        if (row === 0 || row === COL_Z) {
          log('promotion!');
        }
      }
    },

    showMoves() {
      if (!this.movesComputedBeforeMoving) {
        this.computeMoves();
        this.movesComputedBeforeMoving = true;
      }
      displayMovesInBoard(this.moves);
      displayCapturesInBoard(this.captures);
    },
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

function specificMoves(potentialMoves, pieceColor) {
  const moves = [];
  const captures = [];
  for (let i = 0; i < potentialMoves.length; i++) {
    const [row, col] = potentialMoves[i];
    if (row > ROW_Z || row < 0 || col > COL_Z || col < 0) continue;
    const boardPiece = board[row][col];
    if (boardPiece) {
      if (boardPiece.color !== pieceColor) {
        captures.push([row, col]);
      }
      continue;
    }
    moves.push([row, col]);
  }
  return { moves, captures };
}

function pawn(row, col, color) {
  return {
    ...piece(P, row, col, color),
    img: buildImg(P, color),
    delta: color === 'w' ? -1 : 1,
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

      // TODO: EN-PASSANT
      this.moves = moves.concat(captures);
      this.captures = captures;
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
        [row + 2, col - 1],
      ];

      const { moves, captures } = specificMoves(potentialMoves, this.color);
      this.moves = moves.concat(captures);
      this.captures = captures;
    },
  };
}

function bishop(row, col, color) {
  return {
    ...piece(B, row, col, color),
    img: buildImg(B, color),
    computeMoves() {
      const { moves, captures } = bishopLikeMoves(this);
      this.moves = moves.concat(captures);
      this.captures = captures;
    },
  };
}

function rook(row, col, color) {
  return {
    ...piece(R, row, col, color),
    img: buildImg(R, color),
    computeMoves() {
      const { moves, captures } = rookLikeMoves(this);
      this.moves = moves.concat(captures);
      this.captures = captures;
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

      this.moves = moves.concat(captures);
      this.captures = captures;
    },
  };
}

function king(row, col, color) {
  return {
    ...piece(K, row, col, color),
    img: buildImg(K, color),
    computeMoves() {
      const { row, col } = this;
      const potentialMoves = [
        [row + 1, col],
        [row - 1, col],
        [row + 1, col + 1],
        [row - 1, col + 1],
        [row + 1, col - 1],
        [row - 1, col - 1],
        [row, col + 1],
        [row, col - 1],
      ];

      const { moves, captures } = specificMoves(potentialMoves, this.color);
      this.moves = moves.concat(captures);
      this.captures = captures;
    },
  };
}

export default {
  pawn,
  knight,
  bishop,
  rook,
  queen,
  king,
};

export { allPieces, colorPieces };
