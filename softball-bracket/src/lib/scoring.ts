import type { Picks, Official } from "../types";
import { PTS } from "../constants";

export function scoreAll(picks: Picks | null, official: Official | null): number { 
    if (!picks || !official) return 0;
  let s = 0;
  (picks.regionals||[]).forEach((p,i)=>{ if(p && official.regionals?.[i]===p) s+=PTS.regional; });
  (picks.superregionals||[]).forEach((p,i)=>{ if(p && official.superregionals?.[i]===p) s+=PTS.superregional; });
  (picks.wcws||[]).forEach((b,i)=>{
    const ob = official.wcws?.[i]||{};
    if(b.wWinner && ob.wWinner===b.wWinner) s+=PTS.wcwsW;
    if(b.lWinner && ob.lWinner===b.lWinner) s+=PTS.wcwsL;
    if(b.bracketChamp && ob.bracketChamp===b.bracketChamp) s+=PTS.wcwsChamp;
  });
  const pf=picks.finals||{}, of=official.finals||{};
  if(pf.game1 && of.game1===pf.game1) s+=PTS.finalsGame;
  if(pf.game2 && of.game2===pf.game2) s+=PTS.finalsGame;
  if(pf.game3 && of.game3===pf.game3) s+=PTS.finalsGame;
  if(pf.champion && of.champion===pf.champion) s+=PTS.champion;
  return s;
 }