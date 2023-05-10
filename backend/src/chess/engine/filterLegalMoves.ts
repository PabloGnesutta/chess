'use strict';

import { copyBoard, copyColorPieces, invertColor, isPlayerInCheckAtPosition } from './utils';
import { updateBoardAndPieceWithMove } from './piecesLib';
import { BoardPiecesType, ColorPiecesType, KingMoveType, MatchState, MoveType, Piece } from '../types';

// TODO: The move simulation is practically identical in _doMove()
function doesMovePutMeInCheck(state: MatchState, _piece: Piece, move: MoveType): boolean {
  const { boardPieces, colorPieces, currentColor } = state;
  const opositeColor = invertColor(currentColor);
  const { moveTo, captureAt } = move;
  const [rowTo, colTo] = moveTo;
  
  // Simulate board state
  const boardCopy = copyBoard(boardPieces);
  const piecesCopy = copyColorPieces(colorPieces);
  const pieceCopy = { ..._piece };

  // Simulate move
  updateBoardAndPieceWithMove(boardCopy, pieceCopy, moveTo, true);

  if (captureAt) {
    const [captureRow, captureCol] = captureAt;
    const captueredBoardPiece = boardCopy[captureRow][captureCol];
    // Remove captured piece from colorPieces
    const colorPieceIndex = piecesCopy[opositeColor].findIndex(p => p.id === captueredBoardPiece.id);

    {
      piecesCopy[opositeColor].splice(colorPieceIndex, 1);
    }

    // en-passant
    if (colTo !== captureCol || rowTo !== captureRow) {
      delete boardCopy[captureRow][captureCol];
    }
  }

  // Once the simulation is done, check if the resulting position puts player in check
  // const oponentPieces = piecesCopy[opositeColor];
  const putsMeInCheck = isPlayerInCheckAtPosition(boardCopy, piecesCopy[opositeColor], state);

  return putsMeInCheck;
}

/**
 * Used at start turn to compute all legal moves
 * and if there's none, it's check mate or stale mate
 * @param boardPiecs
 * @param colorPieces
 * @param state
 * @param piece
 * @returns
 */
function filterLegalMoves(
  state: MatchState,
  piece: Piece
): MoveType[] {
  const legalMoves: MoveType[] = [];

  // Anyting but King
  if (piece.name !== 'king') {
    piece.moves.forEach(move => {
      if (!doesMovePutMeInCheck(state, piece, move)) {
        legalMoves.push(move);
      }
    });

    return legalMoves;
  }

  // King
  piece.moves.forEach((move: KingMoveType) => {
    const castleSteps = move.castleSteps;
    if (castleSteps) {
      let castleIsLegal = true;

      for (let s = 0; s < castleSteps.length; s++) {
        const castleStep = castleSteps[s];
        if (doesMovePutMeInCheck(state, piece, { moveTo: castleStep })) {
          castleIsLegal = false;
          break;
        }
      }

      if (castleIsLegal) {
        legalMoves.push(move);
      }
    } else {
      if (!doesMovePutMeInCheck(state, piece, move)) {
        legalMoves.push(move);
      }
    }
  });

  return legalMoves;
}

export { filterLegalMoves };
