// DEPRECATED: This file is kept for compatibility.
// All database access now uses @/lib/db.
// Import directly from "@/lib/db" for new code.

export {
  upsertUser,
  createSession,
  getSessionUserId,
  getUserById,
  getGameWithPlayers,
  getActiveGameByUsername,
  getGamesByUserId,
  getGameById,
  updateGameFields,
  createMove,
  buildPlayerObjects,
} from "./db";

export type { UserRow, GameRow, GameWithPlayers } from "./db";

// Deprecated - throws if called, to catch any remaining usage
export function getSupabase(): never {
  throw new Error(
    "Supabase is no longer used. Import from @/lib/db instead (it now uses Neon/PostgreSQL directly).",
  );
}
