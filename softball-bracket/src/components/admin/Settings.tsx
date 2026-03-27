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
      <div style={{ marginTop: 10 }}>
        <div className="ibox">
          <strong>Google OAuth setup:</strong><br />
          1. console.cloud.google.com → create project<br />
          2. APIs &amp; Services → Credentials → OAuth 2.0 Client ID<br />
          3. Add your site URL to Authorized JavaScript origins<br />
          4. Set VITE_GOOGLE_CLIENT_ID in your .env file
        </div>
      </div>
    </div>
  );
}