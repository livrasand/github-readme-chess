import { Chess, Square } from 'chess.js';
import type { GameStatus } from '@/types';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function createNewGame(): { fen: string; turn: 'w' | 'b'; status: GameStatus } {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    turn: 'w',
    status: 'active',
  };
}

export function parseFen(fen: string): { board: string[][]; turn: 'w' | 'b' } {
  const chess = new Chess(fen);
  const turn = chess.turn();
  const board: string[][] = [];

  const rawBoard = chess.board();
  for (let row = 0; row < 8; row++) {
    const rank: string[] = [];
    for (let col = 0; col < 8; col++) {
      const piece = rawBoard[row][col];
      rank.push(piece ? piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase() : '');
    }
    board.push(rank);
  }

  return { board, turn };
}

export function getLegalMoves(fen: string, square: string): string[] {
  try {
    const chess = new Chess(fen);

    if (!isValidSquare(square)) return [];

    const moves = chess.moves({ square: square as Square, verbose: true });
    return moves.map((m) => m.to);
  } catch {
    return [];
  }
}

export function tryMove(
  fen: string,
  from: string,
  to: string
): { success: boolean; fen?: string; san?: string; status?: GameStatus; error?: string } {
  try {
    const chess = new Chess(fen);

    if (!isValidSquare(from) || !isValidSquare(to)) {
      return { success: false, error: 'Casilla invalida' };
    }

    const moves = chess.moves({ square: from as Square, verbose: true });
    const targetMove = moves.find((m) => m.to === to);

    if (!targetMove) {
      return { success: false, error: 'Movimiento ilegal' };
    }

    chess.move(targetMove.san);

    let status: GameStatus = 'active';
    if (chess.isCheckmate()) status = 'checkmate';
    else if (chess.isStalemate()) status = 'stalemate';
    else if (chess.isDraw()) status = 'draw';

    return {
      success: true,
      fen: chess.fen(),
      san: targetMove.san,
      status,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export function getGameResult(status: GameStatus, turn: 'w' | 'b'): string {
  switch (status) {
    case 'checkmate':
      return turn === 'w' ? 'Ganan las Negras' : 'Ganan las Blancas';
    case 'stalemate':
      return 'Ahogado - Empate';
    case 'draw':
      return 'Empate';
    default:
      return 'Partida en curso';
  }
}

function isValidSquare(s: string): boolean {
  return /^[a-h][1-8]$/.test(s);
}

export { INITIAL_FEN };
