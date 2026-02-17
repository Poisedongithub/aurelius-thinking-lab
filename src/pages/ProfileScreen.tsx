import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TabBar } from "@/components/TabBar";
import { useNavigate } from "react-router-dom";
import { LogOut, Zap, Flame, Trophy } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { getAchievementById } from "@/lib/gamification";
import { apiGet } from "@/lib/api";

interface Profile { display_name: string; avatar_initials: string; }
interface MoralityProfile { alignment: string; alignment_description: string; compassion_vs_logic: number; individual_vs_collective: number; rules_vs_outcomes: number; idealism_vs_pragmatism: number; mercy_vs_justice: number; total_answered: number; }
interface Stats { totalSpars: number; totalPoints: number; mostSparred: { name: string; count: number } | null; strengths: { logic: number; rhetoric: number; strategy: number; ethics: number; creativity: number }; }

const philosopherNames: Record<string, string> = {
  "marcus-aurelius": "Marcus Aurelius", "machiavelli": "Machiavelli", "sun-tzu": "Sun Tzu",
  "nietzsche": "Nietzsche", "socrates": "Socrates", "confucius": "Confucius",
  "simone-de-beauvoir": "Simone de Beauvoir", "lao-tzu": "Lao Tzu",
};

const spectrumLabels: Record<string, [string, string]> = {
  compassion_vs_logic: ["Compassion", "Logic"], individual_vs_collective: ["Individual", "Collective"],
  rules_vs_outcomes: ["Rules", "Outcomes"], idealism_vs_pragmatism: ["Idealism", "Pragmatism"],
  mercy_vs_justice: ["Mercy", "Justice"],
};

