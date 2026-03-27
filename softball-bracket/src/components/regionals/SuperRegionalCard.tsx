import type { SRData, Picks, Official } from "../../types";
import { PTS } from "../../constants";

interface SuperRegionalCardProps {
  sr: SRData;
  si: number;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function SuperRegionalCard({ sr, si, picks, official, locked, pick }: SuperRegionalCardProps) {
  const my = picks?.superregionals?.[si];
  const off = official?.superregionals?.[si];
  const isSet = [sr.isASet, sr.isBSet];
  const teams = [sr.teamA, sr.teamB];
  const regNames = [sr.regAName, sr.regBName];
  const bothSet = sr.isASet && sr.isBSet;
  const neitherSet = !sr.isASet && !sr.isBSet;

  const dot = (t: string, set: boolean) => {
    if (!set || my !== t) return "";
    if (!off) return "on";
    return off === t ? "c" : "w";
  };

  const rowCls = (t: string, set: boolean) => {
    if (!set) return "srteam dis";
    const isLose = off && off !== t;
    if (isLose) return "srteam wrong";
    if (my === t && off === t) return "srteam correct";
    if (my === t) return "srteam sel";
    return "srteam";
  };

  return (
    <div className="src">
      <div className="src-hd">
        <span>Super Regional {si + 1}</span>
        <span className="pill p-gold" style={{ fontSize: 9 }}>{sr.matchupLabel}</span>
        <span className="pill p-blu">Best of 3</span>
      </div>
      {!bothSet && (
        <div style={{ padding: "6px 11px 4px", fontSize: 10, color: "var(--mu)", fontStyle: "italic" }}>
          {neitherSet
            ? `Pick winners of ${regNames[0]} and ${regNames[1]} first`
            : `Pick winner of ${!sr.isASet ? regNames[0] : regNames[1]} first`}
        </div>
      )}
      {teams.map((t, ti) => {
        const set = isSet[ti];
        const cls = rowCls(t, set);
        const d = dot(t, set);
        return (
          <div
            key={ti}
            className={cls}
            onClick={() => set && !locked && !(off && off !== t) && pick(`superregionals.${si}`, t)}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="srtname" style={!set ? { color: "var(--mu)", fontStyle: "italic", fontWeight: 400 } : {}}>
                {set ? t : "TBD"}
              </div>
              <div style={{ fontSize: 9, color: "var(--mu)", marginTop: 1 }}>{regNames[ti]}</div>
            </div>
            {set && <div className={`srdot${d ? " " + d : ""}`} />}
          </div>
        );
      })}
      {my && <div className="src-ft">Pick: <strong style={{ color: "var(--gold)" }}>{my}</strong> · +{PTS.superregional} pts</div>}
      {!my && bothSet && <div className="src-ft">Pick the series winner · +{PTS.superregional} pts</div>}
    </div>
  );
}