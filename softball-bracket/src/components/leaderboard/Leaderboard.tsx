import type { Picks, Official } from "../../types";
import { scoreAll } from "../../lib/scoring";

interface LeaderboardProps {
  allPicks: Record<string, { name: string; picks: Picks }>;
  official: Official | null;
  me: string;
}

export default function Leaderboard({ allPicks, official, me }: LeaderboardProps) {
  const rows = Object.entries(allPicks).map(([email, d]) => ({
    email,
    name: d.name,
    score: scoreAll(d.picks, official),
    regC: official
      ? (d.picks?.regionals || []).filter((p, i) => p && official.regionals?.[i] === p).length
      : "—",
  })).sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="st">Standings <span className="pill p-gold">{rows.length} players</span></div>
      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--mu)" }}>No brackets yet.</div>
      ) : (
        <div className="lbt">
          <div className="lb-hd">
            <div>#</div><div>Player</div>
            <div style={{ textAlign: "right" }}>Score</div>
            <div style={{ textAlign: "right" }}>Reg ✓</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.email} className={`lb-row${r.email === me ? " me" : ""}`}>
              <div className={`lb-rk${i < 3 ? " top" : ""}`}>{i + 1}</div>
              <div className="lb-nm">{r.name}{r.email === me ? " (you)" : ""}</div>
              <div className="lb-sc">{r.score}</div>
              <div className="lb-sub">{r.regC}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}