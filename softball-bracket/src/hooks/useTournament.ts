import { useState, useCallback, useRef } from "react";
import type { Picks, Official, Regional, SRData, WCWSBracket, PlayerEntry, WCWSBracketPicks } from "../types";
import { SR_PAIRS, SR_LABELS, BRACKET_SR_INDICES } from "../constants";
import { getBracketChampion } from "../lib/wcwsLogic";
import {
  fetchRegionals, saveRegional,
  fetchOfficial, saveOfficial as dbSaveOfficial,
  fetchPicks, savePicks as dbSavePicks,
  fetchAllPicks,
  fetchAdmins, addAdmin as dbAddAdmin, removeAdmin as dbRemoveAdmin,
  fetchLocked, saveLocked 
} from "../lib/supabase";


interface ESPNEvent {
  id: string;
  name: string;
  status?: { type?: { shortDetail?: string } };
  competitions?: Array<{ competitors?: Array<{ score: string }> }>;
}

function emptyPicks(): Picks {
  const emptyBracket = (): WCWSBracketPicks => ({
    w1: null, w2: null, w3: null,
    e1: null, e2: null,
    bf: null, ifg: null,
  });
  return {
    regionals: Array(16).fill(null),
    superregionals: Array(8).fill(null),
    wcws: [emptyBracket(), emptyBracket()],
    championship: { game1: null, game2: null, game3: null, champion: null },
  };
}

// Migrate picks from old DB format (finals → championship, wWinner/lWinner/bracketChamp → 7-game)
function normalizePicks(raw: Record<string, unknown>): Picks {
  const base = emptyPicks();
  return {
    regionals: (raw.regionals as Picks["regionals"]) ?? base.regionals,
    superregionals: (raw.superregionals as Picks["superregionals"]) ?? base.superregionals,
    wcws: Array.isArray(raw.wcws)
      ? raw.wcws.map((b: Record<string, unknown>, i: number) =>
          ("w1" in b) ? b as unknown as WCWSBracketPicks : base.wcws[i]
        )
      : base.wcws,
    championship: (raw.championship as Picks["championship"])
      ?? (raw.finals as Picks["championship"])
      ?? base.championship,
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

  const wcwsBrackets: WCWSBracket[] = BRACKET_SR_INDICES.map((srIndices, bi) => {
    // srIndices gives the SR_PAIRS positions for this bracket, in seed order
    const teams = srIndices.map(srIdx =>
      official?.superregionals?.[srIdx] ??
      picks?.superregionals?.[srIdx] ??
      null
    ) as (string | null)[];
    return { id: `wb${bi}`, label: `Bracket ${bi + 1}`, teams };
  });

  const champA =
    getBracketChampion(official?.wcws?.[0]) ??
    getBracketChampion(picks?.wcws?.[0]) ??
    "Bracket 1 Champion";

  const champB =
    getBracketChampion(official?.wcws?.[1]) ??
    getBracketChampion(picks?.wcws?.[1]) ??
    "Bracket 2 Champion";

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async (email: string) => {
    try {
      const [regsData, off, pd, ap, adminList, isLocked] = await Promise.all([
        fetchRegionals(),
        fetchOfficial(),
        fetchPicks(email),
        fetchAllPicks(),
        fetchAdmins(),
        fetchLocked(),
      ]);
      setRegs(regsData);
      if (off) setOfficial(off);
      setPicks(pd ? normalizePicks(pd as unknown as Record<string, unknown>) : emptyPicks());
      setAllPicks(ap);
      setAdmins(adminList);
      setLocked(isLocked);
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
  const userRef = useRef({ email: "", name: "" });
  const setUserRef = useCallback((email: string, name: string) => {
    userRef.current.email = email;
    userRef.current.name = name;
  }, []);

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
      // Auto-clear ifg when bf is picked to the winners side (makes IF unnecessary)
      const bfMatch = path.match(/^wcws\.(\d+)\.bf$/);
      if (bfMatch) {
        const bi = parseInt(bfMatch[1]);
        if (val !== np.wcws[bi]?.e2) {
          np.wcws[bi].ifg = null;
        }
      }
      savePicksToDb(np, userRef.current.email, userRef.current.name);
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
    setLocked(prev => {
      const next = !prev;
      saveLocked(next).catch(console.error);
      return next;
    });
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
    srData, wcwsBrackets, champA, champB,
    // actions
    loadData, setUserRef, pick,
    saveRegs, saveOfficial, toggleLock,
    addAdmin, removeAdmin, fetchESPN,
  };
}