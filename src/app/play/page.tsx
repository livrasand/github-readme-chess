import {
  getGameWithPlayers,
  buildPlayerObjects,
  getActiveGamesByUsername,
  getSessionUserId,
} from "@/lib/db";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { parseFen, getLegalMoves } from "@/lib/game-logic";
import { renderChessSVG } from "@/lib/chess-svg";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  empty:
    "Esa casilla esta vacia. Haz clic en UNA DE TUS FICHAS (las de tu color).",
  not_yours:
    "Esa ficha no es tuya. Haz clic en una de tus fichas (las de tu color).",
  no_moves: "Esa ficha no puede moverse en este momento. Elige otra ficha.",
  invalid_move:
    "Ese movimiento no es valido. Haz clic en un destino con punto verde.",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function getMyPieceSquares(board: string[][], turn: "w" | "b"): string[] {
  const squares: string[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const isWhitePiece = piece === piece.toUpperCase();
        const belongsToTurn =
          (turn === "w" && isWhitePiece) || (turn === "b" && !isWhitePiece);
        if (belongsToTurn) {
          squares.push(FILES[col] + (8 - row));
        }
      }
    }
  }
  return squares;
}

function UserPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-deep-charcoal">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-off-white tracking-tight"
        >
          Readme<span className="text-chess-green">Chess</span>
        </Link>
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors leading-[15.99px]"
        >
          Ir al Dashboard
        </a>
      </nav>
      <main className="max-w-5xl mx-auto px-6 pb-16">{children}</main>
    </div>
  );
}

