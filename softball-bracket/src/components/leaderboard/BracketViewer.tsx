import type { Regional, Picks, Official, SRData, WCWSBracket } from "../../types";
import { SR_PAIRS, SR_LABELS, BRACKET_SR_INDICES } from "../../constants";
import { getBracketChampion } from "../../lib/wcwsLogic";
import RegSupers from "../wcws/RegSupers";

interface BracketViewerProps {
  name: string;
  viewedPicks: Picks;
  regs: Regional[];
  official: Official | null;
  onClose: () => void;
}

export default function BracketViewer({ name, viewedPicks, regs, official, onClose }: BracketViewerProps) {
  const srData: SRData[] = SR_PAIRS.map(([a, b], i) => {
    const regAName = regs[a]?.name ?? `Regional ${a + 1}`;
    const regBName = regs[b]?.name ?? `Regional ${b + 1}`;
    const teamA = official?.regionals?.[a] || viewedPicks.regionals?.[a] || null;
    const teamB = official?.regionals?.[b] || viewedPicks.regionals?.[b] || null;
    return {
      id: `sr${i}`,
      label: `Super Regional ${i + 1}`,
      matchupLabel: SR_LABELS[i],
      regAIdx: a, regBIdx: b,
      regAName, regBName,
      teamA: teamA ?? `TBD (${regAName})`,
      teamB: teamB ?? `TBD (${regBName})`,
      isASet: !!teamA, isBSet: !!teamB,
    };
  });

  const wcwsBrackets: WCWSBracket[] = BRACKET_SR_INDICES.map((srIndices, bi) => {
    const teams = srIndices.map(srIdx =>
      official?.superregionals?.[srIdx] ??
      viewedPicks.superregionals?.[srIdx] ??
      null
    ) as (string | null)[];
    return { id: `wb${bi}`, label: `Bracket ${bi + 1}`, teams };
  });

  const champA =
    getBracketChampion(official?.wcws?.[0]) ??
    getBracketChampion(viewedPicks.wcws?.[0]) ??
    "Bracket 1 Champion";

  const champB =
    getBracketChampion(official?.wcws?.[1]) ??
    getBracketChampion(viewedPicks.wcws?.[1]) ??
    "Bracket 2 Champion";

  return (
    <div className="ovl" onClick={onClose}>
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--br2)",
          borderRadius: 12,
          width: "95vw",
          maxWidth: 1400,
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "1.2rem",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "var(--gold)" }}>
              {name}'s Bracket
            </span>
            <span className="pill p-blu" style={{ marginLeft: 8 }}>read only</span>
          </div>
          <button className="btn btn-s" onClick={onClose}>✕ Close</button>
        </div>
        <RegSupers
          regs={regs}
          srData={srData}
          wcwsBrackets={wcwsBrackets}
          champA={champA}
          champB={champB}
          picks={viewedPicks}
          official={official}
          locked={true}
          pick={() => {}}
        />
      </div>
    </div>
  );
}
