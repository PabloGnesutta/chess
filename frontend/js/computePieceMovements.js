import { players, state, movesHistory} from './gameState.js';

function moveObj(moveTo, captureAt) {
  const obj = { moveTo };
  if (captureAt) obj.captureAt = captureAt;
  return obj;
}

function bishopLikeMoves(boardPieces, piece) {
  const moves = [];
  let { row, col } = piece;

  while (row < _Z && col < _Z) {
    const cell = [++row, ++col];
    const boardPiece = boardPieces[cell[0]][cell[1]];
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
    const boardPiece = boardPieces[cell[0]][cell[1]];
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
  while (row < _Z && col > 0) {
    const cell = [++row, --col];
    const boardPiece = boardPieces[cell[0]][cell[1]];
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
  while (row > 0 && col < _Z) {
    const cell = [--row, ++col];
    const boardPiece = boardPieces[cell[0]][cell[1]];
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

function rookLikeMoves(boardPieces, piece) {
  const moves = [];
  let { row, col } = piece;

  while (row < _Z) {
    const cell = [++row, col];
    const boardPiece = boardPieces[cell[0]][cell[1]];
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
    const boardPiece = boardPieces[cell[0]][cell[1]];
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
  while (col < _Z) {
    const cell = [row, ++col];
    const boardPiece = boardPieces[cell[0]][cell[1]];
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
    const boardPiece = boardPieces[cell[0]][cell[1]];
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

function specificMoves(boardPieces, potentialMoves, pieceColor) {
  const moves = [];

  for (let i = 0; i < potentialMoves.length; i++) {
    const [row, col] = potentialMoves[i];
    if (row > _Z || row < 0 || col > _Z || col < 0) continue;
    const boardPiece = boardPieces[row][col];
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

function king(boardPieces, _piece) {
  const { row, col } = _piece;
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
    if (!_piece.hasntMoveYet || players[state.currentColor].isInCheck) {
      break castle;
    }

    rook1: {
      const rook = boardPieces[row][0];
      if (!rook || !rook.hasntMoveYet) {
        break rook1;
      }

      const castleSteps = [];
      for (var kCol = col - 1; kCol > rook.col; kCol--) {
        const blockingPiece = boardPieces[row][kCol];
        if (blockingPiece) {
          break rook1;
        }
        castleSteps.push([row, kCol]);
      }

      castleMoves.push({
        moveTo: [row, col - 2],
        castleSteps,
        rookFrom: [row, rook.col],
        rookTo: [row, col - 1],
      });
    }

    rook2: {
      const rook = boardPieces[row][_Z];
      if (!rook || !rook.hasntMoveYet) {
        break rook2;
      }

      const castleSteps = [];
      for (var kCol = col + 1; kCol < rook.col; kCol++) {
        const blockingPiece = boardPieces[row][kCol];
        if (blockingPiece) {
          break rook2;
        }
        castleSteps.push([row, kCol]);
      }

      castleMoves.push({
        moveTo: [row, col + 2],
        castleSteps,
        rookFrom: [row, rook.col],
        rookTo: [row, col + 1],
      });
    }
  }

  const moves = specificMoves(boardPieces, potentialMoves, _piece.color);

  _piece.moves = moves.concat(castleMoves);
}

function queen(boardPieces, _piece) {
  const bishopLike = bishopLikeMoves(boardPieces, _piece);
  const rookLike = rookLikeMoves(boardPieces, _piece);
  _piece.moves = bishopLike.concat(rookLike);
}

function rook(boardPieces, _piece) {
  _piece.moves = rookLikeMoves(boardPieces, _piece);
}

function bishop(boardPieces, _piece) {
  _piece.moves = bishopLikeMoves(boardPieces, _piece);
}

function knight(boardPieces, _piece) {
  const { row, col } = _piece;
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

  _piece.moves = specificMoves(boardPieces, potentialMoves, _piece.color);
}

function pawn(boardPieces, _piece) {
  const moves = [];
  const oneRankAhead = _piece.row + _piece.delta;

  let blockingPiece = boardPieces[oneRankAhead][_piece.col];
  if (!blockingPiece) {
    moves.push(moveObj([oneRankAhead, _piece.col]));

    if (_piece.row == _piece.startingRow) {
      const twoRanksAhead = _piece.row + _piece.delta * 2;
      blockingPiece = boardPieces[twoRanksAhead][_piece.col];
      if (!blockingPiece) {
        moves.push(moveObj([twoRanksAhead, _piece.col]));
      }
    }
  }

  const adjacentCol1 = _piece.col + 1;
  let oponentPiece = boardPieces[oneRankAhead][adjacentCol1];
  if (oponentPiece && oponentPiece.color !== _piece.color) {
    moves.push(
      moveObj([oneRankAhead, adjacentCol1], [oneRankAhead, adjacentCol1])
    );
  }

  const adjacentCol2 = _piece.col - 1;
  oponentPiece = boardPieces[oneRankAhead][adjacentCol2];
  if (oponentPiece && oponentPiece.color !== _piece.color) {
    moves.push(
      moveObj([oneRankAhead, adjacentCol2], [oneRankAhead, adjacentCol2])
    );
  }

  // EN-PASSANT
  // Pawn is in en-passant rank
  if (_piece.row === _piece.enPassantRow) {
    const lastMove = movesHistory[movesHistory.length - 1];
    // Last oponent move was a pawn
    if (lastMove.piece === P) {
      const lastMoveTo = lastMove.to;
      const lastMoveFrom = lastMove.from;
      // Oponent pawn was at starting rank and moved to _piece' rank
      if (
        lastMoveFrom[0] === _piece.enPassantRow + _piece.delta * 2 &&
        lastMoveTo[0] === _piece.enPassantRow
      ) {
        // Oponent pawn is adjacent to _piece
        if (
          lastMoveTo[1] === _piece.col + 1 ||
          lastMoveTo[1] === _piece.col - 1
        ) {
          // Capture one row ahead at opponent pawn's file
          moves.push(
            moveObj([_piece.row + _piece.delta, lastMoveTo[1]], lastMoveTo)
          );
        }
      }
    }
  }

  _piece.moves = moves;
}

const computeMoves = {
  king,
  queen,
  rook,
  bishop,
  knight,
  pawn,
};

export { computeMoves };
