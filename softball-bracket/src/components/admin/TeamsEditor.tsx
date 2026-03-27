import { useState } from "react";
import type { Regional } from "../../types";

interface TeamsEditorProps {
  regs: Regional[];
  onSave: (regs: Regional[]) => Promise<void>;
}

export default function TeamsEditor({ regs, onSave }: TeamsEditorProps) {
  const [editRegs, setEditRegs] = useState<Regional[]>(regs.map(r => ({ ...r, teams: [...r.teams] })));

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

  return (
    <>
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