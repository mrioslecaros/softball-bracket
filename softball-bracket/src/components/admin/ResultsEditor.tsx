import { useState } from "react";
import type { Regional, SRData, WCWSBracket, Official, WCWSBracketPicks } from "../../types";
import { deriveWCWSGames, getW3Loser } from "../../lib/wcwsLogic";

interface ResultsEditorProps {
  regs: Regional[];
  srData: SRData[];
  wcwsBrackets: WCWSBracket[];
  champA: string;
  champB: string;
  official: Official | null;
  onSave: (off: Official) => Promise<void>;
  onAutoFetch: (official: Official | null) => Promise<boolean>;
  onImportRegionalEventIds: () => Promise<number>;
  onImportSuperRegionalEventIds: () => Promise<number>;
  onImportWCWSEventIds: () => Promise<number>;
  onImportChampionshipEventIds: () => Promise<number>;
}

const emptyOfficial = (): Official => ({
  regionals: Array(16).fill(null),
  superregionals: Array(8).fill(null),
  wcws: [
    { w1: null, w2: null, w3: null, e1: null, e2: null, bf: null, ifg: null },
    { w1: null, w2: null, w3: null, e1: null, e2: null, bf: null, ifg: null },
  ],
  championship: { game1: null, game2: null, game3: null, champion: null },
});

export default function ResultsEditor({ regs, srData, wcwsBrackets, champA, champB, official, onSave, onAutoFetch, onImportRegionalEventIds, onImportSuperRegionalEventIds, onImportWCWSEventIds, onImportChampionshipEventIds }: ResultsEditorProps) {
  const [off, setOff] = useState<Official>(official || emptyOfficial());
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  const upd = (next: Official) => { setOff(next); onSave(next); };

  const handleAutoFetch = async () => {
    setFetching(true);
    setFetchMsg(null);
    try {
      const anyUpdated = await onAutoFetch(off);
      setFetchMsg(anyUpdated ? "✓ Results updated from ESPN" : "No new completed results found");
      if (anyUpdated) setOff(official || emptyOfficial());
    } catch {
      setFetchMsg("Error fetching — check console");
    } finally {
      setFetching(false);
    }
  };

  const makeImporter = (label: string, fn: () => Promise<number>) => async () => {
    setImporting(label);
    setFetchMsg(null);
    try {
      const count = await fn();
      setFetchMsg(count > 0 ? `✓ Imported ${count} ${label} event IDs` : `No ${label} games found yet`);
    } catch {
      setFetchMsg("Error importing event IDs — check console");
    } finally {
      setImporting(null);
    }
  };

  const w3Losers = [0, 1].map(bi => {
    const results = off.wcws?.[bi] ?? {};
    return getW3Loser(results);
  });

  const WCWS_LABELS: Record<string, string> = {
    w1: "W1 (S1 vs S4)", w2: "W2 (S2 vs S3)", w3: "W3 (Winners Final)",
    e1: "E1 (W1L vs W2L)", e2: "E2 (W3L vs E1W)",
    bf: "Bracket Final", ifg: "If Necessary",
  };

  const importRegionals = makeImporter("regional", onImportRegionalEventIds);
  const importSuperRegionals = makeImporter("super regional", onImportSuperRegionalEventIds);
  const importWCWS = makeImporter("WCWS", onImportWCWSEventIds);
  const importChampionship = makeImporter("championship", onImportChampionshipEventIds);

  return (
    <>
    <div className="ac" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--mu2)", marginBottom: 3 }}>AUTO-FETCH FROM ESPN</div>
        <div style={{ fontSize: 10, color: "var(--mu)" }}>Import event IDs then fetch completed game results automatically.</div>
        {fetchMsg && (
          <div style={{ fontSize: 10, marginTop: 4, color: fetchMsg.startsWith("✓") ? "var(--grn)" : "var(--red)" }}>{fetchMsg}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <button className="btn btn-s" onClick={importRegionals} disabled={importing !== null}>{importing === "regional" ? "Importing…" : "↓ Regional IDs"}</button>
        <button className="btn btn-s" onClick={importSuperRegionals} disabled={importing !== null}>{importing === "super regional" ? "Importing…" : "↓ Super Regional IDs"}</button>
        <button className="btn btn-s" onClick={importWCWS} disabled={importing !== null}>{importing === "WCWS" ? "Importing…" : "↓ WCWS IDs"}</button>
        <button className="btn btn-s" onClick={importChampionship} disabled={importing !== null}>{importing === "championship" ? "Importing…" : "↓ Championship IDs"}</button>
        <button className="btn btn-g btn-s" onClick={handleAutoFetch} disabled={fetching}>{fetching ? "Fetching…" : "↻ Fetch & Apply Results"}</button>
      </div>
    </div>
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
              {[sr.teamA, sr.teamB].filter(t => t && !t.startsWith("TBD")).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="ac">
        <h4>WCWS Bracket Results</h4>
        {[0, 1].map(bi => {
          const bracketPicks: WCWSBracketPicks = off.wcws?.[bi] ?? {
            w1: null, w2: null, w3: null, e1: null, e2: null, bf: null, ifg: null,
          };
          const games = deriveWCWSGames(wcwsBrackets[bi]?.teams ?? [], bracketPicks, off.wcws?.[bi], w3Losers[1 - bi]);
          return (
            <div key={bi} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--mu2)", marginBottom: 6, fontWeight: 600 }}>
                Bracket {bi + 1}
              </div>
              {(["w1", "w2", "w3", "e1", "e2", "bf", "ifg"] as const).map(k => {
                const gameTeams = games[k];
                return (
                  <div key={k} className="ri">
                    <label style={{ width: 120, fontSize: 10 }}>{WCWS_LABELS[k]}</label>
                    <select className="sel" value={off.wcws?.[bi]?.[k] ?? ""}
                      onChange={e => {
                        const n: Official = JSON.parse(JSON.stringify(off));
                        n.wcws[bi][k] = e.target.value || null;
                        upd(n);
                      }}>
                      <option value="">— Pending —</option>
                      {gameTeams.filter(t => t && t !== "TBD").map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="ac">
        <h4>Championship Series</h4>
        {(["game1", "game2", "game3"] as const).map(k => {
          const lbl = { game1: "Game 1", game2: "Game 2", game3: "Game 3" }[k];
          return (
            <div key={k} className="ri">
              <label>{lbl}</label>
              <select className="sel" value={off.championship?.[k] ?? ""}
                onChange={e => {
                  const n = { ...off, championship: { ...(off.championship), [k]: e.target.value || null } };
                  upd(n);
                }}>
                <option value="">— Pending —</option>
                {[champA, champB].filter(t => t && !t.endsWith("Champion")).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
