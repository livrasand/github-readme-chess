import { neon, neonConfig } from "@neondatabase/serverless";

// Node.js runtime only: undici (fetch) tries IPv6 first and times out when IPv6 is unreachable.
// Use https.request with family:4 to force IPv4.
if (typeof require !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require("https") as typeof import("https");
  neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url);
    return new Promise((resolve, reject) => {
      const reqHeaders = Object.fromEntries(new Headers(init?.headers).entries());
      const req = https.request(
        { hostname: url.hostname, port: 443, path: url.pathname + url.search, method: init?.method ?? "GET", headers: reqHeaders, family: 4 },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c: Buffer) => chunks.push(c));
          res.on("end", () => resolve(new Response(Buffer.concat(chunks), { status: res.statusCode, headers: res.headers as HeadersInit })));
        }
      );
      req.on("error", reject);
      if (init?.body) req.write(init.body);
      req.end();
    });
  };
}

const rawUrl = process.env.DATABASE_URL!;
const _parsedUrl = new URL(rawUrl);
_parsedUrl.searchParams.delete('channel_binding');
const connectionString = _parsedUrl.toString();
const sql = neon(connectionString);

// ============================================================
// Types
// ============================================================

export interface UserRow {
  id: number;
  github_id: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface GameRow {
  id: string;
  fen: string;
  status: string;
  turn: string;
  player_white: number | null;
  player_black: number | null;
  selected_square: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameWithPlayers extends GameRow {
  white_username?: string | null;
  white_avatar_url?: string | null;
  black_username?: string | null;
  black_avatar_url?: string | null;
}

// ============================================================
// Users
// ============================================================

export async function upsertUser(
  githubId: number,
  username: string,
  avatarUrl: string | null,
): Promise<UserRow | null> {
  const rows = await sql`
    INSERT INTO users (github_id, username, avatar_url)
    VALUES (${githubId}, ${username}, ${avatarUrl})
    ON CONFLICT (github_id) DO UPDATE
    SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url
    RETURNING id, github_id, username, avatar_url, created_at
  `;
  return (rows as UserRow[])?.[0] ?? null;
}

// ============================================================
// Sessions
// ============================================================

export async function createSession(
  id: string,
  userId: number,
  expiresAt: string,
): Promise<void> {
  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${id}, ${userId}, ${expiresAt})
  `;
}

export async function getSessionUserId(
  sessionId: string,
): Promise<number | null> {
  const rows = await sql`
    SELECT user_id FROM sessions
    WHERE id = ${sessionId} AND expires_at > NOW()
  `;
  return ((rows as { user_id: number }[])?.[0]?.user_id ?? null) as
    | number
    | null;
}

export async function getUserById(userId: number): Promise<UserRow | null> {
  const rows = await sql`
    SELECT id, github_id, username, avatar_url, created_at
    FROM users WHERE id = ${userId}
  `;
  return (rows as UserRow[])?.[0] ?? null;
}

// ============================================================
// Games
// ============================================================

export async function getGameWithPlayers(
  gameId: string,
): Promise<GameWithPlayers | null> {
  const rows = await sql`
    SELECT g.*,
      wu.username AS white_username, wu.avatar_url AS white_avatar_url,
      bu.username AS black_username, bu.avatar_url AS black_avatar_url
    FROM games g
    LEFT JOIN users wu ON g.player_white = wu.id
    LEFT JOIN users bu ON g.player_black = bu.id
    WHERE g.id = ${gameId}
  `;
  return (rows as GameWithPlayers[])?.[0] ?? null;
}

export async function getActiveGameByUsername(
  username: string,
): Promise<GameWithPlayers | null> {
  const rows = await sql`
    SELECT g.*,
      wu.username AS white_username, wu.avatar_url AS white_avatar_url,
      bu.username AS black_username, bu.avatar_url AS black_avatar_url
    FROM games g
    LEFT JOIN users wu ON g.player_white = wu.id
    LEFT JOIN users bu ON g.player_black = bu.id
    WHERE (wu.username = ${username} OR bu.username = ${username})
      AND g.status = 'active'
    ORDER BY g.created_at DESC
    LIMIT 1
  `;
  return (rows as GameWithPlayers[])?.[0] ?? null;
}

export async function getGamesByUserId(
  userId: number,
): Promise<GameWithPlayers[]> {
  const rows = await sql`
    SELECT g.*,
      wu.username AS white_username, wu.avatar_url AS white_avatar_url,
      bu.username AS black_username, bu.avatar_url AS black_avatar_url
    FROM games g
    LEFT JOIN users wu ON g.player_white = wu.id
    LEFT JOIN users bu ON g.player_black = bu.id
    WHERE g.player_white = ${userId} OR g.player_black = ${userId}
    ORDER BY g.created_at DESC
    LIMIT 20
  `;
  return (rows as GameWithPlayers[]) ?? [];
}

export async function getGameById(gameId: string): Promise<GameRow | null> {
  const rows = await sql`
    SELECT * FROM games WHERE id = ${gameId}
  `;
  return (rows as GameRow[])?.[0] ?? null;
}

export async function updateGameFields(
  gameId: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const entries = Object.entries(fields);
  if (entries.length === 0) return;

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of entries) {
    const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    setClauses.push(`${dbKey} = $${setClauses.length + 1}`);
    values.push(value);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(gameId);

  const query = `UPDATE games SET ${setClauses.join(", ")} WHERE id = $${values.length}`;

  await sql.query(query, values);
}

// ============================================================
// Moves
// ============================================================

export async function createMove(fields: {
  game_id: string;
  from_square: string;
  to_square: string;
  san: string;
  fen_before: string;
  fen_after: string;
  player_id: number;
}): Promise<void> {
  await sql`
    INSERT INTO moves (game_id, from_square, to_square, san, fen_before, fen_after, player_id)
    VALUES (${fields.game_id}, ${fields.from_square}, ${fields.to_square}, ${fields.san}, ${fields.fen_before}, ${fields.fen_after}, ${fields.player_id})
  `;
}

// ============================================================
// Helper to build player objects from flat joined rows
// ============================================================

export function buildPlayerObjects(game: GameWithPlayers | null): {
  white_player: { username: string; avatar_url: string | null } | null;
  black_player: { username: string; avatar_url: string | null } | null;
} | null {
  if (!game) return null;

  return {
    white_player: game.white_username
      ? {
          username: game.white_username,
          avatar_url: game.white_avatar_url ?? null,
        }
      : null,
    black_player: game.black_username
      ? {
          username: game.black_username,
          avatar_url: game.black_avatar_url ?? null,
        }
      : null,
  };
}
