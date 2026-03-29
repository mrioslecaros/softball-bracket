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

export interface FinalsPicks {
  game1: string | null;
  game2: string | null;
  game3: string | null;
  champion: string | null;
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

export interface WCWSBracketPicks {
  w1: string | null;   // seed1 vs seed4
  w2: string | null;   // seed2 vs seed3
  w3: string | null;   // W1winner vs W2winner (winners final)
  e1: string | null;   // W1loser vs W2loser
  e2: string | null;   // W3loser vs E1winner
  bf: string | null;   // W3winner vs E2winner (bracket final)
  ifg: string | null;  // if necessary (only if E side won BF)
}

export interface ChampionshipSeriesPicks {
  game1: string | null;
  game2: string | null;
  game3: string | null;
  champion: string | null;
}

export interface Picks {
  regionals: (string | null)[];
  superregionals: (string | null)[];
  wcws: WCWSBracketPicks[];             // [0]=Bracket1, [1]=Bracket2
  championship: ChampionshipSeriesPicks;
  lockedIn?: boolean;
}

export interface Official {
  regionals: (string | null)[];
  superregionals: (string | null)[];
  wcws: WCWSBracketPicks[];
  championship: ChampionshipSeriesPicks;
}