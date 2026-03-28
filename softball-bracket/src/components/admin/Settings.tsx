interface SettingsProps {
  locked: boolean;
  onToggleLock: () => Promise<void>;
}

export default function Settings({ locked, onToggleLock }: SettingsProps) {
  return (
    <div className="ac" style={{ maxWidth: 420 }}>
      <h4>Settings</h4>
      <div className="trow">
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Lock all picks</div>
          <div style={{ fontSize: 10, color: "var(--mu)" }}>Prevent changes once tournament starts</div>
        </div>
        <button className={`tog${locked ? " on" : ""}`} onClick={onToggleLock} />
      </div>
    </div>
  );
}