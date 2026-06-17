import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUserId,
  getGameById,
  updateGameFields,
  createMove,
} from "@/lib/db";
import { parseFen, getLegalMoves, tryMove } from "@/lib/game-logic";
import { renderEmptySVG } from "@/lib/chess-svg";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * GET /api/move?gameId=xxx&square=e2
 *
 * Maneja la interaccion de clic en el tablero:
 * - Si no hay ficha seleccionada, selecciona la casilla clickeada (si tiene pieza del jugador que mueve).
 * - Si hay ficha seleccionada, intenta ejecutar el movimiento.
 * - Si el usuario no esta autenticado, redirige a GitHub OAuth.
 *
 * Si la peticion viene de GitHub (Accept: image/*), devuelve SVG.
 * Si viene de un navegador normal, redirige a la pagina de juego.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const square = searchParams.get("square");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  const githubProfileUrl =
    process.env.GITHUB_PROFILE_URL || "https://github.com";

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
    // Game is over, just redirect back
    return NextResponse.redirect(githubProfileUrl);
  }

  const { turn } = parseFen(game.fen);
  const isWhite = game.player_white === userId;
  const isBlack = game.player_black === userId;

  // Check if it's this player's turn
  const isMyTurn = (turn === "w" && isWhite) || (turn === "b" && isBlack);

  if (!isMyTurn) {
    // Not your turn, redirect back
    return NextResponse.redirect(githubProfileUrl);
  }

  // 3. Handle the click
  const currentSelection = game.selected_square;

  if (!currentSelection) {
    // No hay seleccion actual -> intentar seleccionar la casilla clickeada
    const { board } = parseFen(game.fen);

    // Convert square to board coordinates
    const fileIdx = square.charCodeAt(0) - 97; // a=0, h=7
    const rankIdx = 8 - parseInt(square[1]); // 1=7, 8=0
    const piece = board[rankIdx]?.[fileIdx];

    if (piece) {
      // Check if the piece belongs to the current player
      const isWhitePiece = piece === piece.toUpperCase();
      const playerOwnsPiece =
        (turn === "w" && isWhitePiece) || (turn === "b" && !isWhitePiece);

      if (playerOwnsPiece) {
        // Check if the piece has any legal moves
        const moves = getLegalMoves(game.fen, square);
        if (moves.length > 0) {
          // Select this square
          await updateGameFields(gameId, { selected_square: square });
        }
      }
    }

    // Redirect back after selection
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
    return NextResponse.redirect(githubProfileUrl);
  }

  // 4. Hay seleccion actual -> intentar ejecutar movimiento
  const result = tryMove(game.fen, currentSelection, square);

  if (result.success && result.fen) {
    // Update game state
    await updateGameFields(gameId, {
      fen: result.fen,
      turn: turn === "w" ? "b" : "w",
      status: result.status || "active",
      selected_square: null,
    });

    // Record the move
    await createMove({
      game_id: gameId,
      from_square: currentSelection,
      to_square: square,
      san: result.san || "",
      fen_before: game.fen,
      fen_after: result.fen,
      player_id: userId!,
    });

    // Redirect back to GitHub profile
    return NextResponse.redirect(githubProfileUrl);
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
      } else {
        await updateGameFields(gameId, { selected_square: null });
      }
    }
  }

  // Clear invalid selection
  await updateGameFields(gameId, { selected_square: null });

  return NextResponse.redirect(githubProfileUrl);
}
