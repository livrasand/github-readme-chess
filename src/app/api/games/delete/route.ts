import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, getGameById, deleteGame } from "@/lib/db";

export const dynamic = "force-dynamic";

async function handleDelete(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("id");

  if (!gameId) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  // Auth
  const sessionCookie = request.cookies.get("chess_session");
  let userId: number | null = null;
  if (sessionCookie?.value) {
    userId = await getSessionUserId(sessionCookie.value);
  }
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Load game
  const game = await getGameById(gameId);
  if (!game) {
    return NextResponse.json(
      { error: "Partida no encontrada" },
      { status: 404 },
    );
  }

  // Only player_white (creator) can delete
  if (game.player_white !== userId) {
    return NextResponse.json(
      { error: "Solo el creador puede eliminar la partida" },
      { status: 403 },
    );
  }

  await deleteGame(gameId);
  // Redirect back to dashboard after deletion
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

export async function GET(request: NextRequest) {
  return handleDelete(request);
}

export async function POST(request: NextRequest) {
  return handleDelete(request);
}

export async function DELETE(request: NextRequest) {
  return handleDelete(request);
}
