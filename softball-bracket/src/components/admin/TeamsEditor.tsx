import { useState } from "react";
import type { Regional } from "../../types";
import { fetchRegionalsFromESPN, fetchTeamIdsFromESPN } from "../../lib/espnApi";

interface TeamsEditorProps {
  regs: Regional[];
  onSave: (regs: Regional[]) => Promise<void>;
  onSaveTeamId: (name: string, espnId: string) => Promise<void>;
}

export default function TeamsEditor({ regs, onSave, onSaveTeamId }: TeamsEditorProps) {
  const [editRegs, setEditRegs] = useState<Regional[]>(regs.map(r => ({ ...r, teams: [...r.teams] })));
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const updateName = (ri: number, val: string) => {
    const n = editRegs.map(r => ({ ...r, teams: [...r.teams] }));
    n[ri].name = val;
    setEditRegs(n);
  };

  const updateTeam = (ri: number, ti: number, val: string) => {
    const n = editRegs.map(r => ({ ...r, teams: [...r.teams] }));
    n[ri].teams[ti] = val;
    setEditRegs(n);
  };

  const handleAutoImport = async () => {
    setImporting(true);
    setImportMsg(null);
    try {
      const [fetched, teamIds] = await Promise.all([
        fetchRegionalsFromESPN(),
        fetchTeamIdsFromESPN(),
      ]);
      if (!fetched || fetched.length === 0) {
        setImportMsg("No tournament games found yet — try again closer to the tournament start date.");
        return;
      }
      // Pad to 16 regionals if ESPN returned fewer
      const filled = Array.from({ length: 16 }, (_, i) =>
        fetched[i] ?? { id: `reg${i}`, name: `Regional ${i + 1}`, teams: ["", "", "", ""], winner: null }
      );
      setEditRegs(filled);
      await onSave(filled);
      // Save ESPN team IDs in parallel
      await Promise.all(Object.entries(teamIds).map(([name, id]) => onSaveTeamId(name, id)));
      setImportMsg(`✓ Imported ${fetched.length} regionals and ${Object.keys(teamIds).length} team ESPN IDs`);
    } catch (e) {
      console.error(e);
      setImportMsg("Error fetching from ESPN — check console.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="ac" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--mu2)", marginBottom: 3 }}>AUTO-IMPORT FROM ESPN</div>
          <div style={{ fontSize: 10, color: "var(--mu)" }}>
            Pulls all 64 teams + regional names from ESPN's scoreboard and auto-saves their ESPN team IDs.
          </div>
          {importMsg && (
            <div style={{ fontSize: 10, marginTop: 4, color: importMsg.startsWith("✓") ? "var(--grn)" : "var(--red)" }}>
              {importMsg}
            </div>
          )}
        </div>
        <button className="btn btn-g btn-s" onClick={handleAutoImport} disabled={importing}>
          {importing ? "Importing…" : "↓ Import from ESPN"}
        </button>
      </div>

      <div className="ag">
        {editRegs.map((r, ri) => (
          <div key={ri} className="ac">
            <h4>Regional {ri + 1}</h4>
            <div className="ri">
              <label>Name</label>
              <input className="inp" value={r.name} onChange={e => updateName(ri, e.target.value)} />
            </div>
            {r.teams.map((t, ti) => (
              <div key={ti} className="ri">
                <label>Seed {ti + 1}</label>
                <input className="inp" value={t} onChange={e => updateTeam(ri, ti, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button className="btn btn-g" onClick={() => onSave(editRegs)}>Save All Teams</button>
      </div>
    </>
  );
}