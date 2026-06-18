import type { GameRow } from "@/lib/db";
import {
  getSessionUserId,
  getUserById,
  getGamesByUserId,
  buildPlayerObjects,
} from "@/lib/db";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import MarkdownSnippet from "./MarkdownSnippet";

export const dynamic = "force-dynamic";

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("chess_session")?.value;
  if (!sessionId) return null;

  const userId = await getSessionUserId(sessionId);
  if (!userId) return null;

  const user = await getUserById(userId);
  return user;
}

async function getUserGames(userId: number) {
  const rows = await getGamesByUserId(userId);
  return rows.map((row) => {
    const players = buildPlayerObjects(row);
    return {
      ...row,
      white_player: players?.white_player ?? null,
      black_player: players?.black_player ?? null,
    };
  });
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/api/auth?redirect=/dashboard");

  const games = await getUserGames(user.id);

  type GameWithPlayers = GameRow & {
    white_player: { username: string; avatar_url: string | null } | null;
    black_player: { username: string; avatar_url: string | null } | null;
  };

  const activeGames = games.filter(
    (g: GameWithPlayers) => g.status === "active",
  );
  const finishedGames = games.filter(
    (g: GameWithPlayers) => g.status !== "active",
  );

  return (
    <div className="min-h-screen bg-deep-charcoal">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-off-white tracking-tight"
        >
          Readme<span className="text-chess-green">Chess</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary font-semibold">
            {user.username}
          </span>
          <form action="/api/auth/logout" method="GET">
            <button
              type="submit"
              className="inline-flex items-center px-3 py-1.5 bg-transparent text-text-secondary text-sm font-semibold rounded-md border border-white/20 hover:bg-white/10 hover:text-white transition-all leading-[15.99px]"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-16">
        {/* Welcome */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-[36px] font-extrabold leading-10 text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-text-secondary leading-5">
              Bienvenido,{" "}
              <span className="text-chess-green font-semibold">
                {user.username}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <form action="/api/games/create" method="POST">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover active:bg-chess-green-active transition-colors leading-[15.99px]"
              >
                Nueva partida
              </button>
            </form>
            <Link
              href="/dashboard/temas"
              className="inline-flex items-center px-4 py-2 bg-transparent text-text-secondary text-sm font-semibold rounded-md border border-white/20 hover:bg-white/10 hover:text-white transition-all leading-[15.99px]"
            >
              Personalizar tablero
            </Link>
          </div>
        </div>

        <MarkdownSnippet username={user.username} />

        {/* Active Games */}
        <div className="mb-10">
          <h2 className="text-sm font-extrabold text-white leading-4 mb-4">
            Partidas activas
            <span className="ml-2 text-text-tertiary font-normal">
              ({activeGames.length})
            </span>
          </h2>

          {activeGames.length === 0 ? (
            <div className="bg-near-black rounded-lg p-8 shadow-card text-center">
              <p className="text-sm text-text-secondary leading-5">
                No tienes partidas activas.
              </p>
              <p className="mt-1 text-sm text-text-tertiary leading-5 mb-4">
                Comparte tu codigo Markdown para que otros jueguen contigo.
              </p>
              <form action="/api/games/create" method="POST" className="inline">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover active:bg-chess-green-active transition-colors leading-[15.99px]"
                >
                  Crear primera partida
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGames.map((game: GameWithPlayers) => {
                const isWhite = game.player_white === user.id;
                const opponent = isWhite
                  ? game.black_player
                  : game.white_player;
                return (
                  <div
                    key={game.id}
                    className="bg-near-black rounded-lg p-5 shadow-card flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white leading-4">
                        {isWhite ? (
                          <>
                            <span className="text-chess-green">Blancas</span> vs{" "}
                            {opponent?.username || "Esperando..."}
                          </>
                        ) : (
                          <>
                            {opponent?.username || "Esperando..."} vs{" "}
                            <span className="text-chess-green">Negras</span>
                          </>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary leading-4">
                        Creada el{" "}
                        {new Date(game.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/api/chessboard?gameId=${game.id}`}
                        className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover active:bg-chess-green-active transition-colors leading-[15.99px]"
                      >
                        Ver tablero
                      </Link>
                      <form
                        action={`/api/games/delete?id=${game.id}`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 bg-red-600/20 text-red-400 text-sm font-semibold rounded-md hover:bg-red-600/30 transition-colors leading-[15.99px]"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Finished Games */}
        {finishedGames.length > 0 && (
          <div>
            <h2 className="text-sm font-extrabold text-white leading-4 mb-4">
              Partidas terminadas
              <span className="ml-2 text-text-tertiary font-normal">
                ({finishedGames.length})
              </span>
            </h2>
            <div className="space-y-3">
              {finishedGames.map((game: GameWithPlayers) => (
                <div
                  key={game.id}
                  className="bg-near-black rounded-lg p-5 shadow-card flex items-center justify-between opacity-80"
                >
                  <div>
                    <p className="text-sm font-semibold text-white leading-4 capitalize">
                      {game.status === "checkmate"
                        ? "Jaque mate"
                        : game.status === "stalemate"
                          ? "Ahogado"
                          : game.status}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary leading-4">
                      {game.white_player?.username || "Blancas"} vs{" "}
                      {game.black_player?.username || "Negras"}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary leading-4">
                      {new Date(game.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <form
                    action={`/api/games/delete?id=${game.id}`}
                    method="POST"
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-2 bg-red-600/20 text-red-400 text-sm font-semibold rounded-md hover:bg-red-600/30 transition-colors leading-[15.99px]"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
