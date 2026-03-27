import { useState } from "react";

interface AdminManagerProps {
  admins: string[];
  currentUserEmail: string;
  onAdd: (email: string) => Promise<void>;
  onRemove: (email: string) => Promise<void>;
}

export default function AdminManager({ admins, currentUserEmail, onAdd, onRemove }: AdminManagerProps) {
  const [newEmail, setNewEmail] = useState("");
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    const email = newEmail.toLowerCase().trim();
    if (!email.includes("@")) { setErr("Enter a valid email"); return; }
    if (admins.includes(email)) { setErr("Already an admin"); return; }
    await onAdd(email);
    setNewEmail(""); setErr("");
  };

  return (
    <div className="ac" style={{ maxWidth: 480 }}>
      <h4>Admin Users</h4>
      <div style={{ marginBottom: "0.75rem" }}>
        {admins.map(email => (
          <div key={email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--br)", fontSize: 12 }}>
            <span style={{ color: email === currentUserEmail ? "var(--gold)" : "var(--tx)" }}>
              {email}{email === currentUserEmail && " (you)"}
            </span>
            {email !== currentUserEmail && (
              <button className="btn btn-s" style={{ color: "var(--red)", borderColor: "var(--red)" }}
                onClick={() => onRemove(email)}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input className="inp" style={{ flex: 1 }} placeholder="new-admin@gmail.com"
          value={newEmail}
          onChange={e => { setNewEmail(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
        />
        <button className="btn btn-g btn-s" onClick={handleAdd}>Add</button>
      </div>
      {err && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{err}</div>}
    </div>
  );
}