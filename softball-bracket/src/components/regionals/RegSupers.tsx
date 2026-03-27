import { useState } from "react";
import type { Regional, SRData, Picks, Official } from "../../types";
import { PTS } from "../../constants";
import RegionalCard from "./RegionalCard";
import SuperRegionalCard from "./SuperRegionalCard";

interface RegSupersProps {
  regs: Regional[];
  srData: SRData[];
  picks: Picks | null;
  official: Official | null;
  locked: boolean;
  pick: (path: string, val: string) => void;
}

export default function RegSupers({ regs, srData, picks, official, locked, pick }: RegSupersProps) {
  const [view, setView] = useState<"reg" | "sr">("reg");
  const regPickCount = (picks?.regionals || []).filter(Boolean).length;
  const srPickCount = (picks?.superregionals || []).filter(Boolean).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 7 }}>
        <div className="st" style={{ marginBottom: 0 }}>
          {view === "reg" ? "Regionals" : "Super Regionals"}
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
              {regs.slice(0, 8).map((r, i) => (
                <RegionalCard key={r.id} reg={r} ri={i} picks={picks} official={official} locked={locked} pick={pick} />
              ))}
            </div>
            <div className="reg-div">
              <div className="div-line" />
              <div className="div-lbl">WCWS<br />2025</div>
              <div className="div-line" />
            </div>
            <div className="reg-side r">
              {regs.slice(8, 16).map((r, i) => (
                <RegionalCard key={r.id} reg={r} ri={i + 8} right picks={picks} official={official} locked={locked} pick={pick} />
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
        </>
      )}
    </>
  );
}