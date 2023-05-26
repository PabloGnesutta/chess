import { ALLOW_DEBUG } from '../env.js';
import { NAME_MAP, defaultInitialPieces, log, warn } from '../globals.js';
import { IncommingMoveData } from '../ws/incomingMessages.js';
import { signalMoveToServer } from '../ws/outgoingMessages.js';
import { playSound } from '../audio/audio.js';
import { BoardPiecesType, CellType, ColorType, PieceNameType, gameState, resetGameState } from '../state/gameState.js';
import { debug, footer } from '../ui/footer-UI.js';
import {
  _imgContainers,
  clearLastMoveMarks,
  drawBoard,
  drawPieces,
  markLastMove,
  unselectCurrentSquare,
} from '../ui/board.js';

import { filterLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves.js';
import { Piece, doCastle, doMove, MoveType, createPiece } from './piecesLib.js';
import { computeMoves } from './computePieceMovements.js';

export type InitialPieces = [number, PieceNameType, number, number, ColorType][];

function initGame(playerColor: ColorType, initialPieces?: InitialPieces) {
  if (ALLOW_DEBUG) debug?.classList.remove('display-none');

  footer?.classList.remove('display-none');

  document.getElementById('board')?.classList.remove('display-none');

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
  const piece = gameState.colorPieces[gameState.currentColor].find((p) => p.id === pieceId);
  if (piece) {
    makeLocalMoveAndPassTurn(piece, move);
  } else {
    warn('Piece not found @makeRemoteMove', moveData);
  }
}

function makeLocalMoveAndPassTurn(piece: Piece, move: MoveType): void {
  markLastMove([piece.row, piece.col], move.moveTo);

  const historyItem = {
    piece: piece.name,
    from: [piece.row, piece.col] as CellType,
    to: move.moveTo,
    color: gameState.currentColor,
  };

  gameState.movesHistory.push(JSON.stringify(historyItem));

  gameState.lastMove = historyItem;

  unselectCurrentSquare();

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
  const { boardPieces, boardStateHistory, colorPieces, currentColor, opositeColor, players } = gameState;

  // Board state history

  // Build state entry
  const boardPositionsArray = [];
  for (const color in colorPieces) {
    const pieces = colorPieces[color];
    for (let i = 0; i < pieces.length; i++) {
      const { name, row, col } = pieces[i];
      const str = `${color}_${NAME_MAP[name]}_${row}_${col}`;
      boardPositionsArray.push(str);
      boardPositionsArray.sort();
    }
  }

  const boardPositions = boardPositionsArray.join(';');

  let isStalemateByRepetition = false;
  // Find if the position previously occurred
  let positionsAreNew = true;
  for (let i = 0; i < boardStateHistory.length; i++) {
    const historyItem = boardStateHistory[i];
    const positions = historyItem.positions;
    if (positions === boardPositions) {
      log(' Position has previously occurred', historyItem.occuredTimes, 'times');
      positionsAreNew = false;
      historyItem.occuredTimes++;
      if (historyItem.occuredTimes === 3) {
        isStalemateByRepetition = true;
      }
      break;
    }
  }

  if (isStalemateByRepetition) {
    log('STALEMATE BY REPETITION');
    return;
  } else if (positionsAreNew) {
    boardStateHistory.push({
      occuredTimes: 1,
      positions: boardPositions,
    });
  }

  log(' *** boardStateHistory', boardStateHistory);

  // TODO: stalemate by repetition

  // Am I in check?
  const playerIsInCheck = isPlayerInCheckAtPosition(boardPieces, colorPieces[opositeColor]);

  if (playerIsInCheck) {
    players[currentColor].isInCheck = true;
    gameState.soundToPlay = 'check';
  }

  // Compute all legal moves for current player.
  // (Moves that don't put the player in check)
  // If no legal moves, then it's check mate or stale mate.
  let numLegalMoves = 0;

  colorPieces[currentColor].forEach((piece) => {
    computeMoves[piece.name](boardPieces, piece);
    const legalMoves = filterLegalMoves(piece);
    piece.moves = legalMoves;
    numLegalMoves += legalMoves.length;
  });

  playSound(gameState.soundToPlay);

  if (!numLegalMoves) {
    if (playerIsInCheck) {
      setTimeout(() => {
        alert('Check Mate!');
      }, 100);
    } else {
      setTimeout(() => {
        alert('Stale Mate!');
      }, 100);
    }
  }
}

function signalMoveMultiplayer(piece: Piece, move: MoveType): void {
  signalMoveToServer([piece.row, piece.col], move.moveTo);
  makeLocalMoveAndPassTurn(piece, move);
}

export { initGame, makeLocalMoveAndPassTurn, makeRemoteMove, putPieceOnBoard, signalMoveMultiplayer, startTurn };
