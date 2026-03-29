import { useState } from "react";
import type { Regional, SRData, WCWSBracket, Official } from "../../types";
import { ALL_GAME_KEYS, gameKeyLabel } from "../../lib/espnApi";

interface EspnEditorProps {
  regs: Regional[];
  srData: SRData[];
  wcwsBrackets: WCWSBracket[];
  official: Official | null;
  teamIds: Record<string, string>;
  eventIds: Record<string, string>;
  onSaveTeamId: (name: string, espnId: string) => Promise<void>;
  onSaveEventId: (gameKey: string, espnEventId: string) => Promise<void>;
  onAutoFetch: (official: Official | null) => Promise<boolean>;
  onImportRegionalEventIds: () => Promise<number>;
}

function IdInput({
  value,
  placeholder,
  onSave,
}: {
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === value) return;
    onSave(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <input
        className="inp"
        style={{ width: 120 }}
        placeholder={placeholder}
        value={draft}
        onChange={e => { setDraft(e.target.value); setSaved(false); }}
        onBlur={commit}
        onKeyDown={e => e.key === "Enter" && commit()}
      />
      {saved && <span style={{ fontSize: 10, color: "var(--grn)" }}>✓</span>}
    </div>
  );
}

export default function EspnEditor({
  regs, srData, wcwsBrackets, official,
  teamIds, eventIds, onSaveTeamId, onSaveEventId, onAutoFetch, onImportRegionalEventIds,
}: EspnEditorProps) {
  const [section, setSection] = useState<"teams" | "events">("teams");
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  // All unique teams currently in the bracket
  const allTeams = [...new Set(
    regs.flatMap(r => r.teams).filter(Boolean)
  )].sort() as string[];

  const regNames = regs.map(r => r.name);
  const srLabelList = srData.map(s => s.matchupLabel);
  const bracketTeams = wcwsBrackets.map(b => b.teams);

  const handleAutoFetch = async () => {
    setFetching(true);
    setFetchResult(null);
    try {
      const anyUpdated = await onAutoFetch(official);
      setFetchResult(anyUpdated ? "✓ Official results updated from ESPN" : "No new completed results found");
    } catch {
      setFetchResult("Error fetching results — check console");
    } finally {
      setFetching(false);
    }
  };

  const handleImportRegionalEventIds = async () => {
    setImporting(true);
    setImportMsg(null);
    try {
      const count = await onImportRegionalEventIds();
      setImportMsg(count > 0 ? `✓ Imported ${count} regional game event IDs` : "No regional games found yet — try again once games begin");
    } catch {
      setImportMsg("Error importing event IDs — check console");
    } finally {
      setImporting(false);
    }
  };

  // Group event keys by round for display (regionals/SRs are multi-game formats — not trackable by single event ID)
  const eventGroups: { label: string; keys: string[] }[] = [
    { label: "WCWS Bracket 1", keys: ALL_GAME_KEYS.filter(k => k.startsWith("wcws_0_")) },
    { label: "WCWS Bracket 2", keys: ALL_GAME_KEYS.filter(k => k.startsWith("wcws_1_")) },
    { label: "Championship Series", keys: ALL_GAME_KEYS.filter(k => k.startsWith("champ_")) },
  ];

  const eventIdsSet = Object.keys(eventIds).length;

  return (
    <div>
      {/* Auto-fetch bar */}
      <div className="ac" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--mu2)", marginBottom: 3 }}>AUTO-FETCH RESULTS FROM ESPN</div>
          <div style={{ fontSize: 10, color: "var(--mu)" }}>
            {eventIdsSet} event ID{eventIdsSet !== 1 ? "s" : ""} set · fetches completed games and updates official results
          </div>
          {fetchResult && (
            <div style={{ fontSize: 10, marginTop: 4, color: fetchResult.startsWith("✓") ? "var(--grn)" : "var(--red)" }}>
              {fetchResult}
            </div>
          )}
          {importMsg && (
            <div style={{ fontSize: 10, marginTop: 4, color: importMsg.startsWith("✓") ? "var(--grn)" : "var(--red)" }}>
              {importMsg}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="btn btn-g btn-s" onClick={handleAutoFetch} disabled={fetching || eventIdsSet === 0}>
            {fetching ? "Fetching…" : "↻ Fetch & Apply Results"}
          </button>
          <button className="btn btn-s" onClick={handleImportRegionalEventIds} disabled={importing}>
            {importing ? "Importing…" : "↓ Import Regional Event IDs"}
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1rem" }}>
        <button className={`atb${section === "teams" ? " on" : ""}`} onClick={() => setSection("teams")}>
          Team ESPN IDs <span className="spt">{Object.keys(teamIds).length}/{allTeams.length}</span>
        </button>
        <button className={`atb${section === "events" ? " on" : ""}`} onClick={() => setSection("events")}>
          Game Event IDs <span className="spt">{eventIdsSet}/{ALL_GAME_KEYS.length}</span>
        </button>
      </div>

      {section === "teams" && (
        <div>
          <div className="ibox">
            Enter the ESPN team ID for each team. Find it at
            {" "}<code>site.web.api.espn.com/apis/site/v2/sports/baseball/college-softball/teams</code>
            {" "}— look for the <code>id</code> field next to the team name. Tab or Enter to save each field.
          </div>
          {allTeams.length === 0 ? (
            <div style={{ color: "var(--mu)", fontSize: 11, padding: "1rem 0" }}>No teams loaded — set up regionals first.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 6 }}>
              {allTeams.map(name => (
                <div key={name} className="ac" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, flex: 1, marginRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </span>
                  <IdInput
                    value={teamIds[name] ?? ""}
                    placeholder="ESPN ID"
                    onSave={val => onSaveTeamId(name, val)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "events" && (
        <div>
          <div className="ibox">
            Enter the ESPN event ID for each individual WCWS and Championship game. Regionals and Super Regionals
            are multi-game formats — enter those winners manually in the Results tab.
            Find the event ID in the ESPN game URL:
            {" "}<code>espn.com/college-softball/game/_/gameId/<strong>:eventId</strong></code>.
            Tab or Enter to save each field.
          </div>
          {eventGroups.map(group => (
            <div key={group.label} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--mu2)", letterSpacing: ".7px", textTransform: "uppercase", marginBottom: 6 }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.keys.map(key => (
                  <div key={key} className="ac" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px" }}>
                    <span style={{ fontSize: 11, flex: 1, marginRight: 8, color: "var(--mu2)" }}>
                      {gameKeyLabel(key, regNames, srLabelList, bracketTeams)}
                    </span>
                    <IdInput
                      value={eventIds[key] ?? ""}
                      placeholder="Event ID"
                      onSave={val => onSaveEventId(key, val)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
