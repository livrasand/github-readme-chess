import { NextRequest } from "next/server";
import {
  getActiveGameByUsername,
  getActiveGamesByUsername,
  getGameWithPlayers,
  getThemeById,
  themeRowToConfig,
} from "@/lib/db";
import { parseFen, getLegalMoves, INITIAL_FEN } from "@/lib/game-logic";
import {
  renderChessSVG,
  renderGameSetSVG,
  renderEmptySVG,
} from "@/lib/chess-svg";
import type { SVGConfig } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  // Determine base URL for links
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  // Load theme if specified
  const themeId = searchParams.get("theme");
  let themeConfig: SVGConfig | undefined;
  if (themeId) {
    const theme = await getThemeById(themeId);
    if (theme) {
      themeConfig = themeRowToConfig(theme);
    }
  }

  if (!gameId) {
    // Try to find the user's active games
    const user = searchParams.get("user");
    if (user) {
      const limitParam = searchParams.get("limit");
      const limit = limitParam
        ? parseInt(limitParam, 10) || undefined
        : undefined;

      let gameRows: Awaited<ReturnType<typeof getActiveGamesByUsername>> = [];
      try {
        gameRows = await getActiveGamesByUsername(user, limit);
      } catch {
        gameRows = [];
      }

      if (gameRows.length === 0) {
        const { board, turn } = parseFen(INITIAL_FEN);
        const svg = renderChessSVG({
          board,
          turn,
          gameId: "",
          selectedSquare: null,
          legalMoves: [],
          isPlayerTurn: false,
          baseUrl,
          config: themeConfig,
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

      const games = gameRows.map((g) => {
        const { board, turn } = parseFen(g.fen);
        return {
          board,
          turn,
          gameId: g.id,
          selectedSquare: g.selected_square,
          legalMoves: g.selected_square
            ? getLegalMoves(g.fen, g.selected_square)
            : [],
          status: g.status,
          whitePlayer: g.white_username || "Blancas",
          blackPlayer: g.black_username || "Negras",
        };
      });

      const svg = renderGameSetSVG(games, { baseUrl, config: themeConfig });

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
    isPlayerTurn: gameRow.status === "active",
    baseUrl,
    config: themeConfig,
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
