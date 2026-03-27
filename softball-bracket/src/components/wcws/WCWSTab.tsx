import type { WCWSBracket, Picks, Official } from "../../types";
import WCWSBracketCard from "./WCWSBracketCard";
import FinalsCard from "./FinalsCard";

interface WCWSTabProps {
  brackets: WCWSBracket[];
  finA: string;
  finB: string;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function WCWSTab({ brackets, finA, finB, picks, official, locked, pick }: WCWSTabProps) {
  return (
    <>
      <div className="st">WCWS <span className="pill p-gold">Oklahoma City · Double Elimination</span></div>
      <div className="bnr bnr-b" style={{ marginBottom: "1rem" }}>
        Each bracket is double elimination. Pick the Winners bracket winner, the Elimination bracket winner,
        and the bracket champion. Then pick each Finals game.
      </div>
      <div className="wcws-grid">
        {brackets.map((b, bi) => (
          <WCWSBracketCard key={b.id} b={b} bi={bi} picks={picks} official={official} locked={locked} pick={pick} />
        ))}
      </div>
      <FinalsCard teamA={finA} teamB={finB} picks={picks} official={official} locked={locked} pick={pick} />
    </>
  );
}