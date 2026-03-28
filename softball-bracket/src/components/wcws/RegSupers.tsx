import { useState } from "react";
import type { Regional, SRData, Picks, Official, WCWSBracket } from "../../types";
import { PTS } from "../../constants";
import { getW3Loser } from "../../lib/wcwsLogic";
import RegionalCard from "./RegionalCard";
import SuperRegionalCard from "./SuperRegionalCard";
import FinalsBracketCard from "./FinalsBracketCard";
import FinalsCard from "./ChampionshipCard";

interface RegSupersProps {
  regs: Regional[];
  srData: SRData[];
  wcwsBrackets: WCWSBracket[];
  champA: string;
  champB: string;
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function RegSupers({ regs, srData, wcwsBrackets, champA, champB, picks, official, locked, pick }: RegSupersProps) {
  const [view, setView] = useState<"reg" | "sr" | "wcws">("reg");
  const w3Losers = [0, 1].map(bi => {
    const bp = picks?.wcws?.[bi] ?? {};
    const bo = official?.wcws?.[bi] ?? {};
    const merged = { ...bp, ...Object.fromEntries(Object.entries(bo).filter(([, v]) => v != null)) };
    return getW3Loser(merged);
  });
  const regPickCount = (picks?.regionals || []).filter(Boolean).length;
  const srPickCount = (picks?.superregionals || []).filter(Boolean).length;
  const wcwsPickCount =
  (picks?.wcws?.[0] ? Object.values(picks.wcws[0]).filter(Boolean).length : 0) +
  (picks?.wcws?.[1] ? Object.values(picks.wcws[1]).filter(Boolean).length : 0);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 7 }}>
        <div className="st" style={{ marginBottom: 0 }}>
          {view === "reg" ? "Regionals" : view === "sr" ? "Super Regionals" : "Championship Series"}
          <span className="pill p-gold">
            {view === "reg" ? `${regPickCount}/16 picked` : `${srPickCount}/8 picked`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          <button className={`btn btn-s${view === "reg" ? " btn-g" : ""}`} onClick={() => setView("reg")}>
            Regionals {regPickCount > 0 && <span className="pill p-grn" style={{ marginLeft: 3 }}>{regPickCount}</span>}
          </button>
          <button className={`btn btn-s${view === "sr" ? " btn-g" : ""}`} onClick={() => setView("sr")}>
            Super Regionals {srPickCount > 0 && <span className="pill p-grn" style={{ marginLeft: 3 }}>{srPickCount}</span>}
          </button>
          <button className={`btn btn-s${view === "wcws" ? " btn-g" : ""}`} onClick={() => setView("wcws")}>
            WCWS {wcwsPickCount > 0 && <span className="pill p-grn" style={{ marginLeft: 3 }}>{wcwsPickCount}</span>}
          </button>
        </div>
      </div>

      {view === "reg" && (
        <>
          <div className="bnr bnr-b">
            Pick the winner of each regional. Seeds 1–8 on the left, 9–16 on the right — same layout as the NCAA bracket.
            Your picks automatically populate the Super Regionals tab. +{PTS.regional} pt per correct pick.
          </div>
          <div className="reg-outer">
            <div className="reg-side">
              {[0,15,8,7,4,11,12,3].map(ri => regs[ri] && (
                <RegionalCard key={ri} reg={regs[ri]} ri={ri} picks={picks} official={official} locked={locked} pick={pick} />
              ))}
            </div>
            <div className="reg-div">
              <div className="div-line" />
              <div className="div-lbl">WCWS<br />2025</div>
              <div className="div-line" />
            </div>
            <div className="reg-side r">
              {[2,13,10,5,6,9,14,1].map(ri => regs[ri] && (
                <RegionalCard key={ri} reg={regs[ri]} ri={ri} right picks={picks} official={official} locked={locked} pick={pick} />
              ))}
            </div>
          </div>
          {regPickCount === 16 && (
            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <button className="btn btn-g" onClick={() => setView("sr")}>
                All regionals picked — go pick Super Regionals →
              </button>
            </div>
          )}
        </>
      )}

      {view === "sr" && (
        <>
          <div className="bnr bnr-b">
            Pick the winner of each Super Regional series (best of 3). Teams are filled from your regional picks.
            {regPickCount < 16 && <strong> ({16 - regPickCount} regional picks still needed)</strong>}
            {" "}+{PTS.superregional} pts per correct pick.
          </div>
          <div className="sr-grid">
            {srData.map((sr, i) => (
              <SuperRegionalCard key={sr.id} sr={sr} si={i} picks={picks} official={official} locked={locked} pick={pick} />
            ))}
          </div>
          {regPickCount < 16 && (
            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <button className="btn btn-s" onClick={() => setView("reg")}>
                ← Finish picking all 16 regionals first
              </button>
            </div>
          )}
          {srPickCount === 8 && (
            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <button className="btn btn-g" onClick={() => setView("wcws")}>
                All Super Regionals picked — go pick WCWS →
              </button>
            </div>
          )}
        </>
      )}

      {view === "wcws" && (
        <>
          <div className="bnr bnr-b">
            Pick the winners of each WCWS bracket, then the Finals.
            Teams are filled from your Super Regional picks.
            {srPickCount < 8 && <strong> ({8 - srPickCount} Super Regional picks still needed)</strong>}
          </div>
          <div className="wcws-grid">
            {wcwsBrackets.map((b, bi) => (
              <FinalsBracketCard
                key={b.id} bi={bi} teams={b.teams}
                crossW3Loser={w3Losers[1 - bi]}
                picks={picks} official={official}
                locked={locked} pick={pick}
              />
            ))}
          </div>
          <FinalsCard
            champA={champA} champB={champB}
            picks={picks} official={official}
            locked={locked} pick={pick}
          />
          {srPickCount < 8 && (
            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <button className="btn btn-s" onClick={() => setView("sr")}>
                ← Finish picking all Super Regionals first
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}