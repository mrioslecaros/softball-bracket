export interface Regional {
  id: string;
  name: string;
  teams: string[];
  winner: string | null;
}

export interface SRData {
  id: string;
  label: string;
  matchupLabel: string;
  regAIdx: number;
  regBIdx: number;
  regAName: string;
  regBName: string;
  teamA: string;
  teamB: string;
  isASet: boolean;
  isBSet: boolean;
}

export interface WCWSBracket {
  id: string;
  label: string;
  teams: (string | null)[];
}

export interface WCWSBracketPicks {
  wWinner: string | null;
  lWinner: string | null;
  bracketChamp: string | null;
}

export interface FinalsPicks {
  game1: string | null;
  game2: string | null;
  game3: string | null;
  champion: string | null;
}

export interface Picks {
  regionals: (string | null)[];
  superregionals: (string | null)[];
  wcws: WCWSBracketPicks[];
  finals: FinalsPicks;
}

export interface Official {
  regionals: (string | null)[];
  superregionals: (string | null)[];
  wcws: WCWSBracketPicks[];
  finals: FinalsPicks;
}

export interface User {
  name: string;
  email: string;
  picture: string | null;
  isAdmin: boolean;
}

export interface PlayerEntry {
  email: string;
  name: string;
  picks: Picks;
}

// Shared prop type used by almost every component
export interface CommonPickProps {
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export interface RegionalRow {
  regional_index: number;
  name: string;
  seed_1: string;
  seed_2: string;
  seed_3: string;
  seed_4: string;
}

export interface OfficialRow {
  id: number;
  data: Official
}

export interface PicksRow {
  user_email: string;
  user_name: string;
  data: Picks
}

export interface AdminRow {
  email: string;
}