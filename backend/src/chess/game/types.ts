export type CellType = [number, number];

export type ColorType = 'w' | 'b';

export type MoveType = any;
export type KingMoveType = MoveType & any;

export type Piece = {
  id: number,
  name: string,
  row: number,
  col: number,
  color: ColorType,
  moves: MoveType[],
  hasntMoveYet: boolean,
  doMove: any,
}

export type King = Piece & {
  moves: KingMoveType[]
}

export type Pawn = Piece & {
  delta: number,
  startingRow: number,
  enPassantRow: number,
}

export type ColorPiecesType = {
  [key: string]: Piece[],
}

export type BoardPiecesType = { 
  // row
  [key: number]: { 
    // col
    [key: number]: Piece
  } 
}

export type PlayersType = { 
  // id
  [key: string]: {
    color: ColorType,
    isInCheck: boolean,
  } 
}

export type State = {
  currentColor: ColorType,
  opositeColor: ColorType,
}