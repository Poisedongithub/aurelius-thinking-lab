import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { philosophers } from "@/lib/philosophers";
import { XP_LEVELS } from "@/lib/gamification";
import { supabase } from "@/integrations/supabase/client";
import { useGamification } from "@/hooks/useGamification";
import { TabBar } from "@/components/TabBar";
import { ArrowLeft, Zap, Lock } from "lucide-react";

const getMasteryTier = (points: number) => {
  if (points >= 500) return { label: "Master", color: "text-foreground" };
  if (points >= 250) return { label: "Gold", color: "text-foreground/80" };
  if (points >= 100) return { label: "Silver", color: "text-foreground/60" };
  if (points >= 25) return { label: "Bronze", color: "text-foreground/45" };
  return { label: "Unranked", color: "text-foreground/30" };
};

const ChooseOpponent = () => {
  const navigate = useNavigate();
  const { levelInfo, loading: gamLoading } = useGamification();
  const [philosopherScores, setPhilosopherScores] = useState<Record<string, { points: number; spars: number }>>({});

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: sessions } = await supabase.from("sparring_sessions").select("opponent, score").eq("user_id", user.id);
      if (sessions) {
        const scores: Record<string, { points: number; spars: number }> = {};
        sessions.forEach((s) => {
          if (!scores[s.opponent]) scores[s.opponent] = { points: 0, spars: 0 };
          scores[s.opponent].points += s.score || 0;
          scores[s.opponent].spars += 1;
        });
        setPhilosopherScores(scores);
      }
    };
    load();
  }, []);

  const userLevel = gamLoading ? 1 : levelInfo.level;

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background">
      <button onClick={() => navigate("/home")} className="p-7 pb-0 text-foreground/50"><ArrowLeft className="w-5 h-5" /></button>
      <div className="px-7 pt-3 pb-6">
        <h2 className="font-serif text-[28px] text-foreground">Choose Your Opponent</h2>
        <p className="text-xs text-foreground/35 font-light">{philosophers.filter((p) => userLevel >= p.unlockLevel).length} of {philosophers.length} unlocked</p>
      </div>
      <div className="flex-1 px-7 flex flex-col gap-4 overflow-y-auto pb-4">
        {philosophers.map((p, i) => {
          const isUnlocked = userLevel >= p.unlockLevel;
          const stats = philosopherScores[p.id];
          const tier = getMasteryTier(stats?.points || 0);
          const levelData = XP_LEVELS.find((l) => l.level === p.unlockLevel);
          return (
            <motion.button key={p.id} onClick={() => isUnlocked && navigate(`/arena/topic/${p.id}`)}
              className={`glass-card rounded-2xl p-5 flex gap-4 items-center text-left transition-all ${isUnlocked ? "hover:bg-card/60 hover:border-border cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: isUnlocked ? 1 : 0.4, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}>
              <div className={`w-[60px] h-[60px] rounded-full border border-border/60 shrink-0 flex items-center justify-center bg-gradient-to-br from-muted to-background font-serif text-2xl ${isUnlocked ? "text-foreground" : "text-foreground/30"}`}>
                {isUnlocked ? p.initials : <Lock className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-foreground">{p.name}</h3>
                  {isUnlocked && stats && stats.points > 0 && (
                    <div className="flex items-center gap-1 shrink-0"><Zap className="w-3 h-3 text-foreground/50" /><span className="font-serif text-sm text-foreground/60">{stats.points}</span></div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground/40 tracking-[0.12em] uppercase">{p.school}</span>
                  {isUnlocked && stats && stats.points > 0 && <span className={`text-[9px] tracking-[0.1em] uppercase ${tier.color}`}>· {tier.label}</span>}
                  {!isUnlocked && levelData && <span className="text-[9px] tracking-[0.1em] uppercase text-foreground/30">· Lv.{p.unlockLevel} {levelData.title}</span>}
                </div>
                <p className="text-xs text-foreground/30 font-light leading-snug mt-1">{p.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
      <TabBar />
    </div>
  );
};

export default ChooseOpponent;
