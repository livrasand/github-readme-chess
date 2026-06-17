import { getGameWithPlayers, buildPlayerObjects } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function PlayPage(props: {
  searchParams: Promise<{
    gameId?: string;
    move?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { gameId, move, from, to } = searchParams;

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

  return (
    <div className="min-h-screen bg-deep-charcoal">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-off-white tracking-tight"
        >
          Readme<span className="text-chess-green">Chess</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <div className="bg-near-black rounded-lg p-6 shadow-card mb-6 inline-block text-left w-full max-w-md mx-auto">
          <p className="text-sm font-semibold text-white leading-4">
            <span className="text-chess-green">
              {game.white_player?.username || "Blancas"}
            </span>{" "}
            vs{" "}
            <span className="text-chess-green">
              {game.black_player?.username || "Negras"}
            </span>
          </p>
          <p className="mt-1 text-xs text-text-tertiary leading-4 capitalize">
            Estado:{" "}
            {game.status === "active"
              ? "En curso"
              : game.status === "checkmate"
                ? "Jaque mate"
                : game.status}
          </p>
        </div>

        <div className="bg-near-black rounded-lg p-4 shadow-card inline-block">
          <Image
            src={`/api/chessboard?gameId=${game.id}`}
            alt="Tablero de ajedrez"
            className="rounded-md"
            width={512}
            height={512}
          />
        </div>

        <div className="mt-6">
          <a
            href={`/api/move?gameId=${game.id}`}
            className="inline-flex items-center px-6 py-3 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover active:bg-chess-green-active transition-colors leading-[15.99px]"
          >
            Hacer un movimiento
          </a>
        </div>
      </main>
    </div>
  );
}