export default async function PlayPage(props: {
  searchParams: Promise<{
    gameId?: string;
    move?: string;
    from?: string;
    to?: string;
    error?: string;
    user?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { gameId, move, from, to, error, user: userParam } = searchParams;

  if (gameId && to && from) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-chess-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-white leading-4">
            Procesando movimiento...
          </p>
          <p className="mt-2 text-xs text-text-tertiary leading-4">
            {from} &rarr; {to}
          </p>
        </div>
      </div>
    );
  }

  if (gameId && move) {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-chess-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-white leading-4">
            Seleccionando casilla {move}...
          </p>
        </div>
      </div>
    );
  }

  // Check authentication
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("chess_session")?.value;
  const loggedInUserId = sessionId ? await getSessionUserId(sessionId) : null;
  const isLoggedIn = loggedInUserId !== null;

  // If no gameId but user is specified, show that user's active games
  if (!gameId && userParam) {
    const games = await getActiveGamesByUsername(userParam);
    if (games.length === 0) {
      return (
        <UserPageShell>
          <div className="bg-near-black rounded-lg p-8 shadow-card text-center">
            <p className="text-sm text-text-secondary leading-5">
              <span className="font-semibold text-white">{userParam}</span> no
              tiene partidas activas.
            </p>
            <p className="mt-1 text-sm text-text-tertiary leading-5">
              Vuelve mas tarde o crea una partida desde su dashboard.
            </p>
          </div>
        </UserPageShell>
      );
    }

    return (
      <UserPageShell>
        <div className="pt-8">
          {/* Login banner */}
          {!isLoggedIn && (
            <div className="bg-near-black rounded-lg p-4 shadow-card mb-6 text-center">
              <p className="text-sm text-text-secondary leading-5">
                Necesitas iniciar sesion para jugar.
              </p>
              <a
                href={`/api/auth?redirect=/play?user=${userParam}`}
                className="mt-2 inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors leading-[15.99px]"
              >
                Iniciar sesion con GitHub
              </a>
            </div>
          )}
          <h2 className="text-sm font-extrabold text-white leading-4 mb-4">
            Partidas activas de{" "}
            <span className="text-chess-green">{userParam}</span>
            <span className="ml-2 text-text-tertiary font-normal">
              ({games.length})
            </span>
          </h2>
          <div className="space-y-3">
            {games.map((g) => {
              const opponent = g.white_username
                ? g.black_username
                  ? `${g.white_username} vs ${g.black_username}`
                  : `${g.white_username} vs Esperando...`
                : `${g.black_username || "?"} vs ?`;
              const canJoin =
                g.player_white === null || g.player_black === null;
              return (
                <div
                  key={g.id}
                  className="bg-near-black rounded-lg p-5 shadow-card flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white leading-4">
                      {opponent}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary leading-4">
                      Creada el{" "}
                      {new Date(g.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canJoin && isLoggedIn && (
                      <a
                        href={`/api/move?gameId=${g.id}&square=join`}
                        className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors leading-[15.99px]"
                      >
                        Unirse como{" "}
                        {g.player_white === null ? "Blancas" : "Negras"}
                      </a>
                    )}
                    {canJoin && !isLoggedIn && (
                      <a
                        href={`/api/auth?redirect=/api/move?gameId=${g.id}&square=join`}
                        className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors leading-[15.99px]"
                      >
                        Unirse (requiere login)
                      </a>
                    )}
                    <a
                      href={`/play?gameId=${g.id}`}
                      className="inline-flex items-center px-4 py-2 bg-transparent text-text-secondary text-sm font-semibold rounded-md border border-white/20 hover:bg-white/10 hover:text-white transition-all leading-[15.99px]"
                    >
                      Ver tablero
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </UserPageShell>
    );
  }

  if (!gameId) {
    redirect("/?error=no_game");
  }

  const gameRow = await getGameWithPlayers(gameId);
  if (!gameRow) {
    redirect("/?error=game_not_found");
  }

  const players = buildPlayerObjects(gameRow);
  const game = {
    ...gameRow,
    white_player: players?.white_player ?? null,
    black_player: players?.black_player ?? null,
  };

  // Generate SVG inline so clickable links work
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const { board, turn } = parseFen(game.fen);
  const whiteName = game.white_player?.username || "Blancas";
  const blackName = game.black_player?.username || "Negras";
  const legalMoves = game.selected_square
    ? getLegalMoves(game.fen, game.selected_square)
    : [];

  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  const myPieceSquares =
    game.status === "active" ? getMyPieceSquares(board, turn) : [];

  const svgContent = renderChessSVG({
    board,
    turn,
    gameId: game.id,
    selectedSquare: game.selected_square,
    legalMoves,
    isPlayerTurn: game.status === "active",
    baseUrl,
    whitePlayer: whiteName,
    blackPlayer: blackName,
    statusText:
      game.status !== "active"
        ? game.status
        : `Turno: ${turn === "w" ? "Blancas" : "Negras"}`,
  });

  return (
    <div className="min-h-screen bg-deep-charcoal">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-off-white tracking-tight"
        >
          Readme<span className="text-chess-green">Chess</span>
        </Link>
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover transition-colors leading-[15.99px]"
        >
          Ir al Dashboard
        </a>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <div className="bg-near-black rounded-lg p-6 shadow-card mb-6 inline-block text-left w-full max-w-md mx-auto">
          <p className="text-sm font-semibold text-white leading-4">
            <span className="text-chess-green">{whiteName}</span> vs{" "}
            <span className="text-chess-green">{blackName}</span>
          </p>
          <p className="mt-1 text-xs text-text-tertiary leading-4 capitalize">
            Estado:{" "}
            {game.status === "active"
              ? "En curso"
              : game.status === "checkmate"
                ? "Jaque mate"
                : game.status}
          </p>

          {/* Error message */}
          {errorMessage && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-red-400 font-semibold leading-4">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Instructions when game is active */}
          {game.status === "active" && !game.selected_square && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <p className="text-xs font-semibold text-chess-green leading-4">
                Como mover:
              </p>
              <ol className="text-xs text-text-tertiary leading-5 list-decimal list-inside space-y-1">
                <li>
                  Haz clic en UNA DE TUS FICHAS (
                  <span className="text-white/80 font-mono">
                    {turn === "w" ? "blancas" : "negras"}
                  </span>
                  ) para seleccionarla
                </li>
                <li>
                  Apareceran{" "}
                  <span className="text-white/80">puntos verdes</span> en los
                  destinos posibles
                </li>
                <li>
                  Haz clic en un destino con punto verde para mover la ficha
                </li>
              </ol>
              {myPieceSquares.length > 0 && (
                <p className="text-xs text-text-tertiary leading-4 pt-1">
                  Casillas con tus fichas:{" "}
                  <span className="text-white/80 font-mono">
                    {myPieceSquares.join(", ")}
                  </span>
                </p>
              )}
            </div>
          )}
          {game.status === "active" && game.selected_square && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-text-tertiary leading-4">
                Como mover:{" "}
                <span className="text-chess-green font-semibold">
                  Ficha {game.selected_square} seleccionada. Haz clic en un
                  destino valido (con punto o borde) para mover.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Interactive SVG board - inline so clicks work */}
        <div
          className="bg-near-black rounded-lg p-4 shadow-card inline-block"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </main>
    </div>
  );
}
