import { NextRequest, NextResponse } from "next/server";
import {
  getSessionUserId,
  getThemesByUserId,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
  setDefaultTheme,
} from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAuthUserId(request: NextRequest): Promise<number | null> {
  const sessionCookie = request.cookies.get("chess_session");
  if (!sessionCookie?.value) return null;
  return getSessionUserId(sessionCookie.value);
}

/**
 * GET /api/themes
 * Lista los temas del usuario autenticado.
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const themes = await getThemesByUserId(userId);
  return NextResponse.json(themes);
}

/**
 * POST /api/themes
 * Crea un nuevo tema para el usuario autenticado.
 * Body (JSON): { name, lightColor?, darkColor?, ... }
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const theme = await createTheme({
    userId,
    name,
    lightColor: String(body.lightColor ?? "#EBECD0"),
    darkColor: String(body.darkColor ?? "#739552"),
    selectedLightColor: String(body.selectedLightColor ?? "#B7C98D"),
    selectedDarkColor: String(body.selectedDarkColor ?? "#5D7A44"),
    legalMoveDotColor: String(body.legalMoveDotColor ?? "rgba(0,0,0,0.18)"),
    legalMoveCaptureColor: String(
      body.legalMoveCaptureColor ?? "rgba(0,0,0,0.25)",
    ),
    fileRankColor: String(body.fileRankColor ?? "#4B4847"),
  });

  return NextResponse.json(theme, { status: 201 });
}

/**
 * PUT /api/themes
 * Actualiza un tema existente.
 * Query: ?id=THEME_ID
 * Body (JSON): campos a actualizar
 */
export async function PUT(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("id");

  if (!themeId) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  // Verify ownership
  const existing = await getThemeById(themeId);
  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const allowedFields = new Set([
    "name",
    "lightColor",
    "darkColor",
    "selectedLightColor",
    "selectedDarkColor",
    "legalMoveDotColor",
    "legalMoveCaptureColor",
    "fileRankColor",
    "isDefault",
  ]);

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (allowedFields.has(key)) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Sin campos validos" }, { status: 400 });
  }

  if ("isDefault" in updates) {
    await setDefaultTheme(userId, updates.isDefault ? themeId : null);
    delete updates.isDefault;
  }

  if (Object.keys(updates).length > 0) {
    await updateTheme(themeId, updates);
  }

  const updated = await getThemeById(themeId);
  return NextResponse.json(updated);
}

/**
 * DELETE /api/themes?id=THEME_ID
 * Elimina un tema.
 */
export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("id");

  if (!themeId) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const existing = await getThemeById(themeId);
  if (!existing || existing.user_id !== userId) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
  }

  await deleteTheme(themeId);
  return NextResponse.json({ success: true });
}
