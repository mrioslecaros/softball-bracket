export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const PTS = {
  regional: 1,
  superregional: 2,
  wcwsGame12: 2,       // W1, W2, E1
  wcwsGame3: 3,        // W3, E2
  wcwsBF: 4,           // Bracket Final
  wcwsIF: 4,           // If Necessary
  championshipGame: 4, // Championship Series games
  champion: 10,
} as const;

// [regA index, regB index] 0-based
export const SR_PAIRS: [number, number][] = [
  [0,15],[8,7],[4,11],[12,3],[2,13],[10,5],[6,9],[14,1]
];

export const SR_LABELS = [
  "R1 vs R16","R9 vs R8","R5 vs R12","R13 vs R4",
  "R3 vs R14","R11 vs R6","R7 vs R10","R15 vs R2"
];

// SR_PAIRS indices 0-3 → Bracket 2, indices 4-7 → Bracket 1
// So wcwsBrackets[0] = Bracket 1 (SR indices 4,5,6,7)
//    wcwsBrackets[1] = Bracket 2 (SR indices 0,1,2,3)
export const BRACKET_SR_INDICES: [number[], number[]] = [
  [4, 5, 6, 7],  // Bracket 1
  [0, 1, 2, 3],  // Bracket 2
];

// Within each bracket, seeding order for 1v4 and 2v3:
// teams[0]=seed1, teams[1]=seed2, teams[2]=seed3, teams[3]=seed4
// W1: seed1 vs seed4, W2: seed2 vs seed3
export const BRACKET_SEEDING = {
  w1: [0, 1] as [number, number],  // seed1 vs seed4
  w2: [3, 2] as [number, number],  // seed2 vs seed3
};