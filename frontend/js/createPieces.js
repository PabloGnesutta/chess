import { displayMoves, _imgContainers } from './board.js';
import {
  board,
  colorPieces,
  movesHistory,
  players,
  state,
} from './gameState.js';

let idCount = 0;

function _moveObj(moveTo, captureAt) {
  const moveObj = { moveTo };
  if (captureAt) {
    moveObj.captureAt = captureAt;
  }
  return moveObj;
}

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

    showMoves() {
      displayMoves(this.moves);
    },

    doMove(move) {
      const { moveTo, captureAt } = move;
      const [row, col] = moveTo;

      // Remove piece from the board at current position
      board[this.row][this.col] = null;
      _imgContainers[this.row][this.col].innerHTML = null;

      const { currentColor, opositeColor } = state;

      // Capture:
      if (captureAt) {
        // Remove captured piece from board
        const [_row, _col] = captureAt;
        const captuerdBoardPiece = board[_row][_col];

        // Remove from colorPieces
        const pieceIndex = colorPieces[opositeColor].findIndex(
          piece => piece.id === captuerdBoardPiece.id
        );
        const capturedPiece = colorPieces[opositeColor].splice(pieceIndex, 1);

        players[currentColor].captures.push(capturedPiece);

        // for en-passant
        board[_row][_col] = null;
        _imgContainers[_row][_col].innerHTML = null;
      }

      // Pawn promotion
      if (this.name === P && (row === 0 || row === COL_Z)) {
        // TODO
      }

      // Place piece on the board at new position
      this.row = row;
      this.col = col;
      board[row][col] = this;
      _imgContainers[row][col].innerHTML = this.img;
    },
  };
}

function bishopLikeMoves(board, piece) {
  const moves = [];
  let { row, col } = piece;

  while (row < ROW_Z && col < COL_Z) {
    const cell = [++row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(_moveObj(cell));
    }
  }

  row = piece.row;
  col = piece.col;
  while (row > 0 && col > 0) {
    const cell = [--row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(_moveObj(cell));
    }
  }

  row = piece.row;
  col = piece.col;
  while (row < ROW_Z && col > 0) {
    const cell = [++row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(_moveObj(cell));
    }
  }

  row = piece.row;
  col = piece.col;
  while (row > 0 && col < COL_Z) {
    const cell = [--row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(_moveObj(cell));
    }
  }

  return moves;
}

function rookLikeMoves(board, piece) {
  const moves = [];
  let { row, col } = piece;

  while (row < ROW_Z) {
    const cell = [++row, col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      };
    } else {
      moves.push(_moveObj(cell));
    }
  }

  row = piece.row;
  while (row > 0) {
    const cell = [--row, col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      };
    } else {
      moves.push(_moveObj(cell));
    }
  }

  row = piece.row;
  while (col < COL_Z) {
    const cell = [row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      };
    } else {
      moves.push(_moveObj(cell));
    }
  }

  col = piece.col;
  while (col > 0) {
    const cell = [row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(_moveObj(cell, cell));
      };
    } else {
      moves.push(_moveObj(cell));
    }
  }

  return moves;
}

function specificMoves(board, potentialMoves, pieceColor) {
  const moves = [];

  for (let i = 0; i < potentialMoves.length; i++) {
    const [row, col] = potentialMoves[i];
    if (row > ROW_Z || row < 0 || col > COL_Z || col < 0) continue;
    const boardPiece = board[row][col];
    if (boardPiece) {
      if (boardPiece.color !== pieceColor) {
        moves.push(_moveObj([row, col], [row, col]));
      }
    } else {
      moves.push(_moveObj([row, col]));
    }
  }

  return moves;
}

function pawn(row, col, color) {
  return {
    ...piece(P, row, col, color),
    img: buildImg(P, color),
    delta: color === 'w' ? -1 : 1,
    startingRow: color === 'w' ? 6 : 1,
    enPassantRow: color === 'w' ? 3 : 4,
    computeMoves(board) {
      const moves = [];
      const oneRankAhead = this.row + this.delta;

      let blockingPiece = board[oneRankAhead][this.col];
      if (!blockingPiece) {
        moves.push(_moveObj([oneRankAhead, this.col]));

        if (this.row == this.startingRow) {
          const twoRanksAhead = this.row + this.delta * 2;
          blockingPiece = board[twoRanksAhead][this.col];
          if (!blockingPiece) {
            moves.push(_moveObj([twoRanksAhead, this.col]));
          }
        }
      }

      const adjacentCol1 = this.col + 1;
      let oponentPiece = board[oneRankAhead][adjacentCol1];
      if (oponentPiece && oponentPiece.color !== this.color) {
        moves.push(_moveObj([oneRankAhead, adjacentCol1], [oneRankAhead, adjacentCol1]));
      }

      const adjacentCol2 = this.col - 1;
      oponentPiece = board[oneRankAhead][adjacentCol2];
      if (oponentPiece && oponentPiece.color !== this.color) {
        moves.push(_moveObj([oneRankAhead, adjacentCol2], [oneRankAhead, adjacentCol2]));

      }

      // EN-PASSANT
      // Pawn is in en-passant rank
      if (this.row === this.enPassantRow) {
        const lastMove = movesHistory[movesHistory.length - 1];
        // Last oponent move was a pawn
        if (lastMove.piece === P) {
          const lastMoveTo = lastMove.to;
          const lastMoveFrom = lastMove.from;
          // Oponent pawn was at starting rank and moved to this' rank
          if (
            lastMoveFrom[0] === this.enPassantRow + this.delta * 2 &&
            lastMoveTo[0] === this.enPassantRow
          ) {
            // Oponent pawn is adjacent to this
            if (
              lastMoveTo[1] === this.col + 1 ||
              lastMoveTo[1] === this.col - 1
            ) {
              // Capture one row ahead at opponent pawn's file
              moves.push(_moveObj([this.row + this.delta, lastMoveTo[1]], lastMoveTo));
            }
          }
        }
      }

      this.moves = moves;
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

      // TODO: Castle

      this.moves = specificMoves(
        board,
        potentialMoves,
        this.color
      );
    },
  };
}

function bishop(row, col, color) {
  return {
    ...piece(B, row, col, color),
    img: buildImg(B, color),
    computeMoves(board) {
      this.moves = bishopLikeMoves(board, this);
    },
  };
}

function rook(row, col, color) {
  return {
    ...piece(R, row, col, color),
    img: buildImg(R, color),
    computeMoves(board) {
      this.moves = rookLikeMoves(board, this);
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
      this.moves = bishopLike.concat(rookLike);
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

      this.moves = specificMoves(
        board,
        potentialMoves,
        this.color
      );
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
