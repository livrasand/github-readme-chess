export type GameStatus = 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

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
  turn: 'w' | 'b';
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
