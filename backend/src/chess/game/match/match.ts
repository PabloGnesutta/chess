import { log } from "../../../utils/utils.js";
import { initialPieces } from "../constants.js";
import { putPieceOnBoard } from "../engine/gameState.js";
import { createPiece } from "../engine/piecesLib.js";
import { BoardPiecesType, ColorPiecesType, ColorType, MatchState, PlayersType } from "../types.js";

const colors: ColorType[] = ['w', 'b']; 

function newGame(clientIds: number[]): MatchState {
  if (clientIds.length !== 2) throw new Error('clientIds should be 2 @newGame');

  const players: PlayersType = {}
  const colorPieces: ColorPiecesType = { w: [], b: [] };
  const boardPieces: BoardPiecesType = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {} };

  for (let i = 0; i < initialPieces.length; i++) {
    // Create pieces
    const [type, row, col, color] = initialPieces[i];
    const piece = createPiece[type](row, col, color);
    colorPieces[color].push(piece);
    // Put 'em in the board
    putPieceOnBoard(piece, boardPieces)
  }

  for (let c = 0; c < clientIds.length; c++) {
    // Create players state
    const clientId = clientIds[c]
    players[clientId] = {
      color: colors[c],
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

export { newGame }