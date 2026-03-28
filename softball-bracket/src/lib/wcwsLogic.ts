import type { WCWSBracketPicks } from "../types";
import { BRACKET_SEEDING } from "../constants";

export interface WCWSGames {
  w1: [string, string];
  w2: [string, string];
  w3: [string, string];
  e1: [string, string];
  e2: [string, string];
  bf: [string, string];
  ifg: [string, string];
}

const TBD = "TBD";

export function deriveWCWSGames(
  teams: (string | null)[],
  picks: WCWSBracketPicks,
  official?: Partial<WCWSBracketPicks>,
  crossBracketW3Loser?: string | null
): WCWSGames {
  const t = (i: number) => teams[i] ?? TBD;

  // W1: seed1 vs seed4, W2: seed2 vs seed3
  const w1: [string, string] = [t(BRACKET_SEEDING.w1[0]), t(BRACKET_SEEDING.w1[1])];
  const w2: [string, string] = [t(BRACKET_SEEDING.w2[0]), t(BRACKET_SEEDING.w2[1])];

  // W3: W1winner vs W2winner
  const w1win = official?.w1 ?? picks.w1;
  const w2win = official?.w2 ?? picks.w2;
  const w3: [string, string] = [w1win ?? TBD, w2win ?? TBD];

  // E1: W1loser vs W2loser (first-round losers stay in same bracket)
  const w1lose = w1win ? w1.find(t => t !== w1win) ?? TBD : TBD;
  const w2lose = w2win ? w2.find(t => t !== w2win) ?? TBD : TBD;
  const e1: [string, string] = [w1lose, w2lose];

  // E2: cross-bracket W3 loser vs E1 winner
  // The team that went undefeated to W3 but lost crosses into the OTHER bracket's E2
  const w3win = official?.w3 ?? picks.w3;
  const e1win = official?.e1 ?? picks.e1;
  const e2TeamA = crossBracketW3Loser ?? TBD;
  const e2: [string, string] = [e2TeamA, e1win ?? TBD];

  // BF: W3winner vs E2winner
  const e2win = official?.e2 ?? picks.e2;
  const bf: [string, string] = [w3win ?? TBD, e2win ?? TBD];

  // IF: same teams as BF — only played if elim side (e2win) won BF
  const bfWin = official?.bf ?? picks.bf;
  const elimSideWonBF = bfWin !== null && bfWin === e2win;
  const ifg: [string, string] = elimSideWonBF
    ? [w3win ?? TBD, e2win ?? TBD]
    : [w3win ?? TBD, e2win ?? TBD]; // show same teams, disabled if not triggered

  return { w1, w2, w3, e1, e2, bf, ifg };
}

// Returns the W3 loser for a bracket (used for cross-bracket E2 seeding)
export function getW3Loser(results: Partial<WCWSBracketPicks>): string | null {
  const w1w = results.w1 ?? null;
  const w2w = results.w2 ?? null;
  const w3w = results.w3 ?? null;
  if (!w3w || !w1w || !w2w) return null;
  if (w3w === w1w) return w2w;
  if (w3w === w2w) return w1w;
  return null;
}

// Derives the champion from game picks — whoever wins 2 of 3 games
export function deriveChampionFromGames(
  games: { game1?: string | null; game2?: string | null; game3?: string | null }
): string | null {
  const results = [games.game1, games.game2, games.game3].filter(Boolean) as string[];
  const wins: Record<string, number> = {};
  for (const t of results) wins[t] = (wins[t] ?? 0) + 1;
  return Object.entries(wins).find(([, w]) => w >= 2)?.[0] ?? null;
}

// Whether the IF game is in play: elim side (E2 winner) won the BF
export function ifgRequired(
  picks: WCWSBracketPicks,
  official?: Partial<WCWSBracketPicks>
): boolean {
  const e2win = official?.e2 ?? picks.e2;
  const bfWin = official?.bf ?? picks.bf;
  return !!bfWin && !!e2win && bfWin === e2win;
}

// The bracket champion: IFG winner if IF game played, BF winner if winners side won BF, otherwise null
export function getBracketChampion(results: Partial<WCWSBracketPicks> | undefined): string | null {
  if (!results) return null;
  if (results.ifg) return results.ifg;
  // BF winner is champion only if they came from the winners side (not the E2 winner)
  if (results.bf && results.e2 && results.bf !== results.e2) return results.bf;
  return null;
}