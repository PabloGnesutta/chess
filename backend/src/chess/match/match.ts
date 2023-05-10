import { Client } from '../../clients';
import { log } from '../../utils/utils';
import { initialPieces } from '../constants';
import { computeMoves } from '../engine/computePieceMovements';
import { filterLegalMoves } from '../engine/filterLegalMoves';
import { putPieceOnBoard } from '../engine/gameState';
import { createPiece } from '../engine/piecesLib';
import { BoardPiecesType, CellType, ColorPiecesType, ColorType, MatchState, MoveType, PlayersType } from '../types';

const colors: ColorType[] = ['w', 'b'];

function newMatch(clientIds: number[]): MatchState {
  if (clientIds.length !== 2) throw new Error('clientIds should be 2 @newMatch');

  const players: PlayersType = {};
  const colorPieces: ColorPiecesType = { w: [], b: [] };
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

  for (let i = 0; i < initialPieces.length; i++) {
    // Create pieces
    const [id, type, row, col, color] = initialPieces[i];
    const piece = createPiece[type](id, row, col, color);
    colorPieces[color].push(piece);
    // Put 'em on the board
    putPieceOnBoard(piece, boardPieces);
  }

  for (let c = 0; c < clientIds.length; c++) {
    // Create players state
    const clientId = clientIds[c];
    const playerColor = colors[c];
    players[playerColor] = {
      clientId,
      isInCheck: false,
    };
  }

  return {
    currentColor: 'w',
    boardPieces,
    colorPieces,
    movesHistory: [],
    players,
  };
}

function validateMove(state: MatchState, client: Client, [rowFrom, colFrom]: CellType, [rowTo, colTo]: CellType): any {
  const { boardPieces, currentColor, movesHistory, players } = state;

  if (client.playerColor !== currentColor) throw new Error(`Not player ${client.id}'s turn`);

  const piece = boardPieces[rowFrom][colFrom];

  if (!piece) throw new Error(`Piece not found at [${rowFrom},${colFrom}]`);

  if (piece.color !== currentColor)
    throw new Error(`Piece ${piece.id} (${piece.color}) doesn't belong to client ${client.id} (${client.playerColor})`);

  computeMoves[piece.name](boardPieces, piece, { movesHistory, isInCheck: players[currentColor].isInCheck });

  // Validate if movement is valid (is a pattern in which the piece moves)
  var moves = piece.moves;
  var movesLen = moves.length;

  var movementIsValid = false;
  for (let i = 0; i < movesLen; i++) {
    const move = moves[i];
    if (move.moveTo[0] === rowTo && move.moveTo[1] === colTo) {
      movementIsValid = true;
      break;
    }
  }

  if (!movementIsValid) {
    throw new Error(`Movement is not valid: ${piece} [${rowTo}, ${colTo}]`);
  }

  // Validate if moovement is legal (doesn't put the player in check)

  var pieceMove: MoveType | null = null;

  const legalMoves = filterLegalMoves(state, piece);
  moves = legalMoves;
  movesLen = moves.length;

  for (let i = 0; i < movesLen; i++) {
    const move = moves[i];
    if (move.moveTo[0] === rowTo && move.moveTo[1] === colTo) {
      pieceMove = move;
      break;
    }
  }

  if (!pieceMove) {
    throw new Error(`Movement is not legal: ${piece} [${rowTo}, ${colTo}]`);
  }

  return {
    pieceId: piece.id,
    move: pieceMove,
  };
}

export { newMatch, validateMove };
