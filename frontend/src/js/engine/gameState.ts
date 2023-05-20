import { MoveData, signalMoveToServer } from '../ws/ws.js';
import { filterLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves.js';
import { Piece, doCastle, doMove, MoveType } from './piecesLib.js';
import { _imgContainers, markLastMove, unselectCurrentSquare } from './board.js';
import { computeMoves } from './computePieceMovements.js';

export type ColorType = 'w' | 'b';
export type PieceNameType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export type CellType = [number, number];

export type LastMoveType = {
  piece: PieceNameType;
  from: CellType;
  to: CellType;
  color: string;
};

export type ColorPiecesType = {
  [key: string]: Piece[];
};

export type BoardPiecesType = {
  // row
  [key: number]: {
    // col
    [key: number]: Piece;
  };
};

export type PlayersType = {
  // id
  [key: string]: {
    color: ColorType;
    isInCheck: boolean;
    captures: Piece[];
  };
};

export type State = {
  currentColor: ColorType;
  opositeColor: ColorType;
  selectedPiece: Piece | null;
  isMultiPlayer: boolean;
  playerColor: ColorType | '';
  lastMove: LastMoveType | {};
};

const movesHistory: string[] = [];

const colorPieces: ColorPiecesType = {
  w: [],
  b: [],
};

const boardPieces: BoardPiecesType = {
  0: {},
  1: {},
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
  7: {},
};

const players: PlayersType = {
  w: {
    color: 'w',
    isInCheck: false,
    captures: [],
  },
  b: {
    color: 'b',
    isInCheck: false,
    captures: [],
  },
};

const state: State = {
  currentColor: 'w',
  opositeColor: 'b',
  selectedPiece: null,
  isMultiPlayer: false,
  playerColor: '',
  lastMove: {},
};

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function resetState(): void {
  for (const color in players) {
    const player = players[color];
    colorPieces[color].splice(0, colorPieces[color].length);
    player.isInCheck = false;
    player.captures = [];
  }

  for (let row = 0; row <= _Z; row++) {
    boardPieces[row] = {};
    for (let col = 0; col <= _Z; col++) {
      _imgContainers[row][col].innerHTML = null;
    }
  }

  movesHistory.splice(0, movesHistory.length);

  state.currentColor = 'w';
  state.opositeColor = 'b';
  state.selectedPiece = null;
  state.lastMove = {};
}

function makeLocalMove(piece: Piece, move: MoveType): void {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col] as CellType,
    to: move.moveTo,
    color: state.currentColor,
  };

  movesHistory.push(JSON.stringify(historyItem));

  state.lastMove = historyItem;

  unselectCurrentSquare();

  if (move.castleSteps) {
    doCastle(piece, move);
  } else {
    doMove(piece, move);
  }

  passTurn();
}

function makeRemoteMove(moveData: MoveData): void {
  const { pieceId, move } = moveData;
  const piece = colorPieces[state.currentColor].find(p => p.id === pieceId);
  if (piece) {
    makeLocalMove(piece, move);
  } else {
    warn('Piece not found @makeRemoteMove', moveData);
  }
}

function signalMoveMultiplayer(piece: Piece, move: MoveType): void {
  signalMoveToServer([piece.row, piece.col], move.moveTo);
  makeLocalMove(piece, move);
}

function startTurn(): void {
  const { currentColor, opositeColor } = state;

  // TODO: stalemate by repetition

  // Am I in check?
  const imInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces[opositeColor]);

  if (imInCheck) {
    players[currentColor].isInCheck = true;
    log('check');
  }

  // Compute all legal moves for current player.
  // (Moves that don't put the player in check)
  // If no legal moves, then it's check mate or stale mate.
  let numLegalMoves = 0;

  colorPieces[currentColor].forEach(piece => {
    computeMoves[piece.name](boardPieces, piece);
    const legalMoves = filterLegalMoves(piece);
    piece.moves = legalMoves;
    numLegalMoves += legalMoves.length;
  });

  if (!numLegalMoves) {
    if (imInCheck) {
      setTimeout(() => {
        alert('Check Mate!');
      }, 100);
    } else {
      setTimeout(() => {
        alert('Stale Mate!');
      }, 100);
    }
  }
}

function passTurn(): void {
  players[state.currentColor].isInCheck = false;
  state.selectedPiece = null;
  state.currentColor = state.currentColor === 'w' ? 'b' : 'w';
  state.opositeColor = state.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

export {
  boardPieces,
  colorPieces,
  movesHistory,
  players,
  state,
  resetState,
  makeLocalMove,
  signalMoveMultiplayer,
  makeRemoteMove,
  startTurn,
  putPieceOnBoard,
};
