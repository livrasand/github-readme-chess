import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, createGame } from "@/lib/db";
import { createNewGame } from "@/lib/game-logic";

export const dynamic = "force-dynamic";

/**
 * POST /api/games/create
 *
 * Crea una nueva partida. El usuario autenticado juega con blancas.
 * Redirige al dashboard al finalizar.
 */
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  // 1. Check authentication
  const sessionCookie = request.cookies.get("chess_session");
  let userId: number | null = null;

  if (sessionCookie?.value) {
    userId = await getSessionUserId(sessionCookie.value);
  }

  if (!userId) {
    return NextResponse.redirect(
      new URL("/api/auth?redirect=/dashboard", baseUrl),
    );
  }

  // 2. Create new game
  const newGame = createNewGame();

  const gameId = await createGame({
    fen: newGame.fen,
    status: newGame.status,
    turn: newGame.turn,
    playerWhite: userId,
  });

  if (!gameId) {
    return NextResponse.redirect(new URL("/?error=create_failed", baseUrl));
  }

  // 3. Redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}
