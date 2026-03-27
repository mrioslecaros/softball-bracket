import type { WCWSBracket, Picks, Official } from "../../types";
import { PTS } from "../../constants";

interface WCWSBracketCardProps {
  b: WCWSBracket;
  bi: number;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

interface SectionProps {
  label: string;
  sub: string;
  pkey: "wWinner" | "lWinner" | "bracketChamp";
  pts: string;
}

export default function WCWSBracketCard({ b, bi, picks, official, locked, pick }: WCWSBracketCardProps) {
  const bp = picks?.wcws?.[bi] || { wWinner: null, lWinner: null, bracketChamp: null };
  const bo = official?.wcws?.[bi] || { wWinner: null, lWinner: null, bracketChamp: null };
  const isP = (t: string | null) => !t || t.includes("Winner") || t.includes("Champion");

  const Section = ({ label, sub, pkey, pts }: SectionProps) => {
    const my = bp[pkey];
    const off = bo[pkey];
    return (
      <div className="wsec">
        <div className="wsec-lbl">
          {label}{" "}
          {sub && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--mu)", fontSize: 9 }}>{sub}</span>}
        </div>
        {b.teams.map((t, ti) => {
          const ph = isP(t);
          const st = (!ph && my === t) ? (off ? (off === t ? "correct" : "wrong") : "sel") : "";
          const isLose = off && off !== t && !ph;
          let cls = "prow";
          if (ph) cls += " dis";
          else if (isLose) cls += " wrong";
          else if (st === "correct") cls += " correct";
          else if (st === "sel") cls += " sel";
          return (
            <div key={ti} className={cls} onClick={() => !ph && !locked && !isLose && pick(`wcws.${bi}.${pkey}`, t!)}>
              <span className={`prname${ph ? " ph" : ""}`}>{t}</span>
              <span className="ptag">+{pts}</span>
              {!ph && <div className={`pdot${st === "sel" ? " on" : st === "correct" ? " c" : st === "wrong" ? " w" : ""}`} />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="wbc">
      <div className="wbc-hd">
        <span className="wbc-ttl">Bracket {bi + 1}</span>
        <span className="pill p-blu">4 teams · Double Elim</span>
      </div>
      <Section label="Winners Bracket Champion" sub="Goes undefeated" pkey="wWinner" pts={`${PTS.wcwsW} pts`} />
      <Section label="Elimination Bracket Champion" sub="Fights back through losers" pkey="lWinner" pts={`${PTS.wcwsL} pts`} />
      <Section label="Bracket Champion" sub="Advances to Finals" pkey="bracketChamp" pts={`${PTS.wcwsChamp} pts`} />
    </div>
  );
}