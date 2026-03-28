import type { Official, WCWSBracketPicks } from "../types";

const ESPN_BASE = "https://site.web.api.espn.com/apis/site/v2/sports/baseball/college-softball";

export interface EventResult {
  completed: boolean;
  winnerEspnId: string | null;
  teams: { espnId: string; name: string; score: string; winner: boolean }[];
}

export async function fetchEventResult(eventId: string): Promise<EventResult | null> {
  try {
    const r = await fetch(`${ESPN_BASE}/summary?event=${eventId}`);
    const d = await r.json();
    const comp = d?.header?.competitions?.[0];
    if (!comp) return null;
    const completed: boolean = comp.status?.type?.completed ?? false;
    const competitors: { id: string; winner?: boolean; score?: string; team?: { id: string; displayName: string } }[] =
      comp.competitors ?? [];
    const teams = competitors.map(c => ({
      espnId: c.team?.id ?? c.id ?? "",
      name: c.team?.displayName ?? "",
      score: c.score ?? "0",
      winner: c.winner ?? false,
    }));
    const winnerEspnId = teams.find(t => t.winner)?.espnId ?? null;
    return { completed, winnerEspnId, teams };
  } catch {
    return null;
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

// All possible game keys in order
export const ALL_GAME_KEYS: string[] = [
  ...Array.from({ length: 16 }, (_, i) => `reg_${i}`),
  ...Array.from({ length: 8 }, (_, i) => `sr_${i}`),
  ...[0, 1].flatMap(bi => ["w1", "w2", "w3", "e1", "e2", "bf", "ifg"].map(gk => `wcws_${bi}_${gk}`)),
  "champ_1", "champ_2", "champ_3",
];

export const ESPN_TEAM_SEARCH = (teamId: string) =>
  `${ESPN_BASE}/teams/${teamId}`;
