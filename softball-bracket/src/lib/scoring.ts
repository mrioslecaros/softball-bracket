import type { Picks, Official, WCWSBracketPicks } from "../types";
import { PTS } from "../constants";
import { deriveChampionFromGames } from "./wcwsLogic";

export type PointsConfig = typeof PTS;

const WCWS_KEYS: (keyof WCWSBracketPicks)[] = ["w1", "w2", "w3", "e1", "e2", "bf", "ifg"];

export function scoreAll(picks: Picks | null, official: Official | null, pts: Partial<PointsConfig> = {}): number {
  if (!picks || !official) return 0;
  const p: PointsConfig = { ...PTS, ...pts };

  let s = 0;

  (picks.regionals ?? []).forEach((pick, i) => {
    if (pick && official.regionals?.[i] === pick) s += p.regional;
  });

  (picks.superregionals ?? []).forEach((pick, i) => {
    if (pick && official.superregionals?.[i] === pick) s += p.superregional;
  });

  (picks.wcws ?? []).forEach((b, i) => {
    const ob = official.wcws?.[i];
    if (!ob) return;
    WCWS_KEYS.forEach(k => {
      if (b[k] && ob[k] === b[k]) s += p.wcws;
    });
  });

  const pc = picks.championship ?? {};
  const oc = official.championship ?? {};
  if (pc.game1 && oc.game1 === pc.game1) s += p.championshipGame;
  if (pc.game2 && oc.game2 === pc.game2) s += p.championshipGame;
  if (pc.game3 && oc.game3 === pc.game3) s += p.championshipGame;
  const pickedChamp = deriveChampionFromGames(pc);
  const officialChamp = deriveChampionFromGames(oc);
  if (pickedChamp && officialChamp && pickedChamp === officialChamp) s += p.champion;

  return s;
}