import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUserId,
  getGameById,
  updateGameFields,
  createMove,
} from "@/lib/db";
import { parseFen, getLegalMoves, tryMove } from "@/lib/game-logic";
import { renderEmptySVG } from "@/lib/chess-svg";

export const dynamic = "force-dynamic";

/**
 * GET /api/move?gameId=xxx&square=e2
 *
 * Maneja la interaccion de clic en el tablero:
 * - Si el visitante no esta en la partida y hay hueco, se une como negro.
 * - Si no hay ficha seleccionada, selecciona la casilla clickeada (si tiene pieza del jugador que mueve).
 * - Si hay ficha seleccionada, intenta ejecutar el movimiento.
 * - Si el usuario no esta autenticado, redirige a GitHub OAuth.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const square = searchParams.get("square");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (!gameId || !square) {
    return NextResponse.redirect(new URL("/?error=missing_params", baseUrl));
  }

  // 1. Check authentication via session cookie
  const sessionCookie = request.cookies.get("chess_session");
  let userId: number | null = null;

  if (sessionCookie?.value) {
    userId = await getSessionUserId(sessionCookie.value);
  }

  // If not logged in, redirect to GitHub OAuth
  if (!userId) {
    const returnUrl = `/api/move?gameId=${gameId}&square=${square}`;
    const authUrl = `/api/auth?redirect=${encodeURIComponent(returnUrl)}`;
    return NextResponse.redirect(new URL(authUrl, baseUrl));
  }

  // 2. Load the game
  const game = await getGameById(gameId);

  if (!game) {
    return NextResponse.redirect(new URL("/?error=game_not_found", baseUrl));
  }

  if (game.status !== "active") {
    return NextResponse.redirect(new URL(`/play?gameId=${gameId}`, baseUrl));
  }

  const { turn } = parseFen(game.fen);
  let isWhite = game.player_white === userId;
  let isBlack = game.player_black === userId;

  // 3. Auto-join as black if not already a player and there's an open spot
  if (!isWhite && !isBlack) {
    const fields: Record<string, unknown> = {};
    if (game.player_white === null) {
      fields.player_white = userId;
      isWhite = true;
    } else if (game.player_black === null) {
      fields.player_black = userId;
      isBlack = true;
    }

    if (Object.keys(fields).length > 0) {
      await updateGameFields(gameId, fields);
    }
  }

  // Re-check after potential join
  const isMyTurn = (turn === "w" && isWhite) || (turn === "b" && isBlack);

  // Special case: "join" means just auto-join without making a move
  if (square === "join") {
    return NextResponse.redirect(new URL(`/play?gameId=${gameId}`, baseUrl));
  }

  if (!isMyTurn) {
    return NextResponse.redirect(new URL(`/play?gameId=${gameId}`, baseUrl));
  }

  // 4. Handle the click
  const currentSelection = game.selected_square;

  if (!currentSelection) {
    // No selection -> try to select the clicked square
    const { board } = parseFen(game.fen);

    const fileIdx = square.charCodeAt(0) - 97;
    const rankIdx = 8 - parseInt(square[1]);
    const piece = board[rankIdx]?.[fileIdx];

    if (!piece) {
      // Clicked on an empty square
      return NextResponse.redirect(
        new URL(`/play?gameId=${gameId}&error=empty`, baseUrl),
      );
    }

    const isWhitePiece = piece === piece.toUpperCase();
    const playerOwnsPiece =
      (turn === "w" && isWhitePiece) || (turn === "b" && !isWhitePiece);

    if (!playerOwnsPiece) {
      // Clicked on opponent's piece
      return NextResponse.redirect(
        new URL(`/play?gameId=${gameId}&error=not_yours`, baseUrl),
      );
    }

    const moves = getLegalMoves(game.fen, square);
    if (moves.length === 0) {
      // Piece has no legal moves (blocked)
      return NextResponse.redirect(
        new URL(`/play?gameId=${gameId}&error=no_moves`, baseUrl),
      );
    }

    await updateGameFields(gameId, { selected_square: square });

    // Redirect after selection
    const accept = request.headers.get("accept") || "";
    if (accept.includes("image/") || accept.includes("text/html") === false) {
      return new Response(
        renderEmptySVG("Ficha seleccionada. Vuelve al perfil para continuar."),
        {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-cache, max-age=0",
          },
        },
      );
    }
    return NextResponse.redirect(new URL(`/play?gameId=${gameId}`, baseUrl));
  }

  // 5. Selection exists -> try to make the move
  const result = tryMove(game.fen, currentSelection, square);

  if (result.success && result.fen) {
    await updateGameFields(gameId, {
      fen: result.fen,
      turn: turn === "w" ? "b" : "w",
      status: result.status || "active",
      selected_square: null,
    });

    await createMove({
      game_id: gameId,
      from_square: currentSelection,
      to_square: square,
      san: result.san || "",
      fen_before: game.fen,
      fen_after: result.fen,
      player_id: userId,
    });

    return NextResponse.redirect(new URL(`/play?gameId=${gameId}`, baseUrl));
  }

  // Invalid move - if clicking on another own piece, change selection
  const { board } = parseFen(game.fen);
  const fileIdx = square.charCodeAt(0) - 97;
  const rankIdx = 8 - parseInt(square[1]);
  const clickedPiece = board[rankIdx]?.[fileIdx];

  if (clickedPiece) {
    const isWhitePiece = clickedPiece === clickedPiece.toUpperCase();
    const playerOwnsPiece =
      (turn === "w" && isWhitePiece) || (turn === "b" && !isWhitePiece);
    if (playerOwnsPiece) {
      const moves = getLegalMoves(game.fen, square);
      if (moves.length > 0) {
        await updateGameFields(gameId, { selected_square: square });
        return NextResponse.redirect(
          new URL(`/play?gameId=${gameId}`, baseUrl),
        );
      }
    }
  }

  // Invalid move - clear selection and show error
  await updateGameFields(gameId, { selected_square: null });

  return NextResponse.redirect(
    new URL(`/play?gameId=${gameId}&error=invalid_move`, baseUrl),
  );
}
