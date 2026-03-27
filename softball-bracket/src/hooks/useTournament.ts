import { useState, useCallback } from "react";
import type { Picks, Official, Regional, SRData, WCWSBracket, PlayerEntry } from "../types";
import { SR_PAIRS, SR_LABELS } from "../constants";
import {
  fetchRegionals, saveRegional,
  fetchOfficial, saveOfficial as dbSaveOfficial,
  fetchPicks, savePicks as dbSavePicks,
  fetchAllPicks,
  fetchAdmins, addAdmin as dbAddAdmin, removeAdmin as dbRemoveAdmin,
} from "../lib/supabase";

interface ESPNEvent {
  id: string;
  name: string;
  status?: { type?: { shortDetail?: string } };
  competitions?: Array<{ competitors?: Array<{ score: string }> }>;
}

function emptyPicks(): Picks {
  return {
    regionals: Array(16).fill(null),
    superregionals: Array(8).fill(null),
    wcws: [
      { wWinner: null, lWinner: null, bracketChamp: null },
      { wWinner: null, lWinner: null, bracketChamp: null },
    ],
    finals: { game1: null, game2: null, game3: null, champion: null },
  };
}

export function useTournament() {
  const [regs, setRegs] = useState<Regional[]>([]);
  const [picks, setPicks] = useState<Picks | null>(null);
  const [official, setOfficial] = useState<Official | null>(null);
  const [allPicks, setAllPicks] = useState<Record<string, PlayerEntry>>({});
  const [admins, setAdmins] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);
  const [espn, setEspn] = useState<ESPNEvent[]>([]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const srData: SRData[] = SR_PAIRS.map(([a, b], i) => {
    const regAName = regs[a]?.name ?? `Regional ${a + 1}`;
    const regBName = regs[b]?.name ?? `Regional ${b + 1}`;
    const teamA = official?.regionals?.[a] || picks?.regionals?.[a] || null;
    const teamB = official?.regionals?.[b] || picks?.regionals?.[b] || null;
    return {
      id: `sr${i}`,
      label: `Super Regional ${i + 1}`,
      matchupLabel: SR_LABELS[i],
      regAIdx: a,
      regBIdx: b,
      regAName,
      regBName,
      teamA: teamA ?? `TBD (${regAName})`,
      teamB: teamB ?? `TBD (${regBName})`,
      isASet: !!teamA,
      isBSet: !!teamB,
    };
  });

  const wcwsBrackets: WCWSBracket[] = [0, 1].map(bi => {
    const teams = Array.from({ length: 4 }, (_, i) =>
      official?.superregionals?.[bi * 4 + i] ?? `SR${bi * 4 + i + 1} Winner`
    ) as (string | null)[];
    return { id: `wb${bi}`, label: `Bracket ${bi + 1}`, teams };
  });

  const finA = official?.wcws?.[0]?.bracketChamp
    ?? picks?.wcws?.[0]?.bracketChamp
    ?? "Bracket 1 Champion";
  const finB = official?.wcws?.[1]?.bracketChamp
    ?? picks?.wcws?.[1]?.bracketChamp
    ?? "Bracket 2 Champion";

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async (email: string) => {
    try {
      const [regsData, off, pd, ap, adminList] = await Promise.all([
        fetchRegionals(),
        fetchOfficial(),
        fetchPicks(email),
        fetchAllPicks(),
        fetchAdmins(),
      ]);
      setRegs(regsData);
      if (off) setOfficial(off);
      setPicks(pd ?? emptyPicks());
      setAllPicks(ap);
      setAdmins(adminList);
    } catch (e) {
      console.error("Failed to load data", e);
      setPicks(emptyPicks());
    }
  }, []);

  // ── Picks ───────────────────────────────────────────────────────────────────

  const savePicksToDb = useCallback(async (np: Picks, email: string, name: string) => {
    try {
      await dbSavePicks(email, name, np);
      setAllPicks(prev => ({ ...prev, [email]: { email, name, picks: np } }));
      setSaveBanner(true);
      setTimeout(() => setSaveBanner(false), 2200);
    } catch (e) {
      console.error("Failed to save picks", e);
    }
  }, []);

  // userEmail/userName stored in a ref so pick() doesn't need them as deps
  const userRef = { email: "", name: "" };
  const setUserRef = (email: string, name: string) => {
    userRef.email = email;
    userRef.name = name;
  };

  const pick = useCallback((path: string, val: string) => {
    if (locked) return;
    setPicks(prev => {
      const np: Picks = JSON.parse(JSON.stringify(prev ?? emptyPicks()));
      const parts = path.split(".");
      let o: Record<string, unknown> = np as unknown as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        o = o[parts[i]] as Record<string, unknown>;
      }
      const lastKey = parts[parts.length - 1];
      if (Array.isArray(o)) {
        o[parseInt(lastKey)] = val;
      } else {
        o[lastKey] = val;
      }
      savePicksToDb(np, userRef.email, userRef.name);
      return np;
    });
  }, [locked, savePicksToDb]);

  // ── Admin actions ───────────────────────────────────────────────────────────

  const saveRegs = useCallback(async (newRegs: Regional[]) => {
    setRegs(newRegs);
    await Promise.all(newRegs.map((r, ri) => saveRegional(ri, r.name, r.teams)));
  }, []);

  const saveOfficial = useCallback(async (off: Official) => {
    setOfficial(off);
    await dbSaveOfficial(off);
  }, []);

  const toggleLock = useCallback(async () => {
    setLocked(prev => !prev);
    // persist to DB if you have a settings table, otherwise just local
  }, []);

  const addAdmin = useCallback(async (email: string) => {
    await dbAddAdmin(email);
    setAdmins(prev => [...prev, email]);
  }, []);

  const removeAdmin = useCallback(async (email: string) => {
    await dbRemoveAdmin(email);
    setAdmins(prev => prev.filter(a => a !== email));
  }, []);

  // ── ESPN ────────────────────────────────────────────────────────────────────

  const fetchESPN = useCallback(async () => {
    try {
      const r = await fetch("https://site.api.espn.com/apis/site/v2/sports/baseball/college-softball/scoreboard");
      const d = await r.json() as { events?: ESPNEvent[] };
      setEspn(d.events ?? []);
    } catch (e) {
      setEspn([]);
    }
  }, []);

  return {
    // state
    regs, picks, official, allPicks, admins, locked, saveBanner, espn,
    // derived
    srData, wcwsBrackets, finA, finB,
    // actions
    loadData, setUserRef, pick,
    saveRegs, saveOfficial, toggleLock,
    addAdmin, removeAdmin, fetchESPN,
  };
}