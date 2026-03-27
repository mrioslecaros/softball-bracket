import { useState } from "react";
import type { Regional, SRData, WCWSBracket, Official } from "../../types";

interface ResultsEditorProps {
  regs: Regional[];
  srData: SRData[];
  wcwsBrackets: WCWSBracket[];
  finA: string;
  finB: string;
  official: Official | null;
  onSave: (off: Official) => Promise<void>;
}

const emptyOfficial = (): Official => ({
  regionals: Array(16).fill(null),
  superregionals: Array(8).fill(null),
  wcws: [
    { wWinner: null, lWinner: null, bracketChamp: null },
    { wWinner: null, lWinner: null, bracketChamp: null },
  ],
  finals: { game1: null, game2: null, game3: null, champion: null },
});

export default function ResultsEditor({ regs, srData, wcwsBrackets, finA, finB, official, onSave }: ResultsEditorProps) {
  const [off, setOff] = useState<Official>(official || emptyOfficial());

  const upd = (next: Official) => { setOff(next); onSave(next); };

  return (
    <div className="ag">
      <div className="ac">
        <h4>Regional Winners</h4>
        {regs.map((r, ri) => (
          <div key={ri} className="ri">
            <label style={{ width: 100, fontSize: 10 }}>{r.name}</label>
            <select className="sel" value={off.regionals?.[ri] || ""}
              onChange={e => {
                const n = { ...off, regionals: [...(off.regionals || Array(16).fill(null))] };
                n.regionals[ri] = e.target.value || null;
                upd(n);
              }}>
              <option value="">— Pending —</option>
              {r.teams.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="ac">
        <h4>Super Regional Winners</h4>
        {srData.map((sr, si) => (
          <div key={si} className="ri">
            <label style={{ width: 80, fontSize: 10 }}>SR {si + 1}</label>
            <select className="sel" value={off.superregionals?.[si] || ""}
              onChange={e => {
                const n = { ...off, superregionals: [...(off.superregionals || Array(8).fill(null))] };
                n.superregionals[si] = e.target.value || null;
                upd(n);
              }}>
              <option value="">— Pending —</option>
              {[sr.teamA, sr.teamB].filter(t => t && !t.startsWith("TBD")).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="ac">
        <h4>WCWS Bracket Results</h4>
        {[0, 1].map(bi => (
          <div key={bi} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "var(--mu2)", marginBottom: 5, fontWeight: 600 }}>Bracket {bi + 1}</div>
            {([["wWinner", "W Bracket Winner"], ["lWinner", "Elim Bracket Winner"], ["bracketChamp", "Bracket Champion"]] as const).map(([k, lbl]) => (
              <div key={k} className="ri">
                <label style={{ width: 120, fontSize: 9 }}>{lbl}</label>
                <select className="sel" value={off.wcws?.[bi]?.[k] || ""}
                  onChange={e => {
                    const n: Official = JSON.parse(JSON.stringify(off));
                    n.wcws[bi][k] = e.target.value || null;
                    upd(n);
                  }}>
                  <option value="">— Pending —</option>
                  {(wcwsBrackets[bi]?.teams || []).filter(t => t && !t.includes("Winner")).map(t => (
                    <option key={t!} value={t!}>{t}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="ac">
        <h4>Finals Results</h4>
        {([["game1", "Game 1"], ["game2", "Game 2"], ["game3", "Game 3"], ["champion", "Champion"]] as const).map(([k, lbl]) => (
          <div key={k} className="ri">
            <label>{lbl}</label>
            <select className="sel" value={off.finals?.[k] || ""}
              onChange={e => {
                const n = { ...off, finals: { ...(off.finals), [k]: e.target.value || null } };
                upd(n);
              }}>
              <option value="">— Pending —</option>
              {[finA, finB].filter(t => t && !t.endsWith("Champion")).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}