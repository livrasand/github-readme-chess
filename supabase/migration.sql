-- ============================================================
-- Chess-in-README - Esquema de Base de Datos (Supabase/PostgreSQL)
-- ============================================================

-- 1. Usuarios (sincronizados con GitHub OAuth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sesiones de autenticacion
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 3. Partidas de ajedrez
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'checkmate', 'stalemate', 'draw', 'resigned')),
  turn TEXT NOT NULL DEFAULT 'w' CHECK (turn IN ('w', 'b')),
  player_white INTEGER REFERENCES users(id),
  player_black INTEGER REFERENCES users(id),
  selected_square TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_player_white ON games(player_white);
CREATE INDEX IF NOT EXISTS idx_games_player_black ON games(player_black);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);

-- 4. Historial de movimientos
CREATE TABLE IF NOT EXISTS moves (
  id SERIAL PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  from_square TEXT NOT NULL,
  to_square TEXT NOT NULL,
  san TEXT NOT NULL,
  fen_before TEXT NOT NULL,
  fen_after TEXT NOT NULL,
  player_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moves_game_id ON moves(game_id);

-- ============================================================
-- Funcion para limpiar sesiones expiradas (opcional, via cron)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
