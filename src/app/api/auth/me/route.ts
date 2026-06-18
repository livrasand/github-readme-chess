import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, getUserById } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("chess_session");
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = await getSessionUserId(sessionCookie.value);
  if (!userId) {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
  });
}
