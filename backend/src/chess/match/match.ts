import { initialPieces } from "../constants";
import { putPieceOnBoard } from "../engine/gameState";
import { createPiece } from "../engine/piecesLib";
import { BoardPiecesType, ColorPiecesType, ColorType, MatchState, PlayersType } from "../types";

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
    // Put 'em in the board
    putPieceOnBoard(piece, boardPieces)
  }

  for (let c = 0; c < clientIds.length; c++) {
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

export { newMatch }