export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const PTS = {
  regional: 1,
  superregional: 2,
  wcwsW: 4,
  wcwsL: 3,
  wcwsChamp: 6,
  finalsGame: 4,
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