import { ALLOW_DEBUG } from '../env.js';
import { NAME_MAP, defaultInitialPieces, warn } from '../globals.js';
import { IncommingMoveData } from '../ws/incomingMessages.js';
import { signalMoveToServer } from '../ws/outgoingMessages.js';
import { playSound } from '../audio/audio.js';
import { appState } from '../state/appState.js';
import {
  BoardPiecesType,
  ColorPiecesType,
  ColorType,
  PieceNameType,
  gameState,
  resetGameState,
  PositionHistoryItem,
  HistoryItem,
} from '../state/gameState.js';
import { _debug, _footer } from '../ui/footer-UI.js';
import {
  _board,
  clearLastMoveMarks,
  drawBoard,
  drawPieces,
  drawPositionHistoryItem,
  markLastMove,
  unselectCurrentSquare,
} from '../ui/board.js';

import { filterLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves.js';
import { Piece, doCastle, doMove, MoveType, createPiece } from './piecesLib.js';
import { computeMoves } from './computePieceMovements.js';
import { m_gameEnded } from '../ui/modal.js';
import { addMvHistoryItem, selectLastHistoryItem } from '../ui/mvHistory.js';

export type InitialPieces = [number, PieceNameType, number, number, ColorType][];

export type EndGameStatus = 'CHECKMATE' | 'STALEMATE_BY_REPETITION' | 'STALEMATE_BY_DRAWN_KING';

function initGame(playerColor: ColorType, initialPieces?: InitialPieces) {
  if (ALLOW_DEBUG) _debug?.classList.remove('display-none');

  _footer.classList.remove('display-none');

  _board.classList.remove('display-none');

  resetGameState();

  clearLastMoveMarks();

  // INIT STATE:
  gameState.playerColor = playerColor;

  const initialPiecesSet: InitialPieces = initialPieces || defaultInitialPieces;

  for (let i = 0; i < initialPiecesSet.length; i++) {
    const [id, type, row, col, color] = initialPiecesSet[i];

    const piece = createPiece[type](id, row, col, color);

    gameState.colorPieces[color].push(piece);

    putPieceOnBoard(piece, gameState.boardPieces);
  }

  drawBoard(playerColor);
  drawPieces(gameState.colorPieces);

  startTurn();
}

function putPieceOnBoard(piece: Piece, boardPieces: BoardPiecesType): void {
  boardPieces[piece.row][piece.col] = piece;
}

function makeRemoteMove(moveData: IncommingMoveData): void {
  const { pieceId, move } = moveData;
  const piece = gameState.colorPieces[gameState.currentColor].find(p => p.id === pieceId);
  if (piece) {
    makeLocalMoveAndPassTurn(piece, move);
  } else {
    warn('Piece not found @makeRemoteMove', moveData);
  }
}

function makeLocalMoveAndPassTurn(piece: Piece, move: MoveType): void {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem: HistoryItem = {
    piece: piece.name,
    from: [piece.row, piece.col],
    to: move.moveTo,
    color: gameState.currentColor,
  };

  gameState.lastMove = historyItem;

  unselectCurrentSquare();

  // drawMove(piece, move);

  if (move.castleSteps) {
    gameState.soundToPlay = 'castle';
    doCastle(piece, move);
  } else {
    gameState.soundToPlay = doMove(piece, move);
  }

  passTurn();
}

function passTurn(): void {
  gameState.players[gameState.currentColor].isInCheck = false;
  gameState.selectedPiece = null;
  gameState.currentColor = gameState.currentColor === 'w' ? 'b' : 'w';
  gameState.opositeColor = gameState.opositeColor === 'b' ? 'w' : 'b';
  startTurn();
}

function startTurn(): void {
  const { boardPieces, positionHistory, colorPieces, currentColor, lastMove, opositeColor, players } = gameState;

  const positionHistoryResult = updatePositionHistory(colorPieces, positionHistory);

  drawPositionHistoryItem(positionHistory[positionHistory.length - 1].position);
  appState.viewMode = 'GAME';

  const playerIsInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces[opositeColor]);

  addMvHistoryItem(lastMove, playerIsInCheck);
  selectLastHistoryItem();

  if (positionHistoryResult === 'STALEMATE_BY_REPETITION') {
    return endGame('STALEMATE_BY_REPETITION', currentColor);
  }

  if (playerIsInCheck) {
    players[currentColor].isInCheck = true;
    gameState.soundToPlay = 'check';
  }

  const numLegalMoves = computeLegalMovesForPlayer(boardPieces, colorPieces[currentColor]);

  playSound(gameState.soundToPlay);

  if (!numLegalMoves) {
    if (playerIsInCheck) endGame('CHECKMATE', currentColor);
    else endGame('STALEMATE_BY_DRAWN_KING', currentColor);
  }
}

function endGame(status: EndGameStatus, currentColor: ColorType): void {
  m_gameEnded(status, currentColor);
}

function computeLegalMovesForPlayer(boardPieces: BoardPiecesType, playerPieces: Piece[]) {
  let numLegalMoves = 0;

  playerPieces.forEach(piece => {
    computeMoves[piece.name](boardPieces, piece);
    const legalMoves = filterLegalMoves(piece);
    piece.moves = legalMoves;
    numLegalMoves += legalMoves.length;
  });

  return numLegalMoves;
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
      const str = `${color}${NAME_MAP[name]}${row}${col}`;
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

function signalMoveMultiplayer(piece: Piece, move: MoveType): void {
  signalMoveToServer([piece.row, piece.col], move.moveTo);
  makeLocalMoveAndPassTurn(piece, move);
}

export { initGame, makeLocalMoveAndPassTurn, makeRemoteMove, putPieceOnBoard, signalMoveMultiplayer, startTurn };
