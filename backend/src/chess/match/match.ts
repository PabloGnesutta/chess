import { log } from '../../utils/utils';
import { Client, ClientsById } from '../../clients/clients';
import { initialPieces } from '../constants';
import { computeMoves } from '../engine/computePieceMovements';
import { computePieceLegalMoves } from '../engine/filterLegalMoves';
import { putPieceOnBoard } from '../engine/gameState';
import { createPiece } from '../engine/piecesLib';
import {
  BoardPiecesType,
  CellType,
  ColorPiecesType,
  ColorType,
  MatchState,
  MoveType,
  Piece,
  PlayersType,
} from '../types';

const colors: ColorType[] = ['w', 'b'];

type MatchesById = { [key: number]: MatchState };

const matches: MatchesById = {};

let matchIdCount = 0;

function newMatch(clients: ClientsById): MatchState {
  const clientIds = [];

  for (const clientId in clients) clientIds.push(parseInt(clientId));

  if (clientIds.length !== 2) throw new Error('clientIds should be 2 @newMatch');

  const players: PlayersType = {};
  const colorPieces: ColorPiecesType = { w: [], b: [] };
  const boardPieces: BoardPiecesType = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {} };

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

  const id = ++matchIdCount;
  const match: MatchState = {
    id,
    currentColor: 'w',
    boardPieces,
    colorPieces,
    movesHistory: [],
    players,
  };

  matches[id] = match;

  return match;
}

type OutgoingMoveData = {
  piece: Piece;
  move: MoveType;
};

function validateMove(state: MatchState, client: Client, moveFrom: CellType, to: CellType): OutgoingMoveData {
  const { boardPieces, currentColor, movesHistory, players } = state;

  if (client.playerColor !== currentColor) throw new Error(`Not player ${client.id}'s turn`);

  const [rowFrom, colFrom] = moveFrom; // unnecesary allocation

  const piece = boardPieces[rowFrom][colFrom];

  if (!piece) throw new Error(`Piece not found at [${rowFrom},${colFrom}]`);

  if (piece.color !== currentColor)
    throw new Error(`Piece ${piece.id} (${piece.color}) doesn't belong to client ${client.id} (${client.playerColor})`);

  computeMoves[piece.name](boardPieces, piece, { movesHistory, isInCheck: players[currentColor].isInCheck });

  // Validate if move is valid (is a pattern in which the piece moves)
  const [rowTo, colTo] = to;

  var moves = piece.moves;
  var movesLen = moves.length;

  var moveIsValid = false;
  for (let i = 0; i < movesLen; i++) {
    const move = moves[i];
    if (move.moveTo[0] === rowTo && move.moveTo[1] === colTo) {
      moveIsValid = true;
      break;
    }
  }

  if (!moveIsValid) throw new Error(`Move is not valid: ${piece} [${rowTo}, ${colTo}]`);

  var pieceMove: MoveType | null = null; // return value

  // Validate if move is legal (doesn't put the player in check)

  const legalMoves = computePieceLegalMoves(state, piece);

  movesLen = legalMoves.length;

  for (let i = 0; i < movesLen; i++) {
    const move = legalMoves[i];
    if (move.moveTo[0] === rowTo && move.moveTo[1] === colTo) {
      pieceMove = move;
      break;
    }
  }

  if (!pieceMove) {
    throw new Error(`Move is not legal: ${piece} [${rowTo}, ${colTo}]`);
  }

  return {
    piece,
    move: pieceMove,
  };
}

export { matches, newMatch, validateMove };
