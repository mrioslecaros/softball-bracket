interface ESPNEvent {
  id: string;
  name: string;
  status?: { type?: { shortDetail?: string } };
  competitions?: Array<{ competitors?: Array<{ score: string }> }>;
}

interface ScoresProps {
  games: ESPNEvent[];
  onRefresh: () => void;
}

export default function Scores({ games, onRefresh }: ScoresProps) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div className="st" style={{ marginBottom: 0 }}>Live Scores</div>
        <button className="btn btn-s" onClick={onRefresh}>↻ Refresh</button>
      </div>
      {games.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--mu)" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📺</div>
          No live games found. Check back during the tournament (May–June 2025).
          <br /><br />
          <button className="btn btn-s" onClick={onRefresh}>Try fetching scores</button>
        </div>
      ) : (
        games.map(ev => (
          <div key={ev.id} style={{ background: "var(--card)", border: "1px solid var(--br)", borderRadius: 9, padding: "10px 13px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.name}</div>
              <div style={{ fontSize: 10, color: "var(--mu)", marginTop: 2 }}>{ev.status?.type?.shortDetail}</div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, color: "var(--gold)", letterSpacing: 1 }}>
              {ev.competitions?.[0]?.competitors?.map(c => c.score).join(" – ")}
            </div>
          </div>
        ))
      )}
    </>
  );
}