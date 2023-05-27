export type PieceNameType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export type ColorType = 'w' | 'b';

export type CellType = [number, number];

export type MoveType = {
  moveTo: CellType;
  captureAt?: CellType;
  castleSteps?: CellType[];
};

export type KingMoveType = MoveType & {
  rookFrom?: CellType;
  rookTo?: CellType;
};

export type Piece = {
  id: number;
  name: PieceNameType;
  row: number;
  col: number;
  color: ColorType;
  moves: MoveType[];
  hasntMoveYet: boolean;
};

export type King = Piece & {
  moves: KingMoveType[];
};

export type Pawn = Piece & {
  delta: number;
  startingRow: number;
  enPassantRow: number;
};

export type ColorPiecesType = {
  [key: string]: Piece[];
};

export type BoardPiecesType = {
  [key: number]: {
    [key: number]: Piece;
  };
};

export type LastMoveType = {
  piece: PieceNameType;
  from: CellType;
  to: CellType;
  color: string;
};

export type PlayerState = {
  clientId: number;
  isInCheck: boolean; // for castling validation
};

export type PlayersType = {
  // color
  [key: string]: PlayerState;
};

export type PositionHistoryItem = {
  position: string;
  occuredTimes: number;
};

export type MatchState = {
  id: number;
  colorPieces: ColorPiecesType;
  boardPieces: BoardPiecesType;
  players: PlayersType;
  currentColor: ColorType;
  status?: string;
  statusDetail?: string;
  lastMove: LastMoveType | {};
  positionHistory: PositionHistoryItem[];
};

export type DoMovePartialState = {
  colorPieces: ColorPiecesType;
  boardPieces: BoardPiecesType;
  currentColor: ColorType;
};
