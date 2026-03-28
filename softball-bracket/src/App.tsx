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

export default function App() {
  const [tab, setTab] = useState("regs");

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

        {tab === "regs" && <RegSupers  regs={tournament.regs}
          srData={tournament.srData}
          wcwsBrackets={tournament.wcwsBrackets}
          champA={tournament.champA}
          champB={tournament.champB}
          picks={tournament.picks}
          official={tournament.official}
          locked={tournament.locked}
          pick={tournament.pick} />}
        {tab === "wcws" && <Finals brackets={tournament.wcwsBrackets} champA={tournament.champA} champB={tournament.champB} picks={tournament.picks} official={tournament.official} locked={tournament.locked} pick={tournament.pick} />}
        {tab === "lb"   && <Leaderboard allPicks={tournament.allPicks} official={tournament.official} me={user.email} />}
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
          />
        )}
      </div>
    </div>
  );
}