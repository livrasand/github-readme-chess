import { NextRequest } from "next/server";
import { getActiveGameByUsername, getGameWithPlayers } from "@/lib/db";
import { parseFen, getLegalMoves, INITIAL_FEN } from "@/lib/game-logic";
import { renderChessSVG, renderEmptySVG } from "@/lib/chess-svg";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  // Determine base URL for links
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (!gameId) {
    // Try to find the user's latest active game
    const user = searchParams.get("user");
    if (user) {
      let gameRow;
      try {
        gameRow = await getActiveGameByUsername(user);
      } catch {
        gameRow = null;
      }

      if (!gameRow) {
        const { board, turn } = parseFen(INITIAL_FEN);
        const svg = renderChessSVG({
          board,
          turn,
          gameId: "",
          selectedSquare: null,
          legalMoves: [],
          isPlayerTurn: false,
          baseUrl,
          whitePlayer: user,
          blackPlayer: "Esperando oponente",
          statusText: "Crea una partida para empezar",
        });

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-cache, max-age=0",
          },
        });
      }

      const { board, turn } = parseFen(gameRow.fen);

      const whiteName = gameRow.white_username || "Blancas";
      const blackName = gameRow.black_username || "Negras";

      const svg = renderChessSVG({
        board,
        turn,
        gameId: gameRow.id,
        selectedSquare: gameRow.selected_square,
        legalMoves: gameRow.selected_square
          ? getLegalMoves(gameRow.fen, gameRow.selected_square)
          : [],
        isPlayerTurn: false,
        baseUrl,
        whitePlayer: whiteName,
        blackPlayer: blackName,
        statusText:
          gameRow.status !== "active"
            ? gameRow.status
            : `Turno: ${turn === "w" ? "Blancas" : "Negras"}`,
      });

      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache, max-age=0",
        },
      });
    }

    return new Response(
      renderEmptySVG("Usa ?gameId=ID o ?user=USUARIO para ver tu tablero."),
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache, max-age=0",
        },
      },
    );
  }

  // Load specific game
  const gameRow = await getGameWithPlayers(gameId);

  if (!gameRow) {
    return new Response(renderEmptySVG("Partida no encontrada."), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, max-age=0",
      },
    });
  }

  const { board, turn } = parseFen(gameRow.fen);
  const whiteName = gameRow.white_username || "Blancas";
  const blackName = gameRow.black_username || "Negras";

  const svg = renderChessSVG({
    board,
    turn,
    gameId: gameRow.id,
    selectedSquare: gameRow.selected_square,
    legalMoves: gameRow.selected_square
      ? getLegalMoves(gameRow.fen, gameRow.selected_square)
      : [],
    isPlayerTurn: false,
    baseUrl,
    whitePlayer: whiteName,
    blackPlayer: blackName,
    statusText:
      gameRow.status !== "active"
        ? gameRow.status
        : `Turno: ${turn === "w" ? "Blancas" : "Negras"}`,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, max-age=0",
    },
  });
}
