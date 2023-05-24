import { ALLOW_DEBUG } from '../env.js';
import { defaultInitialPieces, warn } from '../globals.js';
import { MoveData, signalMoveToServer } from '../ws/ws.js';
import { playSound } from '../audio/audio.js';
import { BoardPiecesType, CellType, ColorType, PieceNameType, gameState, resetGameState } from '../state/gameState.js';
import { debug, footer } from '../ui/footer-UI.js';

import { filterLegalMoves, isPlayerInCheckAtPosition } from './filterLegalMoves.js';
import { Piece, doCastle, doMove, MoveType, createPiece } from './piecesLib.js';
import {
  _imgContainers,
  clearLastMoveMarks,
  drawBoard,
  drawPieces,
  markLastMove,
  unselectCurrentSquare,
} from './board.js';
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

function makeRemoteMove(moveData: MoveData): void {
  const { pieceId, move } = moveData;
  const piece = gameState.colorPieces[gameState.currentColor].find(p => p.id === pieceId);
  if (piece) {
    makeLocalMove(piece, move);
  } else {
    warn('Piece not found @makeRemoteMove', moveData);
  }
}

function makeLocalMove(piece: Piece, move: MoveType): void {
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
  const { currentColor, opositeColor } = gameState;

  // TODO: stalemate by repetition

  // Am I in check?
  const playerIsInCheck = isPlayerInCheckAtPosition(gameState.boardPieces, gameState.colorPieces[opositeColor]);

  if (playerIsInCheck) {
    gameState.players[currentColor].isInCheck = true;
    gameState.soundToPlay = 'check';
  }

  // Compute all legal moves for current player.
  // (Moves that don't put the player in check)
  // If no legal moves, then it's check mate or stale mate.
  let numLegalMoves = 0;

  gameState.colorPieces[currentColor].forEach(piece => {
    computeMoves[piece.name](gameState.boardPieces, piece);
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
  makeLocalMove(piece, move);
}

export { initGame, makeLocalMove, makeRemoteMove, putPieceOnBoard, signalMoveMultiplayer, startTurn };
