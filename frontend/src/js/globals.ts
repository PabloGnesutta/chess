"use strict";

const ROW_MAP = [8, 7, 6, 5, 4, 3, 2, 1];
const COL_MAP = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const P = 'pawn';
const K = 'king';
const Q = 'queen';
const R = 'rook';
const N = 'knight';
const B = 'bishop';

const _Z = 7; // Largest row/col index

const log = console.log;
const warn = console.warn;
