import type { Regional, Picks, Official } from "../../types";
import { PTS } from "../../constants";

interface RegionalCardProps {
  reg: Regional;
  ri: number;
  right?: boolean;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function RegionalCard({ reg, ri, right, picks, official, locked, pick }: RegionalCardProps) {
  const my = picks?.regionals?.[ri];
  const off = official?.regionals?.[ri];

  const dot = (t: string) => {
    if (my !== t) return "";
    if (!off) return "on";
    return off === t ? "c" : "w";
  };

  const rowCls = (t: string) => {
    if (!t) return "rteam dis";
    const isLose = off && off !== t;
    if (isLose) return "rteam wrong";
    if (my === t && off === t) return "rteam correct";
    if (my === t) return "rteam sel";
    return "rteam";
  };

  return (
    <div className={`rc${right ? " r" : ""}`}>
      <div className="rc-hd">
        <span className="rc-nm">{reg.name}</span>
        <span className="rc-num">#{ri + 1}</span>
      </div>
      <div className="rc-teams">
        {reg.teams.map((t, ti) => (
          <div
            key={ti}
            className={rowCls(t)}
            onClick={() => t && !locked && !(off && off !== t) && pick(`regionals.${ri}`, t)}
          >
            <span className="rseed">{ti + 1}</span>
            <span className="rname">{t || "TBD"}</span>
            {t && <div className={`rdot${dot(t) ? " " + dot(t) : ""}`} />}
          </div>
        ))}
      </div>
      {my && (
        <div className="rc-ft">
          Pick: <strong style={{ color: "var(--gold)" }}>{my}</strong> · +{PTS.regional} pt
        </div>
      )}
    </div>
  );
}