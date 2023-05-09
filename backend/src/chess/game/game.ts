import { initialPieces } from "./constants";

const colors = ['w', 'b']

type PlayerState = {
  color: string,
}

type Players = { [key: number]: PlayerState }

function newGame(clientIds: number[]) {
  // INIT STATE:
  for (let i = 0; i < initialPieces.length; i++) {
    // Create pieces
    const [type, row, col, color] = initialPieces[i];
    const piece = createPiece[type](row, col, color);
    colorPieces[color].push(piece);
    // Put 'em in the board
    putPieceOnBoard(piece, boardPieces)
  }
}

export { newGame }