import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTournament } from "./hooks/useTournament";
import { scoreAll } from "./lib/scoring";
import Header from "./components/layout/Header";
import LoginScreen from "./components/auth/LoginScreen";
import RegSupers from "./components/wcws/RegSupers";
import Finals from "./components/finals/FinalsTab";
import Leaderboard from "./components/leaderboard/Leaderboard";
import Scores from "./components/scores/Scores";
import AdminPanel from "./components/admin/AdminPanel";
import LockInModal from "./components/common/LockInModal";
import type { Picks } from "./types";

function allPicksMade(picks: Picks | null): boolean {
  if (!picks) return false;
  if (picks.regionals.filter(Boolean).length < 16) return false;
  if (picks.superregionals.filter(Boolean).length < 8) return false;
  for (let bi = 0; bi < 2; bi++) {
    const b = picks.wcws?.[bi];
    if (!b || !b.w1 || !b.w2 || !b.w3 || !b.e1 || !b.e2 || !b.bf) return false;
    // ifg required when the elim side (e2 winner) won the bracket final
    if (b.e2 && b.bf === b.e2 && !b.ifg) return false;
  }
  const c = picks.championship;
  if (!c?.game1 || !c?.game2) return false;
  // game3 required only if game1 and game2 have different winners (series is 1-1)
  if (c.game1 !== c.game2 && !c.game3) return false;
  return true;
}

export default function App() {
  const [tab, setTab] = useState("regs");
  const [showLockModal, setShowLockModal] = useState(false);

  const tournament = useTournament();
  const { user, signIn, signOut } = useAuth((email) => tournament.loadData(email));

  useEffect(() => {
    if (user) tournament.setUserRef(user.email, user.name);
  }, [user]);

  const isAdmin = user ? tournament.admins.includes(user.email) : false;
  const myScore = scoreAll(tournament.picks, tournament.official);

  if (!user) {
    return (
      <LoginScreen
        onSignIn={signIn}
      />
    );
  }

  return (
    <div className="app">
      <Header
        tab={tab} setTab={setTab}
        user={user} onSignOut={signOut}
        isAdmin={isAdmin}
        score={myScore}
        hasOfficial={!!tournament.official}
      />
      <div className="pg">
        {tournament.locked && <div className="bnr bnr-r">🔒 Picks are locked — tournament is underway!</div>}
        {tournament.saveBanner && <div className="bnr bnr-g">✓ Picks saved</div>}
        {!tournament.locked && tournament.playerLocked && (
          <div className="bnr bnr-g">🔒 Your picks are locked in!</div>
        )}
        {!tournament.locked && !tournament.playerLocked && allPicksMade(tournament.picks) && (
          <div className="bnr bnr-b" style={{ justifyContent: "space-between" }}>
            <span>Ready to finalize your bracket? Lock in your picks — you won't be able to make changes after.</span>
            <button className="btn btn-g btn-s" style={{ marginLeft: 12, flexShrink: 0 }} onClick={() => setShowLockModal(true)}>
              Lock In Picks
            </button>
          </div>
        )}

        {tab === "regs" && <RegSupers  regs={tournament.regs}
          srData={tournament.srData}
          wcwsBrackets={tournament.wcwsBrackets}
          champA={tournament.champA}
          champB={tournament.champB}
          picks={tournament.picks}
          official={tournament.official}
          locked={tournament.locked || tournament.playerLocked}
          pick={tournament.pick} />}
        {tab === "wcws" && <Finals brackets={tournament.wcwsBrackets} champA={tournament.champA} champB={tournament.champB} picks={tournament.picks} official={tournament.official} locked={tournament.locked || tournament.playerLocked} pick={tournament.pick} />}
        {tab === "lb"   && <Leaderboard allPicks={tournament.allPicks} official={tournament.official} regs={tournament.regs} locked={tournament.locked} playerLocked={tournament.playerLocked} me={user.email} />}
        {tab === "scores" && <Scores games={tournament.espn} onRefresh={tournament.fetchESPN} />}
        {tab === "admin" && isAdmin && (
          <AdminPanel
            regs={tournament.regs}
            srData={tournament.srData}
            wcwsBrackets={tournament.wcwsBrackets}
            champA={tournament.champA}
            champB={tournament.champB}
            official={tournament.official}
            locked={tournament.locked}
            admins={tournament.admins}
            user={user}
            onSaveRegs={tournament.saveRegs}
            onSaveOfficial={tournament.saveOfficial}
            onToggleLock={tournament.toggleLock}
            onAddAdmin={tournament.addAdmin}
            onRemoveAdmin={tournament.removeAdmin}
            teamIds={tournament.teamIds}
            eventIds={tournament.eventIds}
            onSaveTeamId={tournament.saveTeamId}
            onSaveEventId={tournament.saveEventId}
            onAutoFetch={tournament.autoFetchResults}
          />
        )}
      </div>

      {showLockModal && (
        <LockInModal
          onConfirm={() => { tournament.lockInPicks(); setShowLockModal(false); }}
          onCancel={() => setShowLockModal(false)}
        />
      )}
    </div>
  );
}
