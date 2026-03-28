import type { WCWSBracket, Picks, Official } from "../../types";
import FinalsBracketCard from "../wcws/FinalsBracketCard";
import ChampionshipCard from "../wcws/ChampionshipCard";
import { getW3Loser } from "../../lib/wcwsLogic";

interface WCWSTabProps {
  brackets: WCWSBracket[];
  champA: string;
  champB: string;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function FinalsTab({ brackets, champA, champB, picks, official, locked, pick }: WCWSTabProps) {
  const w3Losers = [0, 1].map(bi => {
    const bp = picks?.wcws?.[bi] ?? {};
    const bo = official?.wcws?.[bi] ?? {};
    const merged = { ...bp, ...Object.fromEntries(Object.entries(bo).filter(([, v]) => v != null)) };
    return getW3Loser(merged);
  });

  return (
    <>
      <div className="st">WCWS <span className="pill p-gold">Oklahoma City · Double Elimination</span></div>
      <div className="bnr bnr-b" style={{ marginBottom: "1rem" }}>
        Each bracket is 4-team double elimination. Predict every individual game.
        The two bracket champions meet in the Championship Series.
      </div>
      <div className="wcws-grid">
        {brackets.map((b, bi) => (
          <FinalsBracketCard
            key={b.id}
            bi={bi}
            teams={b.teams}
            crossW3Loser={w3Losers[1 - bi]}
            picks={picks}
            official={official}
            locked={locked}
            pick={pick}
          />
        ))}
      </div>
      <ChampionshipCard
        champA={champA}
        champB={champB}
        picks={picks}
        official={official}
        locked={locked}
        pick={pick}
      />
    </>
  );
}