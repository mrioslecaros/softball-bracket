import type { Official, Picks, Regional, PlayerEntry, RegionalRow, AdminRow } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const sb = (path: string) => `${SUPABASE_URL}/rest/v1/${path}`;
const sbHeaders = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

export async function fetchRegionals(): Promise<Regional[]> { 
  const r = await fetch(`${sb("regionals")}?order=regional_index`, { headers: sbHeaders });
  const rows: RegionalRow[] = await r.json();
  return rows.map(row => ({
    id: `reg${row.regional_index}`,
    name: row.name,
    teams: [row.seed_1, row.seed_2, row.seed_3, row.seed_4],
    winner: null,
  }));
 }
export async function saveRegional(ri: number, name: string, teams: string[]): Promise<void> { 
  await fetch(`${sb("regionals")}?regional_index=eq.${ri}`, {
    method: "PATCH",
    headers: sbHeaders,
    body: JSON.stringify({ name, seed_1: teams[0], seed_2: teams[1], seed_3: teams[2], seed_4: teams[3] }),
  }); 
}
export async function fetchOfficial(): Promise<Official | null> {
  const r = await fetch(`${sb("official_results")}?order=id.desc&limit=1`, { headers: sbHeaders });
  const rows = await r.json();
  return rows[0]?.data || null;
}
export async function saveOfficial(data: Official): Promise<void> { 
  await fetch(`${sb("official_results")}?id=eq.1`, {
    method: "PATCH", headers: sbHeaders,
    body: JSON.stringify({ data }),
  });
  // If no row exists yet, insert
  const check = await fetch(`${sb("official_results")}`, { headers: sbHeaders });
  if ((await check.json()).length === 0) {
    await fetch(sb("official_results"), {
      method: "POST", headers: sbHeaders,
      body: JSON.stringify({ id: 1, data }),
    });
  }
}
export async function fetchPicks(email: string): Promise<Picks | null> {
  const r = await fetch(`${sb("picks")}?user_email=eq.${encodeURIComponent(email)}`, { headers: sbHeaders });
  const rows = await r.json();
  return rows[0]?.data || null;
}

export async function savePicks(email: string, name: string, data: Picks): Promise<void> {
  // First try to update existing row
  const updateRes = await fetch(
    `${sb("picks")}?user_email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: sbHeaders,
      body: JSON.stringify({ user_name: name, data, updated_at: new Date().toISOString() }),
    }
  );

  // If no row existed (0 rows updated), insert instead
  const updated = await updateRes.json() as unknown[];
  if (!Array.isArray(updated) || updated.length === 0) {
    await fetch(sb("picks"), {
      method: "POST",
      headers: sbHeaders,
      body: JSON.stringify({ user_email: email, user_name: name, data }),
    });
  }
}

export async function fetchAllPicks(): Promise<Record<string, PlayerEntry>> { 
  const r = await fetch(`${sb("picks")}?select=user_email,user_name,data`, { headers: sbHeaders });
  const rows = await r.json();
  return Object.fromEntries(rows.filter((row: any) => row.data).map((row: any) => [row.user_email, { email: row.user_email, name: row.user_name, picks: row.data }]));
}

export async function fetchAdmins(): Promise<string[]> { 
  const r = await fetch(`${sb("admins")}?select=email&order=added_at`, { headers: sbHeaders });
  const rows: AdminRow[] = await r.json();
  return rows.map(r => r.email);
}
export async function addAdmin(email: string): Promise<void> { 
  await fetch(sb("admins"), {
    method: "POST",
    headers: sbHeaders,
    body: JSON.stringify({ email: email.toLowerCase().trim() }),
  });
 }
export async function removeAdmin(email: string): Promise<void> { 
  await fetch(`${sb("admins")}?email=eq.${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: sbHeaders,
  });
 }

export async function fetchTeamIds(): Promise<Record<string, string>> {
  const r = await fetch(`${sb("teams")}?select=name,espn_id`, { headers: sbHeaders });
  const rows: { name: string; espn_id: string }[] = await r.json();
  return Object.fromEntries(rows.filter(r => r.espn_id).map(r => [r.name, r.espn_id]));
}

export async function saveTeamId(name: string, espnId: string): Promise<void> {
  // Upsert: update if exists, insert if not
  const updateRes = await fetch(`${sb("teams")}?name=eq.${encodeURIComponent(name)}`, {
    method: "PATCH", headers: sbHeaders,
    body: JSON.stringify({ espn_id: espnId }),
  });
  const updated = await updateRes.json() as unknown[];
  if (!Array.isArray(updated) || updated.length === 0) {
    await fetch(sb("teams"), {
      method: "POST", headers: sbHeaders,
      body: JSON.stringify({ name, espn_id: espnId }),
    });
  }
}

export async function fetchEventIds(): Promise<Record<string, string>> {
  const r = await fetch(`${sb("events")}?select=game_key,espn_event_id`, { headers: sbHeaders });
  const rows: { game_key: string; espn_event_id: string }[] = await r.json();
  return Object.fromEntries(rows.filter(r => r.espn_event_id).map(r => [r.game_key, r.espn_event_id]));
}

export async function saveEventId(gameKey: string, espnEventId: string): Promise<void> {
  const updateRes = await fetch(`${sb("events")}?game_key=eq.${encodeURIComponent(gameKey)}`, {
    method: "PATCH", headers: sbHeaders,
    body: JSON.stringify({ espn_event_id: espnEventId }),
  });
  const updated = await updateRes.json() as unknown[];
  if (!Array.isArray(updated) || updated.length === 0) {
    await fetch(sb("events"), {
      method: "POST", headers: sbHeaders,
      body: JSON.stringify({ game_key: gameKey, espn_event_id: espnEventId }),
    });
  }
}

export async function fetchLocked(): Promise<boolean> {
  const r = await fetch(`${sb("settings")}?key=eq.locked`, { headers: sbHeaders });
  const rows = await r.json() as { value: boolean }[];
  return rows[0]?.value ?? false;
}

export async function saveLocked(val: boolean): Promise<void> {
  await fetch(`${sb("settings")}?key=eq.locked`, {
    method: "PATCH",
    headers: sbHeaders,
    body: JSON.stringify({ value: val }),
  });
}