const getRank = (levelInfo: { title: string }) => levelInfo.title;

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { streak, levelInfo, unlockedIds, loading: gamLoading } = useGamification();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [morality, setMorality] = useState<MoralityProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalSpars: 0, totalPoints: 0, mostSparred: null, strengths: { logic: 0, rhetoric: 0, strategy: 0, ethics: 0, creativity: 0 } });

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await apiGet("profiles");
        if (profileRes.data) setProfile(profileRes.data);

        const moralityRes = await apiGet("morality_profiles");
        if (moralityRes.data) setMorality(moralityRes.data as MoralityProfile);

        const sessionsRes = await apiGet("sparring_sessions");
        const sessions = sessionsRes.data || [];
        if (sessions.length > 0) {
          const counts: Record<string, number> = {};
          let totalPoints = 0; let totalRounds = 0;
          sessions.forEach((s: any) => { counts[s.opponent] = (counts[s.opponent] || 0) + 1; totalPoints += s.score || 0; totalRounds += s.rounds_scored || 0; });
          const sorted = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number));
          const avg = totalRounds > 0 ? totalPoints / totalRounds : 0;
          const base = Math.min(avg * 4, 80);
          setStats({
            totalSpars: sessions.length, totalPoints,
            mostSparred: sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] as number } : null,
            strengths: { logic: Math.min(100, base + 5), rhetoric: Math.min(100, base - 3), strategy: Math.min(100, base + 10), ethics: Math.min(100, base - 8), creativity: Math.min(100, base + 2) },
          });
        }
      } catch (e) {
        console.error("Failed to load profile data:", e);
      }
    };
    load();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  const strengthEntries = [
    { label: "Logic", value: stats.strengths.logic }, { label: "Rhetoric", value: stats.strengths.rhetoric },
    { label: "Strategy", value: stats.strengths.strategy }, { label: "Ethics", value: stats.strengths.ethics },
    { label: "Creativity", value: stats.strengths.creativity },
  ];

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background">
      <div className="flex justify-end px-7 pt-6">
        <button onClick={handleLogout} className="text-foreground/40 hover:text-foreground/70 transition-colors"><LogOut className="w-5 h-5" /></button>
      </div>
      <div className="text-center px-7 pb-7 border-b border-border/40">
        <div className="w-20 h-20 rounded-full border-2 border-primary/30 mx-auto mb-4 flex items-center justify-center font-serif text-[32px] text-foreground">{profile?.avatar_initials || "?"}</div>
        <h2 className="font-serif text-[26px] text-foreground">{profile?.display_name || "Loading..."}</h2>
        <div className="text-[10px] text-foreground/40 tracking-[0.2em] uppercase mt-1">{getRank(levelInfo)} · Lv.{levelInfo.level}</div>
        {levelInfo.nextLevel && (
          <div className="w-40 mx-auto mt-3">
            <div className="h-[3px] bg-foreground/8 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary/50 rounded-full" initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ duration: 0.8 }} />
            </div>
            <div className="flex justify-between mt-1"><span className="text-[9px] text-foreground/20">{levelInfo.totalXp} XP</span><span className="text-[9px] text-foreground/20">{levelInfo.nextLevel.xp} XP</span></div>
          </div>
        )}
        </div>
        <div className="flex justify-center gap-6 mt-5">
          <div className="text-center"><div className="flex items-center justify-center gap-1"><Flame className="w-4 h-4 text-foreground/60" /><span className="font-serif text-[28px] text-foreground">{streak.current_streak}</span></div><div className="text-[10px] text-foreground/35 uppercase tracking-[0.12em] mt-0.5">Streak</div></div>
          <div className="text-center"><div className="font-serif text-[28px] text-foreground">{stats.totalSpars}</div><div className="text-[10px] text-foreground/35 uppercase tracking-[0.12em] mt-0.5">Spars</div></div>
          <div className="text-center"><div className="flex items-center justify-center gap-1"><Zap className="w-4 h-4 text-foreground/60" /><span className="font-serif text-[28px] text-foreground">{stats.totalPoints}</span></div><div className="text-[10px] text-foreground/35 uppercase tracking-[0.12em] mt-0.5">Points</div></div>
          <div className="text-center"><div className="font-serif text-[28px] text-foreground">{morality?.total_answered || 0}</div><div className="text-[10px] text-foreground/35 uppercase tracking-[0.12em] mt-0.5">Dilemmas</div></div>
        </div>

      <div className="flex-1 px-7 py-6 flex flex-col gap-4 overflow-y-auto">
        {morality ? (
          <motion.div className="glass-card rounded-2xl p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h4 className="font-serif text-base text-foreground/70 mb-3">Moral Alignment</h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full border border-border/40 flex items-center justify-center font-serif text-2xl text-foreground shrink-0">{morality.alignment[0]}</div>
              <div>
                <div className="font-serif text-lg text-foreground">{morality.alignment}</div>
                <p className="text-[11px] text-foreground/35 font-light leading-relaxed mt-0.5">{morality.alignment_description}</p>
              </div>
            </div>
            {Object.entries(spectrumLabels).map(([key, labels]) => {
              const value = morality[key as keyof MoralityProfile] as number;
              const pct = ((value + 1) / 2) * 100;
              return (
                <div key={key} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1"><span className="text-[9px] text-foreground/30 font-light">{labels[0]}</span><span className="text-[9px] text-foreground/30 font-light">{labels[1]}</span></div>
                  <div className="h-[4px] bg-foreground/8 rounded-full relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-foreground/10" />
                    <motion.div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/70 border border-primary/35" initial={{ left: "50%" }} animate={{ left: `${pct}%` }} transition={{ duration: 0.8 }} style={{ marginLeft: "-5px" }} />
                  </div>
                </div>
              );
            })}
            <button onClick={() => navigate("/dilemma")} className="mt-4 w-full py-2.5 rounded-xl border border-border/30 text-foreground/50 text-xs font-light">Retake Quiz ({morality.total_answered} answered)</button>
          </motion.div>
        ) : (
          <motion.button onClick={() => navigate("/dilemma")} className="glass-card rounded-2xl p-5 text-left" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}>
            <h4 className="font-serif text-base text-foreground/70 mb-1">Discover Your Moral Alignment</h4>
            <p className="text-[11px] text-foreground/35 font-light">Take the 30-question dilemma quiz to reveal where you stand</p>
          </motion.button>
        )}

        <motion.div className="glass-card rounded-2xl p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h4 className="font-serif text-base text-foreground/70 mb-3">Thinking Strengths</h4>
          {strengthEntries.map((s) => (
            <div key={s.label} className="flex items-center gap-3 mb-2.5">
              <span className="text-[11px] text-foreground/40 w-20 shrink-0 font-light">{s.label}</span>
              <div className="flex-1 h-[3px] bg-foreground/6 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary/50 rounded-full" initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
              </div>
            </div>
          ))}
        </motion.div>

        {stats.mostSparred && (
          <motion.div className="glass-card rounded-2xl p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h4 className="font-serif text-base text-foreground/70 mb-3">Most Sparred</h4>
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center font-serif text-base text-foreground">{(philosopherNames[stats.mostSparred.name] || stats.mostSparred.name)[0]}</div>
              <div>
                <div className="font-serif text-[15px] text-foreground">{philosopherNames[stats.mostSparred.name] || stats.mostSparred.name}</div>
                <div className="text-[10px] text-foreground/30 tracking-[0.1em] uppercase">{stats.mostSparred.count} sessions</div>
              </div>
            </div>
          </motion.div>
        )}

        {unlockedIds.length > 0 && (
          <motion.div className="glass-card rounded-2xl p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-foreground/50" /><h4 className="font-serif text-base text-foreground/70">Achievements</h4>
              <span className="text-[10px] text-foreground/25 ml-auto">{unlockedIds.length} unlocked</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {unlockedIds.map((id) => { const ach = getAchievementById(id); if (!ach) return null; return (<div key={id} className="text-center"><div className="text-2xl mb-1">{ach.icon}</div><div className="text-[9px] text-foreground/40 font-light leading-tight">{ach.name}</div></div>); })}
            </div>
          </motion.div>
        )}
      </div>
      <TabBar />
    </div>
  );
};

export default ProfileScreen;
