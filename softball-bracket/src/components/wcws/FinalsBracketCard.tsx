import type { WCWSBracketPicks, Picks, Official } from "../../types";
import { deriveWCWSGames, ifgRequired } from "../../lib/wcwsLogic";

interface WCWSBracketCardProps {
  bi: number;
  teams: (string | null)[];
  crossW3Loser?: string | null;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

type GameKey = keyof WCWSBracketPicks;

const GAME_META: {
  key: GameKey;
  label: string;
  pts: number;
  section: "winners" | "elim" | "final";
}[] = [
  { key: "w1",  label: "Winners game 1",        pts: 2, section: "winners" },
  { key: "w2",  label: "Winners game 2",        pts: 2, section: "winners" },
  { key: "w3",  label: "Winners bracket final", pts: 3, section: "winners" },
  { key: "e1",  label: "Elimination game 1",    pts: 2, section: "elim"    },
  { key: "e2",  label: "Elimination game 2",    pts: 3, section: "elim"    },
  { key: "bf",  label: "Bracket final",         pts: 4, section: "final"   },
  { key: "ifg", label: "If necessary",          pts: 4, section: "final"   },
];

export default function WCWSBracketCard({ bi, teams, crossW3Loser, picks, official, locked, pick }: WCWSBracketCardProps) {
  const bp: WCWSBracketPicks = picks?.wcws?.[bi] ?? {
    w1: null, w2: null, w3: null,
    e1: null, e2: null, bf: null, ifg: null,
  };
  const bo: Partial<WCWSBracketPicks> = official?.wcws?.[bi] ?? {};

  const games = deriveWCWSGames(teams, bp, bo, crossW3Loser);
  const ifgNeeded = ifgRequired(bp, bo);

  const GameRow = ({ gameKey }: { gameKey: GameKey }) => {
    const gameTeams = games[gameKey];
    const myPick = bp[gameKey];
    const offPick = bo[gameKey];
    const meta = GAME_META.find(m => m.key === gameKey)!;
    const bothKnown = gameTeams[0] !== "TBD" && gameTeams[1] !== "TBD";

    // IF game: only pickable if elim side won BF
    const isIfg = gameKey === "ifg";
    const ifgLocked = isIfg && !ifgNeeded;

    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 9, fontWeight: 600, letterSpacing: ".7px",
          textTransform: "uppercase", color: "var(--mu2)",
          marginBottom: 5, display: "flex", justifyContent: "space-between"
        }}>
          <span>{meta.label}</span>
          {ifgLocked
            ? <span style={{ color: "var(--mu)", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>only if elim side wins BF</span>
            : <span style={{ color: "var(--gold)" }}>+{meta.pts} pts</span>
          }
        </div>
        {!bothKnown && !ifgLocked && (
          <div style={{ fontSize: 10, color: "var(--mu)", fontStyle: "italic", padding: "4px 0" }}>
            Awaiting earlier results
          </div>
        )}
        {ifgLocked && (
          <div style={{ fontSize: 10, color: "var(--mu)", fontStyle: "italic", padding: "4px 0" }}>
            Not needed unless elimination bracket wins the bracket final
          </div>
        )}
        {!ifgLocked && gameTeams.map((team, ti) => {
          const isTbd = team === "TBD";
          const isOfficialLoser = !!offPick && offPick !== team;
          const st = (!isTbd && myPick === team)
            ? (offPick ? (offPick === team ? "correct" : "wrong") : "sel")
            : "";

          let cls = "prow";
          if (isTbd)                cls += " dis";
          else if (isOfficialLoser) cls += " wrong";
          else if (st === "correct") cls += " correct";
          else if (st === "sel")     cls += " sel";

          return (
            <div
              key={ti}
              className={cls}
              onClick={() => !isTbd && !locked && !isOfficialLoser && pick(`wcws.${bi}.${gameKey}`, team)}
            >
              <span className={`prname${isTbd ? " ph" : ""}`}>{team}</span>
              {!isTbd && (
                <div className={`pdot${
                  st === "sel" ? " on" :
                  st === "correct" ? " c" :
                  st === "wrong" ? " w" : ""
                }`} />
              )}
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

      <div className="wsec">
        <div className="wsec-lbl" style={{ marginBottom: 10 }}>
          Winners bracket <span style={{ color: "var(--blu)", marginLeft: 4, fontSize: 8 }}>●</span>
        </div>
        <GameRow gameKey="w1" />
        <GameRow gameKey="w2" />
        <GameRow gameKey="w3" />
      </div>

      <div className="wsec">
        <div className="wsec-lbl" style={{ marginBottom: 10 }}>
          Elimination bracket <span style={{ color: "var(--red)", marginLeft: 4, fontSize: 8 }}>●</span>
        </div>
        <GameRow gameKey="e1" />
        <GameRow gameKey="e2" />
      </div>

      <div className="wsec">
        <div className="wsec-lbl" style={{ marginBottom: 10 }}>Bracket final</div>
        <GameRow gameKey="bf" />
        <GameRow gameKey="ifg" />
      </div>
    </div>
  );
}