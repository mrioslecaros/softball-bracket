import { useState } from "react";
import type { Regional, Picks, Official } from "../../types";
import { scoreAll } from "../../lib/scoring";
import type { PointsConfig } from "../../lib/scoring";
import BracketViewer from "./BracketViewer";

interface LeaderboardProps {
  allPicks: Record<string, { name: string; picks: Picks }>;
  official: Official | null;
  regs: Regional[];
  locked: boolean;
  playerLocked: boolean;
  me: string;
  points: PointsConfig;
}

export default function Leaderboard({ allPicks, official, regs, locked, playerLocked, me, points }: LeaderboardProps) {
  const [viewing, setViewing] = useState<{ email: string; name: string; picks: Picks } | null>(null);

  // Viewer can see brackets only if the tournament is admin-locked OR they've locked in their own picks
  const viewingUnlocked = locked || playerLocked;

  const rows = Object.entries(allPicks).map(([email, d]) => ({
    email,
    name: d.name,
    score: scoreAll(d.picks, official, points),
    regC: official
      ? (d.picks?.regionals || []).filter((p, i) => p && official.regionals?.[i] === p).length
      : "—",
    canView: viewingUnlocked && (locked || d.picks?.lockedIn === true),
  })).sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="st">Standings <span className="pill p-gold">{rows.length} players</span></div>
      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--mu)" }}>No brackets yet.</div>
      ) : (
        <>
          {!viewingUnlocked && (
            <div className="bnr bnr-b" style={{ marginBottom: ".75rem" }}>
              Lock in your own picks to view other players' brackets.
            </div>
          )}
          <div className="lbt">
            <div className="lb-hd">
              <div>#</div><div>Player</div>
              <div style={{ textAlign: "right" }}>Score</div>
              <div style={{ textAlign: "right" }}>Reg ✓</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.email}
                className={`lb-row${r.email === me ? " me" : ""}${r.canView ? " lb-clickable" : ""}`}
                style={r.canView ? { cursor: "pointer" } : undefined}
                onClick={r.canView ? () => setViewing({ email: r.email, name: r.name, picks: allPicks[r.email].picks }) : undefined}
                title={r.canView ? `View ${r.name}'s bracket` : undefined}
              >
                <div className={`lb-rk${i < 3 ? " top" : ""}`}>{i + 1}</div>
                <div className="lb-nm">
                  {r.name}{r.email === me ? " (you)" : ""}
                  {r.canView && <span className="pill p-blu" style={{ marginLeft: 6 }}>view</span>}
                  {/* {r.picks?.lockedIn && <span className="pill p-grn" style={{ marginLeft: 4 }}>locked in</span>} */}
                </div>
                <div className="lb-sc">{r.score}</div>
                <div className="lb-sub">{r.regC}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {viewing && (
        <BracketViewer
          name={viewing.name}
          viewedPicks={viewing.picks}
          regs={regs}
          official={official}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
