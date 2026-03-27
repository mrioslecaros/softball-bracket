import type { User } from "../../types";

interface HeaderProps {
  tab: string;
  setTab: (tab: string) => void;
  user: User;
  onSignOut: () => void;
  isAdmin: boolean;
  score: number;
  hasOfficial: boolean;
}

export default function Header({ tab, setTab, user, onSignOut, isAdmin, score, hasOfficial }: HeaderProps) {
  return (
    <div className="hdr">
      <div className="logo">WCWS 2025 <em>Bracket Challenge</em></div>
      <div className="nav">
        <button className={`nb${tab === "regs" ? " on" : ""}`} onClick={() => setTab("regs")}>
          Reg &amp; Supers
        </button>
        <button className={`nb${tab === "wcws" ? " on" : ""}`} onClick={() => setTab("wcws")}>
          WCWS
        </button>
        <button className={`nb${tab === "lb" ? " on" : ""}`} onClick={() => setTab("lb")}>
          Standings
        </button>
        <button className={`nb${tab === "scores" ? " on" : ""}`} onClick={() => setTab("scores")}>
          Scores
        </button>
        {isAdmin && (
          <button className={`nb${tab === "admin" ? " on" : ""}`} onClick={() => setTab("admin")}>
            Admin
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {hasOfficial && <div className="spt">{score} pts</div>}
        <div className="av" onClick={onSignOut} title="Sign out">
          {user.picture
            ? <img src={user.picture} alt="" />
            : user.name[0]
          }
        </div>
      </div>
    </div>
  );
}