import { displayMoves, _imgContainers } from './board.js';
import { board, pieces, movesHistory, players, state } from './gameState.js';

let idCount = 0;

function moveObj(moveTo, captureAt) {
  const obj = { moveTo };
  if (captureAt) obj.captureAt = captureAt;
  return obj;
}

function buildImg(type, color) {
  const colorCode = color === 'w' ? 'l' : 'd';
  let pieceCode = type[0];
  if (type === 'knight') pieceCode = 'n';
  const fileName = 'Chess_' + pieceCode + colorCode + 't45.svg';
  const filePath = `./svg/${fileName}`;
  return `<img src=${filePath} class="piece ${type} ${color}"></img>`;
}

function displcePieceTo(piece, moveTo) {
  const { row, col } = piece;
  const [rowTo, colTo] = moveTo;

  // Remove piece from the board at current position
  board[row][col] = null;
  _imgContainers[row][col].innerHTML = null; // render

  // Place piece on the board at new position
  piece.row = rowTo;
  piece.col = colTo;
  board[rowTo][colTo] = piece;
  _imgContainers[rowTo][colTo].innerHTML = piece.img; // render
  piece.hasntMoveYet = false;
}

function promotePawnAt(pawn, [row, col]) {
  const { currentColor } = state;
  const pieceIndex = pieces[currentColor].findIndex(
    piece => piece.id === pawn.id
  );
  pieces[currentColor].splice(pieceIndex, 1);
  board[row][col] = null;

  const promotedPiece = queen(row, col, currentColor);
  pieces[currentColor].push(promotedPiece);
  board.putPiece(promotedPiece);
  _imgContainers[row][col].innerHTML = promotedPiece.img; // render
}

function _doMove(piece, move) {
  const { currentColor, opositeColor } = state;
  const { moveTo, captureAt } = move;
  const [rowTo, colTo] = moveTo;

  displcePieceTo(piece, moveTo);

  // Capture:
  if (captureAt) {
    // Remove captured piece from board
    const [rowCapt, colCapt] = captureAt;
    const captuerdBoardPiece = board[rowCapt][colCapt];
    // Remove it from pieces
    const pieceIndex = pieces[opositeColor].findIndex(
      piece => piece.id === captuerdBoardPiece.id
    );
    const capturedPiece = pieces[opositeColor].splice(pieceIndex, 1);
    // Add to player's captures
    players[currentColor].captures.push(capturedPiece);
    // en-passant
    if (colTo !== colCapt || rowTo !== rowCapt) {
      board[rowCapt][colCapt] = null;
      _imgContainers[rowCapt][colCapt].innerHTML = null; // render
    }
  }

  if (piece.name === P && (rowTo === 0 || rowTo === ROW_Z)) {
    promotePawnAt(piece, [rowTo, colTo]);
  }
}

function piece(name, row, col, color) {
  return {
    id: ++idCount,
    name,
    row,
    col,
    color,
    moves: [],
    hasntMoveYet: true,

    showMoves() {
      displayMoves(this.moves);
    },

    doMove(move) {
      _doMove(this, move);
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
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
    }
  }

  row = piece.row;
  col = piece.col;
  while (row > 0 && col > 0) {
    const cell = [--row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
    }
  }

  row = piece.row;
  col = piece.col;
  while (row < ROW_Z && col > 0) {
    const cell = [++row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
    }
  }

  row = piece.row;
  col = piece.col;
  while (row > 0 && col < COL_Z) {
    const cell = [--row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
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
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
    }
  }

  row = piece.row;
  while (row > 0) {
    const cell = [--row, col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
    }
  }

  row = piece.row;
  while (col < COL_Z) {
    const cell = [row, ++col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
    }
  }

  col = piece.col;
  while (col > 0) {
    const cell = [row, --col];
    const boardPiece = board[cell[0]][cell[1]];
    if (boardPiece) {
      if (boardPiece.color !== piece.color) {
        moves.push(moveObj(cell, cell));
      }
      break;
    } else {
      moves.push(moveObj(cell));
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
        moves.push(moveObj([row, col], [row, col]));
      }
    } else {
      moves.push(moveObj([row, col]));
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
        moves.push(moveObj([oneRankAhead, this.col]));

        if (this.row == this.startingRow) {
          const twoRanksAhead = this.row + this.delta * 2;
          blockingPiece = board[twoRanksAhead][this.col];
          if (!blockingPiece) {
            moves.push(moveObj([twoRanksAhead, this.col]));
          }
        }
      }

      const adjacentCol1 = this.col + 1;
      let oponentPiece = board[oneRankAhead][adjacentCol1];
      if (oponentPiece && oponentPiece.color !== this.color) {
        moves.push(
          moveObj([oneRankAhead, adjacentCol1], [oneRankAhead, adjacentCol1])
        );
      }

      const adjacentCol2 = this.col - 1;
      oponentPiece = board[oneRankAhead][adjacentCol2];
      if (oponentPiece && oponentPiece.color !== this.color) {
        moves.push(
          moveObj([oneRankAhead, adjacentCol2], [oneRankAhead, adjacentCol2])
        );
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
              moves.push(
                moveObj([this.row + this.delta, lastMoveTo[1]], lastMoveTo)
              );
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

      this.moves = specificMoves(board, potentialMoves, this.color);
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

function _doCastle(piece, move) {
  const { moveTo, rookFrom, rookTo } = move;

  displcePieceTo(piece, moveTo);

  // Move corresponding rook
  const [_row, _col] = rookFrom;
  const rook = board[_row][_col];

  if (!rook) return warn('Rook not found while castling');

  displcePieceTo(rook, rookTo);
}

function king(row, col, color) {
  return {
    ...piece(K, row, col, color),
    img: buildImg(K, color),

    // Overwrite inherited doMove method
    doMove(move) {
      if (move.rookFrom) {
        _doCastle(this, move);
      } else {
        _doMove(this, move);
      }
    },

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

      const castleMoves = [];

      castle: {
        if (!this.hasntMoveYet || players[state.currentColor].isInCheck) {
          break castle;
        }

        rook1: {
          const rook = board[row][0];
          if (!rook || !rook.hasntMoveYet) {
            break rook1;
          }

          const castleSteps = [];
          for (var kCol = col - 1; kCol > rook.col; kCol--) {
            const blockingPiece = board[row][kCol];
            if (blockingPiece) {
              break rook1;
            }
            castleSteps.push([row, kCol]);
          }

          castleMoves.push({
            moveTo: [row, col - 2],
            steps: castleSteps,
            rookFrom: [row, rook.col],
            rookTo: [row, col - 1],
          });
        }

        rook2: {
          const rook = board[row][ROW_Z];
          if (!rook || !rook.hasntMoveYet) {
            break rook2;
          }

          const castleSteps = [];
          for (var kCol = col + 1; kCol < rook.col; kCol++) {
            const blockingPiece = board[row][kCol];
            if (blockingPiece) {
              break rook2;
            }
            castleSteps.push([row, kCol]);
          }

          castleMoves.push({
            moveTo: [row, col + 2],
            steps: castleSteps,
            rookFrom: [row, rook.col],
            rookTo: [row, col + 1],
          });
        }
      }

      const moves = specificMoves(board, potentialMoves, this.color);

      this.moves = moves.concat(castleMoves);
    },
  };
}

export default {
  bishop,
  king,
  knight,
  pawn,
  queen,
  rook,
};
