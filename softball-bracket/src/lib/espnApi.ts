import type { Official, Regional, WCWSBracketPicks } from "../types";

const ESPN_BASE = "https://site.web.api.espn.com/apis/site/v2/sports/baseball/college-softball";
const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/baseball/college-softball/scoreboard";
const ESPN_SEASON_TYPE3 = "https://sports.core.api.espn.com/v2/sports/baseball/leagues/college-softball/seasons/2025/types/3?lang=en&region=us";

function dateToString(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

// Fetch the 16 regionals by finding the first day of NCAA tournament play
export async function fetchRegionalsFromESPN(): Promise<Regional[] | null> {
  try {
    // Step 1: get tournament start date
    const seasonRes = await fetch(ESPN_SEASON_TYPE3);
    const seasonData = await seasonRes.json();
    const startDateStr: string | undefined = seasonData?.startDate;
    if (!startDateStr) return null;

    const startDate = new Date(startDateStr);

    // Step 2: walk forward day by day until we find scoreboard events
    let events: ScoreboardEvent[] = [];
    let attempts = 0;
    const current = new Date(startDate);
    while (events.length === 0 && attempts < 10) {
      const dateStr = dateToString(current);
      const sbRes = await fetch(`${ESPN_SCOREBOARD}?dates=${dateStr}`);
      const sbData = await sbRes.json();
      events = (sbData?.events ?? []) as ScoreboardEvent[];
      if (events.length === 0) {
        current.setDate(current.getDate() + 1);
        attempts++;
      }
    }
    if (events.length === 0) return null;

    // Step 3: group unique teams by venue → each venue = one regional
    const venueMap = new Map<string, { venueName: string; teams: Map<string, { name: string; espnId: string; seed: number }> }>();

    for (const event of events) {
      const comp = event.competitions?.[0];
      if (!comp) continue;
      const city = comp.venue?.address?.city ?? "Unknown";
      const venue = `${city} Regional`;
      if (!venueMap.has(venue)) venueMap.set(venue, { venueName: venue, teams: new Map() });
      const entry = venueMap.get(venue)!;
      for (const c of comp.competitors ?? []) {
        const teamName = c.team?.displayName ?? c.team?.name ?? "";
        const espnId = c.team?.id ?? "";
        const seed = c.curatedRank?.current ?? c.seed ?? 99;
        if (teamName && !entry.teams.has(teamName)) {
          entry.teams.set(teamName, { name: teamName, espnId, seed });
        }
      }
    }

    // Step 4: build Regional[] sorted by seed, 16 regionals
    const regionals: Regional[] = Array.from(venueMap.values())
      .slice(0, 16)
      .map((v, i) => {
        const sorted = Array.from(v.teams.values()).sort((a, b) => a.seed - b.seed);
        return {
          id: `reg${i}`,
          name: v.venueName,
          teams: sorted.map(t => t.name).slice(0, 4),
          winner: null,
        };
      });

    return regionals.length > 0 ? regionals : null;
  } catch (e) {
    console.error("fetchRegionalsFromESPN failed", e);
    return null;
  }
}

// ESPN team IDs extracted during the scoreboard fetch — keyed by team name
export async function fetchTeamIdsFromESPN(): Promise<Record<string, string>> {
  try {
    const seasonRes = await fetch(ESPN_SEASON_TYPE3);
    const seasonData = await seasonRes.json();
    const startDateStr: string | undefined = seasonData?.startDate;
    if (!startDateStr) return {};

    const current = new Date(startDateStr);
    let events: ScoreboardEvent[] = [];
    let attempts = 0;
    while (events.length === 0 && attempts < 10) {
      const dateStr = dateToString(current);
      const sbRes = await fetch(`${ESPN_SCOREBOARD}?dates=${dateStr}`);
      const sbData = await sbRes.json();
      events = (sbData?.events ?? []) as ScoreboardEvent[];
      if (events.length === 0) {
        current.setDate(current.getDate() + 1);
        attempts++;
      }
    }

    const ids: Record<string, string> = {};
    for (const event of events) {
      for (const c of event.competitions?.[0]?.competitors ?? []) {
        const name = c.team?.displayName ?? c.team?.name ?? "";
        const id = c.team?.id ?? "";
        if (name && id) ids[name] = id;
      }
    }
    return ids;
  } catch {
    return {};
  }
}

interface ScoreboardEvent {
  id?: string;
  date?: string;
  competitions?: Array<{
    date?: string;
    status?: { type?: { completed?: boolean } };
    venue?: { fullName?: string; address?: { city?: string } };
    competitors?: Array<{
      winner?: boolean;
      team?: { id?: string; displayName?: string; name?: string };
      seed?: number;
      curatedRank?: { current?: number };
    }>;
  }>;
}

export interface EventResult {
  completed: boolean;
  winnerEspnId: string | null;
  date: string | null;
  teams: { espnId: string; name: string; score: string; winner: boolean }[];
}

export async function fetchEventResult(eventId: string): Promise<EventResult | null> {
  try {
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/college-softball/summary?event=${eventId}`);
    const d = await r.json();
    const comp = d?.header?.competitions?.[0];
    if (!comp) return null;
    const completed: boolean = comp.status?.type?.completed ?? false;
    const date: string | null = comp.date ?? d?.header?.gameDate ?? null;
    const competitors: { id: string; winner?: boolean; score?: string; team?: { id: string; displayName: string } }[] =
      comp.competitors ?? [];
    const teams = competitors.map(c => ({
      espnId: c.team?.id ?? c.id ?? "",
      name: c.team?.displayName ?? "",
      score: c.score ?? "0",
      winner: c.winner ?? false,
    }));
    const winnerEspnId = teams.find(t => t.winner)?.espnId ?? null;
    return { completed, winnerEspnId, date, teams };
  } catch {
    return null;
  }
}

// Scan the scoreboard across regional days and return all event IDs grouped by regional.
// Key format: reg_<ri>_<espnEventId>  →  espnEventId
export async function fetchAllRegionalEventIds(
  regs: Regional[]
): Promise<Record<string, string>> {
  try {
    const seasonRes = await fetch(ESPN_SEASON_TYPE3);
    const seasonData = await seasonRes.json();
    const startDateStr: string | undefined = seasonData?.startDate;
    if (!startDateStr) return {};

    const startDate = new Date(startDateStr);
    const result: Record<string, string> = {};

    // Regional tournament spans ~4–5 days; scan 7 to be safe
    for (let d = 0; d <= 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const dateStr = dateToString(date);
      try {
        const res = await fetch(`${ESPN_SCOREBOARD}?dates=${dateStr}`);
        const data = await res.json();
        const events: ScoreboardEvent[] = data?.events ?? [];

        for (const event of events) {
          const eventId = event.id;
          if (!eventId) continue;
          const comp = event.competitions?.[0];
          const city = comp?.venue?.address?.city ?? "";
          if (!city) continue;

          const ri = regs.findIndex(r => r.name === `${city} Regional`);
          if (ri === -1) continue;

          result[`reg_${ri}_${eventId}`] = eventId;
        }
      } catch {
        // skip days that fail
      }
    }

    return result;
  } catch {
    return {};
  }
}

// Maps a game key + winner name onto the official results object (immutable — returns new object)
export function applyResultToOfficial(official: Official, gameKey: string, winnerName: string): Official {
  const o: Official = JSON.parse(JSON.stringify(official));

  const regMatch = gameKey.match(/^reg_(\d+)$/);
  if (regMatch) { o.regionals[parseInt(regMatch[1])] = winnerName; return o; }

  const srMatch = gameKey.match(/^sr_(\d+)$/);
  if (srMatch) { o.superregionals[parseInt(srMatch[1])] = winnerName; return o; }

  const wcwsMatch = gameKey.match(/^wcws_(\d+)_(.+)$/);
  if (wcwsMatch) {
    const bi = parseInt(wcwsMatch[1]);
    const gk = wcwsMatch[2] as keyof WCWSBracketPicks;
    if (!o.wcws[bi]) o.wcws[bi] = { w1: null, w2: null, w3: null, e1: null, e2: null, bf: null, ifg: null };
    o.wcws[bi][gk] = winnerName;
    return o;
  }

  const champMatch = gameKey.match(/^champ_(\d+)$/);
  if (champMatch) {
    const gn = parseInt(champMatch[1]);
    if (gn === 1) o.championship.game1 = winnerName;
    else if (gn === 2) o.championship.game2 = winnerName;
    else if (gn === 3) o.championship.game3 = winnerName;
    return o;
  }

  return o;
}

// Builds a human-readable label for a game key given current bracket context
export function gameKeyLabel(
  gameKey: string,
  regNames: string[],
  srLabels: string[],
  bracketTeams: (string | null)[][]
): string {
  const regMatch = gameKey.match(/^reg_(\d+)$/);
  if (regMatch) return `Regional: ${regNames[parseInt(regMatch[1])] ?? `R${parseInt(regMatch[1]) + 1}`}`;

  const srMatch = gameKey.match(/^sr_(\d+)$/);
  if (srMatch) return `Super Regional ${parseInt(srMatch[1]) + 1}: ${srLabels[parseInt(srMatch[1])] ?? ""}`;

  const wcwsMatch = gameKey.match(/^wcws_(\d+)_(.+)$/);
  if (wcwsMatch) {
    const bi = parseInt(wcwsMatch[1]);
    const gk = wcwsMatch[2];
    const t = bracketTeams[bi] ?? [];
    const labelMap: Record<string, string> = {
      w1: `B${bi + 1} W1: ${t[0] ?? "Seed 1"} vs ${t[3] ?? "Seed 4"}`,
      w2: `B${bi + 1} W2: ${t[1] ?? "Seed 2"} vs ${t[2] ?? "Seed 3"}`,
      w3: `B${bi + 1} W3 (Winners Finals)`,
      e1: `B${bi + 1} E1 (Elimination)`,
      e2: `B${bi + 1} E2 (Elimination)`,
      bf: `B${bi + 1} Bracket Final`,
      ifg: `B${bi + 1} If Necessary`,
    };
    return labelMap[gk] ?? gameKey;
  }

  const champMatch = gameKey.match(/^champ_(\d+)$/);
  if (champMatch) return `Championship Game ${champMatch[1]}`;

  return gameKey;
}

// Game keys for single-game events only (regionals/SRs are multi-game formats — handled manually)
export const ALL_GAME_KEYS: string[] = [
  ...[0, 1].flatMap(bi => ["w1", "w2", "w3", "e1", "e2", "bf", "ifg"].map(gk => `wcws_${bi}_${gk}`)),
  "champ_1", "champ_2", "champ_3",
];

export const ESPN_TEAM_SEARCH = (teamId: string) =>
  `${ESPN_BASE}/teams/${teamId}`;
