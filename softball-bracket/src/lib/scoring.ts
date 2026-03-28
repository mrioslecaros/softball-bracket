import type { Picks, Official, WCWSBracketPicks } from "../types";
import { PTS } from "../constants";
import { deriveChampionFromGames } from "./wcwsLogic";

const WCWS_GAME_PTS: Record<keyof WCWSBracketPicks, number> = {
  w1: PTS.wcwsGame12,
  w2: PTS.wcwsGame12,
  w3: PTS.wcwsGame3,
  e1: PTS.wcwsGame12,
  e2: PTS.wcwsGame3,
  bf: PTS.wcwsBF,
  ifg: PTS.wcwsIF,
};

const WCWS_GAME_KEYS = Object.keys(WCWS_GAME_PTS) as (keyof WCWSBracketPicks)[];

export function scoreAll(picks: Picks | null, official: Official | null): number {
  if (!picks || !official) return 0;
  let s = 0;

  (picks.regionals ?? []).forEach((p, i) => {
    if (p && official.regionals?.[i] === p) s += PTS.regional;
  });

  (picks.superregionals ?? []).forEach((p, i) => {
    if (p && official.superregionals?.[i] === p) s += PTS.superregional;
  });

  (picks.wcws ?? []).forEach((b, i) => {
    const ob = official.wcws?.[i];
    if (!ob) return;
    WCWS_GAME_KEYS.forEach(k => {
      if (b[k] && ob[k] === b[k]) s += WCWS_GAME_PTS[k];
    });
  });

  const pc = picks.championship ?? {};
  const oc = official.championship ?? {};
  if (pc.game1 && oc.game1 === pc.game1) s += PTS.championshipGame;
  if (pc.game2 && oc.game2 === pc.game2) s += PTS.championshipGame;
  if (pc.game3 && oc.game3 === pc.game3) s += PTS.championshipGame;
  const pickedChamp = deriveChampionFromGames(pc);
  const officialChamp = deriveChampionFromGames(oc);
  if (pickedChamp && officialChamp && pickedChamp === officialChamp) s += PTS.champion;

  return s;
}