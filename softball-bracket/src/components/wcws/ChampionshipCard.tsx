import type { Picks, Official } from "../../types";
import { PTS } from "../../constants";
import { deriveChampionFromGames } from "../../lib/wcwsLogic";

interface FinalsCardProps {
  champA: string;
  champB: string;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function ChampionshipCard({ champA, champB, picks, official, locked, pick }: FinalsCardProps) {
  const pf = picks?.championship || { game1: null, game2: null, game3: null, champion: null };
  const of_ = official?.championship || { game1: null, game2: null, game3: null, champion: null };
  const teams = [champA, champB];
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
            <div key={ti} className={cls} onClick={() => !ph && !locked && !isLose && pick(`championship.${gk}`, t)}>
              <span className={`prname${ph ? " ph" : ""}`}>{t}</span>
              <span className="ptag">+{PTS.championshipGame}</span>
              {!ph && <div className={`pdot${st === "sel" ? " on" : st === "correct" ? " c" : st === "wrong" ? " w" : ""}`} />}
            </div>
          );
        })}
      </div>
    );
  };

  const myChamp = deriveChampionFromGames(pf);
  const offChamp = deriveChampionFromGames(of_);
  const champCorrect = !!myChamp && !!offChamp && myChamp === offChamp;
  const champWrong = !!myChamp && !!offChamp && myChamp !== offChamp;

  return (
    <div className="fin">
      <div className="fin-hd">
        <span className="fin-ttl">Championship Series</span>
        <span className="pill p-gold">Best of 3</span>
      </div>
      <div className="fin-body">
        <Game label="Game 1" gk="game1" />
        <Game label="Game 2" gk="game2" />
        <Game label="Game 3 (if needed)" gk="game3" />
      </div>
      {(offChamp || myChamp) && (
        <div style={{ padding: "12px 13px", borderTop: "1px solid var(--br)" }}>
          <div className="fg-lbl">National Champion · +{PTS.champion} pts</div>
          <div className={`champ-row${champCorrect ? " correct" : champWrong ? " wrong" : ""}`} style={{ marginTop: 8, borderRadius: 8 }}>
            <div className="champ-ico">🏆</div>
            <div>
              <div className="champ-lbl">{offChamp ? "NATIONAL CHAMPION" : "YOUR PICK"}</div>
              <div className="champ-nm">{offChamp ?? myChamp}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}