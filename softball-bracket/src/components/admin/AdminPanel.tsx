import { useState } from "react";
import type { Regional, SRData, WCWSBracket, Official, User } from "../../types";
import TeamsEditor from "./TeamsEditor";
import ResultsEditor from "./ResultsEditor";
import AdminManager from "./AdminManager";
import Settings from "./Settings";
interface AdminPanelProps {
  regs: Regional[];
  srData: SRData[];
  wcwsBrackets: WCWSBracket[];
  champA: string;
  champB: string;
  official: Official | null;
  locked: boolean;
  admins: string[];
  user: User;
  onSaveRegs: (regs: Regional[]) => Promise<void>;
  onSaveOfficial: (off: Official) => Promise<void>;
  onToggleLock: () => Promise<void>;
  onAddAdmin: (email: string) => Promise<void>;
  onRemoveAdmin: (email: string) => Promise<void>;
  onAutoFetch: (official: Official | null) => Promise<boolean>;
  onImportRegionalEventIds: () => Promise<number>;
  onImportSuperRegionalEventIds: () => Promise<number>;
  onImportChampionshipEventIds: () => Promise<number>;
}

type AdminTab = "teams" | "results" | "admins" | "settings";

export default function AdminPanel({
  regs, srData, wcwsBrackets, champA, champB, official, locked,
  admins, user,
  onSaveRegs, onSaveOfficial, onToggleLock,
  onAddAdmin, onRemoveAdmin, onAutoFetch,
  onImportRegionalEventIds, onImportSuperRegionalEventIds, onImportChampionshipEventIds,
}: AdminPanelProps) {
  const [at, setAt] = useState<AdminTab>("teams");

  return (
    <>
      <div className="st">Admin Panel <span className="pill p-gold">Admin Only</span></div>
      <div className="atabs">
        {(["teams", "results", "admins", "settings"] as AdminTab[]).map(t => (
          <button key={t} className={`atb${at === t ? " on" : ""}`} onClick={() => setAt(t)}>{t}</button>
        ))}
      </div>
      {at === "teams"    && <TeamsEditor regs={regs} onSave={onSaveRegs} onSaveTeamId={() => Promise.resolve()} />}
      {at === "results"  && <ResultsEditor regs={regs} srData={srData} wcwsBrackets={wcwsBrackets} champA={champA} champB={champB} official={official} onSave={onSaveOfficial} onAutoFetch={onAutoFetch} onImportRegionalEventIds={onImportRegionalEventIds} onImportSuperRegionalEventIds={onImportSuperRegionalEventIds} onImportChampionshipEventIds={onImportChampionshipEventIds} />}
      {at === "admins"   && <AdminManager admins={admins} currentUserEmail={user.email} onAdd={onAddAdmin} onRemove={onRemoveAdmin} />}
      {at === "settings" && <Settings locked={locked} onToggleLock={onToggleLock} />}
    </>
  );
}