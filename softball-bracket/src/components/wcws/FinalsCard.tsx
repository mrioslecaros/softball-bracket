import type { Picks, Official } from "../../types";
import { PTS } from "../../constants";

interface FinalsCardProps {
  teamA: string;
  teamB: string;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function FinalsCard({ teamA, teamB, picks, official, locked, pick }: FinalsCardProps) {
  const pf = picks?.finals || { game1: null, game2: null, game3: null, champion: null };
  const of_ = official?.finals || { game1: null, game2: null, game3: null, champion: null };
  const teams = [teamA, teamB];
  const isP = (t: string) => !t || t.endsWith("Champion");

  const Game = ({ label, gk }: { label: string; gk: "game1" | "game2" | "game3" }) => {
    const my = pf[gk];
    const off = of_[gk];
    return (
      <div className="fg">
        <div className="fg-lbl">{label}</div>
        {teams.map((t, ti) => {
          const ph = isP(t);
          const st = (!ph && my === t) ? (off ? (off === t ? "correct" : "wrong") : "sel") : "";
          const isLose = off && off !== t && !ph;
          let cls = "prow";
          if (ph) cls += " dis";
          else if (isLose) cls += " wrong";
          else if (st === "correct") cls += " correct";
          else if (st === "sel") cls += " sel";
          return (
            <div key={ti} className={cls} onClick={() => !ph && !locked && !isLose && pick(`finals.${gk}`, t)}>
              <span className={`prname${ph ? " ph" : ""}`}>{t}</span>
              <span className="ptag">+{PTS.finalsGame}</span>
              {!ph && <div className={`pdot${st === "sel" ? " on" : st === "correct" ? " c" : st === "wrong" ? " w" : ""}`} />}
            </div>
          );
        })}
      </div>
    );
  };

  const champMy = pf.champion;
  const champOff = of_.champion;

  return (
    <div className="fin">
      <div className="fin-hd">
        <span className="fin-ttl">Championship Finals</span>
        <span className="pill p-gold">Best of 3</span>
      </div>
      <div className="fin-body">
        <Game label="Game 1" gk="game1" />
        <Game label="Game 2" gk="game2" />
        <Game label="Game 3 (if needed)" gk="game3" />
      </div>
      <div style={{ padding: "12px 13px", borderTop: "1px solid var(--br)" }}>
        <div className="fg-lbl">National Champion · +{PTS.champion} pts</div>
        <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
          {teams.map((t, ti) => {
            const ph = isP(t);
            const st = (!ph && champMy === t) ? (champOff ? (champOff === t ? "correct" : "wrong") : "sel") : "";
            const isLose = champOff && champOff !== t && !ph;
            let cls = "prow";
            if (ph) cls += " dis";
            else if (isLose) cls += " wrong";
            else if (st === "correct") cls += " correct";
            else if (st === "sel") cls += " sel";
            return (
              <div key={ti} className={cls} style={{ flex: 1, minWidth: 130 }}
                onClick={() => !ph && !locked && !isLose && pick("finals.champion", t)}>
                <span className={`prname${ph ? " ph" : ""}`}>{t}</span>
                {!ph && <div className={`pdot${st === "sel" ? " on" : st === "correct" ? " c" : st === "wrong" ? " w" : ""}`} />}
              </div>
            );
          })}
        </div>
        {(champOff || champMy) && (
          <div className="champ-row" style={{ marginTop: 10, borderRadius: 8 }}>
            <div className="champ-ico">🏆</div>
            <div>
              <div className="champ-lbl">{champOff ? "NATIONAL CHAMPION" : "YOUR PICK"}</div>
              <div className="champ-nm">{champOff || champMy}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}