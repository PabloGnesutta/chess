import {
  players,
  board,
  state,
  colorPieces,
  movesHistory,
} from './gameState.js';
import {
  _imgContainers,
  displayMovesInBoard,
  displayCapturesInBoard,
} from './board.js';

let idCount = 0;

function buildImg(type, color) {
  const colorCode = color === 'w' ? 'l' : 'd';
  let pieceCode = type[0];
  if (type === 'knight') pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  const filePath = `./svg/${fileName}`;
  return `<img src=${filePath} class="piece ${type} ${color}"></img>`;
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

    showMoves() {
      displayMovesInBoard(this.moves);
      displayCapturesInBoard(this.captures);
    },

    placeAt(moveOrCapture, [row, col]) {
      const { currentColor, opositeColor } = state;
      _imgContainers[this.row][this.col].innerHTML = null;

      board[this.row][this.col] = null;

      // Capture:
      if (moveOrCapture === 'capture') {
        const capturablePiece = board[row][col];
        const pieceIndex = colorPieces[opositeColor].findIndex(
          piece => piece.id === capturablePiece.id
        );
        const capturedPiece = colorPieces[opositeColor].splice(pieceIndex, 1);

        players[currentColor].captures.push(capturedPiece);
      }

      // Pawn promotion
      if (this.name === P && (row === 0 || row === COL_Z)) {
        log('promotion!');
      }

      this.row = row;
      this.col = col;
      board[row][col] = this;
      _imgContainers[row][col].innerHTML = this.img;
    },
  };
}

function bishopLikeMoves(board, piece) {
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

function rookLikeMoves(board, piece) {
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

function specificMoves(board, potentialMoves, pieceColor) {
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
    startingRow: color === 'w' ? 6 : 1,
    enPassantRow: color === 'w' ? 3 : 4,
    computeMoves(board) {
      let boardPiece;
      const moves = [];

      const oneStep = [this.row + this.delta, this.col];
      boardPiece = board[oneStep[0]][oneStep[1]];
      if (!boardPiece) {
        moves.push(oneStep);
        if (this.row == this.startingRow) {
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
      if (this.row === this.enPassantRow) {
        const lastMove = movesHistory[movesHistory.length - 1];
        if (lastMove.piece === P) {
          const lastMoveTo = lastMove.to;
          const lastMoveFrom = lastMove.from;
          if (lastMoveTo[0] === this.enPassantRow) {
            if (lastMoveFrom[0] === this.enPassantRow + this.delta * 2) {
              if (
                lastMoveTo[1] === this.col + 1 ||
                lastMoveTo[1] === this.col - 1
              ) {
                // captures.push([lastMoveTo[0] + this.delta, lastMoveTo[1]]);
              }
            }
          }
        }
      }

      this.moves = moves;
      this.captures = captures;
    },
  };
}

function knight(row, col, color) {
  return {
    ...piece(N, row, col, color),
    img: buildImg(N, color),
    computeMoves(board) {
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

      const { moves, captures } = specificMoves(
        board,
        potentialMoves,
        this.color
      );
      this.moves = moves;
      this.captures = captures;
    },
  };
}

function bishop(row, col, color) {
  return {
    ...piece(B, row, col, color),
    img: buildImg(B, color),
    computeMoves(board) {
      const { moves, captures } = bishopLikeMoves(board, this);
      this.moves = moves;
      this.captures = captures;
    },
  };
}

function rook(row, col, color) {
  return {
    ...piece(R, row, col, color),
    img: buildImg(R, color),
    computeMoves(board) {
      const { moves, captures } = rookLikeMoves(board, this);
      this.moves = moves;
      this.captures = captures;
    },
  };
}

function queen(row, col, color) {
  return {
    ...piece(Q, row, col, color),
    img: buildImg(Q, color),
    computeMoves(board) {
      const bishopLike = bishopLikeMoves(board, this);
      const rookLike = rookLikeMoves(board, this);
      const moves = bishopLike.moves.concat(rookLike.moves);
      const captures = bishopLike.captures.concat(rookLike.captures);

      this.moves = moves;
      this.captures = captures;
    },
  };
}

function king(row, col, color) {
  return {
    ...piece(K, row, col, color),
    img: buildImg(K, color),
    computeMoves(board) {
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

      const { moves, captures } = specificMoves(
        board,
        potentialMoves,
        this.color
      );
      this.moves = moves;
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

export { colorPieces };
