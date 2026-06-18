export type GameStatus =
  | "active"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned";

export interface User {
  id: number;
  github_id: number;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Game {
  id: string;
  fen: string;
  status: GameStatus;
  turn: "w" | "b";
  player_white: number | null;
  player_black: number | null;
  selected_square: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoveRecord {
  id: number;
  game_id: string;
  from_square: string;
  to_square: string;
  san: string;
  fen_before: string;
  fen_after: string;
  player_id: number;
  created_at: string;
}

export interface ThemeRow {
  id: string;
  user_id: number;
  name: string;
  light_color: string;
  dark_color: string;
  selected_light_color: string;
  selected_dark_color: string;
  legal_move_dot_color: string;
  legal_move_capture_color: string;
  file_rank_color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SVGConfig {
  squareSize: number;
  lightColor: string;
  darkColor: string;
  selectedLightColor: string;
  selectedDarkColor: string;
  legalMoveDotColor: string;
  legalMoveCaptureColor: string;
  fileRankColor: string;
}
