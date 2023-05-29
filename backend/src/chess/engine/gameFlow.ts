import { log } from '../../utils/utils';
import {
  BoardPiecesType,
  ColorPiecesType,
  LastMoveType,
  MatchState,
  MoveType,
  Piece,
  PositionHistoryItem,
} from '../types';
import { computePieceLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves';
import { invertColor } from './utils';
import { doCastle, doMove } from './piecesLib';
import { computeMoves } from './computePieceMovements';
import { NAME_MAP } from '../constants';

type MoveResultStatus = 'CHECK' | 'CHECKMATE' | 'STALEMATE_BY_DRAWN_KING' | 'STALEMATE_BY_REPETITION' | '';

export type MoveResult = {
  status: MoveResultStatus;
  target: string;
};

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function makeLocalMoveAndPassTurn(state: MatchState, piece: Piece, move: MoveType): MoveResult {
  const historyItem: LastMoveType = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
    color: state.currentColor,
  };

  state.lastMove = historyItem;

  if (move.castleSteps) {
    doCastle(state.boardPieces, piece, move, false);
  } else {
    doMove(state, piece, move, false);
  }

  return passTurn(state);
}

function passTurn(state: MatchState): MoveResult {
  state.players[state.currentColor].isInCheck = false;
  state.currentColor = invertColor(state.currentColor);
  return startTurn(state);
}

/**
 * At this point, the turn has been passed, therefore
 * Current color is updated for the new turn
 */
function startTurn(state: MatchState): MoveResult {
  const { boardPieces, colorPieces, currentColor, players, positionHistory } = state;

  let startTurnResult: MoveResult = {
    status: '',
    target: '',
  };

  const positionHistoryResult = updatePositionHistory(colorPieces, positionHistory);

  if (positionHistoryResult === 'STALEMATE_BY_REPETITION') {
    startTurnResult.status = positionHistoryResult;
    startTurnResult.target = 'BOTH';
    return startTurnResult;
  }

  const isInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces, state);

  if (isInCheck) {
    players[currentColor].isInCheck = true;
    startTurnResult = { status: 'CHECK', target: currentColor };
  }

  const hasNoLegalMoves = playerHasNoLegalMoves(state);

  if (hasNoLegalMoves) {
    if (isInCheck) {
      startTurnResult.status = 'CHECKMATE';
      startTurnResult.target = currentColor;
    } else {
      startTurnResult.status = 'STALEMATE_BY_DRAWN_KING';
      startTurnResult.target = 'BOTH';
    }
  }

  return startTurnResult;
}

function playerHasNoLegalMoves(state: MatchState): boolean {
  const { boardPieces, colorPieces, currentColor, lastMove, players } = state;

  const playerPieces = colorPieces[currentColor];
  const isInCheck = players[currentColor].isInCheck;

  let hasNoLegalMoves = true;

  for (let p = 0; p < playerPieces.length; p++) {
    const piece = playerPieces[p];

    computeMoves[piece.name](boardPieces, piece, {
      lastMove: lastMove as LastMoveType,
      isInCheck: isInCheck,
    });

    if (piece.moves.length) {
      const legalMoves = computePieceLegalMoves(state, piece);

      if (legalMoves.length) {
        hasNoLegalMoves = false;
        break;
      }
    }
  }

  return hasNoLegalMoves;
}

type UpdatePositionHistoryResult = 'STALEMATE_BY_REPETITION' | '';

function updatePositionHistory(
  colorPieces: ColorPiecesType,
  positionHistory: PositionHistoryItem[]
): UpdatePositionHistoryResult {
  let updatePositionResult: UpdatePositionHistoryResult = '';

  // Build history item
  const currentPositionArray = [];
  for (const color in colorPieces) {
    const pieces = colorPieces[color];
    for (let i = 0; i < pieces.length; i++) {
      const { name, row, col } = pieces[i];
      const str = `${color}_${NAME_MAP[name]}${row}${col}`;
      // TODO: If piece is pawn, check en-passants
      // if piece is king, check castles
      currentPositionArray.push(str);
      currentPositionArray.sort();
    }
  }

  const currentPositionStr = currentPositionArray.join(';');

  // Find if the position previously occurred
  let positionIsNew = true;
  for (let i = 0; i < positionHistory.length; i++) {
    const historyItem = positionHistory[i];
    const position = historyItem.position;
    if (position === currentPositionStr) {
      positionIsNew = false;
      historyItem.occuredTimes++;
      if (historyItem.occuredTimes === 3) {
        updatePositionResult = 'STALEMATE_BY_REPETITION';
      }
      break;
    }
  }

  if (updatePositionResult !== 'STALEMATE_BY_REPETITION' && positionIsNew) {
    positionHistory.push({
      occuredTimes: 1,
      position: currentPositionStr,
    });
  }

  return updatePositionResult;
}

export { makeLocalMoveAndPassTurn, putPieceOnBoard, startTurn };
