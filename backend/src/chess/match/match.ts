import { Client } from "../../clients";
import { log } from "../../utils/utils";
import { initialPieces } from "../constants";
import { computeMoves } from "../engine/computePieceMovements";
import { putPieceOnBoard } from "../engine/gameState";
import { createPiece } from "../engine/piecesLib";
import { BoardPiecesType, CellType, ColorPiecesType, ColorType, MatchState, PlayersType } from "../types";

const colors: ColorType[] = ['w', 'b']; 

function newMatch(clientIds: number[]): MatchState {
  if (clientIds.length !== 2) throw new Error('clientIds should be 2 @newMatch');

  const players: PlayersType = {}
  const colorPieces: ColorPiecesType = { w: [], b: [] };
  const boardPieces: BoardPiecesType = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {} };

  for (let i = 0; i < initialPieces.length; i++) {
    // Create pieces
    const [id, type, row, col, color] = initialPieces[i];
    const piece = createPiece[type](id, row, col, color);
    colorPieces[color].push(piece);
    // Put 'em on the board
    putPieceOnBoard(piece, boardPieces)
  }

  for (let c = 0; c <= clientIds.length; c++) {
    // Create players state
    const clientId = clientIds[c]
    players[clientId] = {
      playerColor: colors[c],
      isInCheck: false,
    }
  }

  return {
    currentColor: 'w',
    boardPieces, 
    colorPieces, 
    movesHistory: [],
    players,
  }
}

function validateMove(
  match: MatchState,
  client: Client, 
  [rowFrom, colFrom]: CellType,
  [rowTo, colTo]: CellType
): any {
  const { boardPieces, colorPieces, players, currentColor} = match;

  if (client.playerColor !== currentColor) throw new Error(`Not player ${client.id}'s turn`);

  const piece = boardPieces[rowFrom][colFrom];

  if (!piece) throw new Error(`Piece not found at [${rowFrom},${colFrom}]`);
  if (piece.color !== currentColor) 
    throw new Error(`Piece ${piece.id} (${piece.color}) doesn't belong to client ${client.id} (${client.playerColor})`);

  computeMoves[piece.name](boardPieces, piece);
  log(piece);

  // see if signaled move exists in piece.moves

  // validate move is legal

  return {
    from: [rowFrom, colFrom],
    to: [rowTo, colTo]
  }
}

export { newMatch, validateMove }