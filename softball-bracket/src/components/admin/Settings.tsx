import { useState } from "react";
import type { PointsConfig } from "../../lib/scoring";
import { PTS } from "../../constants";

const POINT_FIELDS: { key: keyof PointsConfig; label: string; desc: string }[] = [
  { key: "regional",         label: "Regional winner",          desc: "Per correct regional pick" },
  { key: "superregional",    label: "Super Regional winner",    desc: "Per correct super regional pick" },
  { key: "wcws",             label: "WCWS bracket game",        desc: "Per correct pick (all bracket rounds)" },
  { key: "championshipGame", label: "Championship Series game", desc: "Per individual game (3 max)" },
  { key: "champion",         label: "National Champion",        desc: "Correct champion bonus" },
];

interface SettingsProps {
  locked: boolean;
  onToggleLock: () => Promise<void>;
  points: PointsConfig;
  onSavePoints: (pts: PointsConfig) => Promise<void>;
}

export default function Settings({ locked, onToggleLock, points, onSavePoints }: SettingsProps) {
  const [draft, setDraft] = useState<PointsConfig>({ ...points });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSavePoints(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => setDraft({ ...PTS });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 500 }}>
      <div className="ac">
        <h4>Tournament Lock</h4>
        <div className="trow">
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Lock all picks</div>
            <div style={{ fontSize: 10, color: "var(--mu)" }}>Prevent changes once tournament starts</div>
          </div>
          <button className={`tog${locked ? " on" : ""}`} onClick={onToggleLock} />
        </div>
      </div>

      <div className="ac">
        <h4>Point Values</h4>
        {POINT_FIELDS.map(({ key, label, desc }) => (
          <div key={key} className="trow">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 10, color: "var(--mu)" }}>{desc}</div>
            </div>
            <input
              type="number"
              min={0}
              className="inp"
              style={{ width: 60, textAlign: "center" }}
              value={draft[key]}
              onChange={e => setDraft(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
            />
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: "0.75rem" }}>
          <button className="btn btn-g btn-s" onClick={handleSave}>
            {saved ? "✓ Saved" : "Save Points"}
          </button>
          <button className="btn btn-s" onClick={reset}>Reset to defaults</button>
        </div>
      </div>
    </div>
  );
}
