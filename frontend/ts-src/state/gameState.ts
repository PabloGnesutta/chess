import { SoundName } from '../audio/audio.js';
import { Piece } from '../engine/piecesLib.js';
import { _imgContainers } from '../engine/board.js';

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
  playerColor: ColorType | '';
  lastMove: LastMoveType | {};
  soundToPlay: SoundName;
  players: PlayersType;
  colorPieces: ColorPiecesType;
  boardPieces: BoardPiecesType;
  movesHistory: string[];
};

let gameState: State = getInitialState();

function resetGameState(): void {
  gameState = getInitialState();
}

function getInitialState(): State {
  return {
    currentColor: 'w',
    opositeColor: 'b',
    selectedPiece: null,
    playerColor: '',
    lastMove: {},
    soundToPlay: '',
    boardPieces: {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
      7: {},
    },
    movesHistory: [],
    colorPieces: {
      w: [],
      b: [],
    },
    players: {
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
    },
  };
}

export { gameState, resetGameState };
