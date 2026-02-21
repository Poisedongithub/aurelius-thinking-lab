import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Brain, Swords, BookOpen, Award, Target, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { apiGet } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { philosophers } from "@/lib/philosophers";
import { ACHIEVEMENTS, getAchievementById } from "@/lib/gamification";

interface MoralProfile {
  alignment: string;
  alignment_description: string;
  compassion_vs_logic: number;
  individual_vs_collective: number;
  rules_vs_outcomes: number;
  idealism_vs_pragmatism: number;
  mercy_vs_justice: number;
  total_answered: number;
}

interface SparringSession {
  id: string;
  opponent: string;
  topic: string;
  score: number;
  rounds_scored: number;
  completed: boolean;
  created_at: string;
}

const spectrumLabels: Record<string, [string, string]> = {
  compassion_vs_logic: ["Compassion", "Logic"],
  individual_vs_collective: ["Individual", "Collective"],
  rules_vs_outcomes: ["Rules", "Outcomes"],
  idealism_vs_pragmatism: ["Idealism", "Pragmatism"],
  mercy_vs_justice: ["Mercy", "Justice"],
};

const schoolMapping: Record<string, { name: string; color: string }> = {
  utilitarian: { name: "Utilitarianism", color: "bg-amber-500" },
  kantian: { name: "Kantian Ethics", color: "bg-blue-500" },
  virtue_ethicist: { name: "Virtue Ethics", color: "bg-emerald-500" },
  existentialist: { name: "Existentialism", color: "bg-purple-500" },
  pragmatist: { name: "Pragmatism", color: "bg-orange-500" },
  stoic: { name: "Stoicism", color: "bg-slate-500" },
};

function getSchoolBreakdown(profile: MoralProfile | null) {
  if (!profile) return [];
  const scores: Record<string, number> = {
    utilitarian: 0,
    kantian: 0,
    virtue_ethicist: 0,
    existentialist: 0,
    pragmatist: 0,
    stoic: 0,
  };

  // Map moral spectrums to philosophical schools
  const c = profile.compassion_vs_logic;
  const i = profile.individual_vs_collective;
  const r = profile.rules_vs_outcomes;
  const id = profile.idealism_vs_pragmatism;
  const m = profile.mercy_vs_justice;

  // Utilitarianism: outcomes-focused, collective, logic
  scores.utilitarian = Math.max(0, (-r + i - c) / 3 + 0.5) * 100;
  // Kantian: rules-based, individual rights, logic
  scores.kantian = Math.max(0, (r - i - c) / 3 + 0.5) * 100;
  // Virtue Ethics: balanced, compassion, idealism
  scores.virtue_ethicist = Math.max(0, (c + id + m) / 3 + 0.5) * 100;
  // Existentialism: individual, idealism, mercy
  scores.existentialist = Math.max(0, (-i + id + m) / 3 + 0.5) * 100;
  // Pragmatism: outcomes, pragmatic, logic
  scores.pragmatist = Math.max(0, (-r - id - c) / 3 + 0.5) * 100;
  // Stoicism: logic, rules, justice
  scores.stoic = Math.max(0, (-c + r - m) / 3 + 0.5) * 100;

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(scores)
    .map(([key, val]) => ({
      id: key,
      ...schoolMapping[key],
      percentage: Math.round((val / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

const ProgressDashboard = () => {
  const navigate = useNavigate();
  useAuth();
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";
  const { streak, xp, levelInfo, unlockedIds } = useGamification();

  const [moralProfile, setMoralProfile] = useState<MoralProfile | null>(null);
  const [sessions, setSessions] = useState<SparringSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, sessionsRes] = await Promise.all([
          apiGet("morality_profiles"),
          apiGet("sparring_sessions"),
        ]);
        if (profileRes.data) setMoralProfile(profileRes.data);
        if (sessionsRes.data) setSessions(sessionsRes.data);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const completedSessions = sessions.filter((s) => s.completed);
  const totalScore = completedSessions.reduce((a, s) => a + (s.score || 0), 0);
  const avgScore = completedSessions.length > 0 ? Math.round(totalScore / completedSessions.length) : 0;
  const schoolBreakdown = getSchoolBreakdown(moralProfile);

  // Opponent stats
  const opponentStats = philosophers.map((p) => {
    const pSessions = completedSessions.filter((s) => s.opponent === p.id);
    const pScore = pSessions.reduce((a, s) => a + (s.score || 0), 0);
    return { ...p, debates: pSessions.length, totalScore: pScore, avgScore: pSessions.length > 0 ? Math.round(pScore / pSessions.length) : 0 };
  }).filter((p) => p.debates > 0).sort((a, b) => b.debates - a.debates);

  if (loading) {
    return (
      <div className={`phone-container min-h-screen flex items-center justify-center bg-background ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
        <div className="text-foreground/30 text-sm">Loading your journey...</div>
      </div>
    );
  }

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
      {/* Header */}
      <div className="shrink-0 px-7 pt-6 pb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate("/profile")} className="text-foreground/40 hover:text-foreground/60 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[11px] text-foreground/25 tracking-[0.2em] uppercase">Progress</span>
          <div className="w-5" />
        </div>
        <h1 className="font-serif text-[32px] text-foreground leading-tight">Your Journey</h1>
        <p className="text-[13px] text-foreground/40 font-light mt-1">Philosophical growth over time</p>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-10">
        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="glass-card rounded-2xl p-4 text-center">
            <Flame className="w-5 h-5 text-foreground/40 mx-auto mb-2" />
            <div className="font-serif text-2xl text-foreground">{streak.current_streak}</div>
            <div className="text-[10px] text-foreground/30 uppercase tracking-wider">Streak</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Swords className="w-5 h-5 text-foreground/40 mx-auto mb-2" />
            <div className="font-serif text-2xl text-foreground">{completedSessions.length}</div>
            <div className="text-[10px] text-foreground/30 uppercase tracking-wider">Debates</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Target className="w-5 h-5 text-foreground/40 mx-auto mb-2" />
            <div className="font-serif text-2xl text-foreground">{avgScore}</div>
            <div className="text-[10px] text-foreground/30 uppercase tracking-wider">Avg Score</div>
          </div>
        </motion.div>

        {/* Moral Alignment */}
        {moralProfile && (
          <motion.div
            className="glass-card rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-foreground/50" />
              <h3 className="font-serif text-lg text-foreground">Moral Alignment</h3>
            </div>
            <div className="text-center mb-5">
              <div className="font-serif text-[22px] text-primary">{moralProfile.alignment}</div>
              <p className="text-[12px] text-foreground/35 font-light mt-1 leading-relaxed">{moralProfile.alignment_description}</p>
              <p className="text-[11px] text-foreground/20 mt-2">{moralProfile.total_answered} dilemmas answered</p>
            </div>

            {/* Spectrum bars */}
            <div className="space-y-4">
              {Object.entries(spectrumLabels).map(([key, [left, right]]) => {
                const value = (moralProfile as any)[key] ?? 0;
                const pct = ((value + 1) / 2) * 100; // -1..1 → 0..100
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] text-foreground/40 font-light">{left}</span>
                      <span className="text-[11px] text-foreground/40 font-light">{right}</span>
                    </div>
                    <div className="h-2 bg-foreground/6 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/10" />
                      <motion.div
                        className="absolute top-0 bottom-0 w-3 rounded-full bg-primary/70"
                        initial={{ left: "50%" }}
                        animate={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ transform: "translateX(-50%)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* School of Thought Breakdown */}
        {schoolBreakdown.length > 0 && (
          <motion.div
            className="glass-card rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-foreground/50" />
              <h3 className="font-serif text-lg text-foreground">Philosophical DNA</h3>
            </div>
            <p className="text-[12px] text-foreground/30 font-light mb-4">Based on your dilemma responses</p>
            <div className="space-y-3">
              {schoolBreakdown.slice(0, 4).map((school, i) => (
                <div key={school.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[13px] text-foreground/70 font-light">{school.name}</span>
                    <span className="text-[12px] text-foreground/40">{school.percentage}%</span>
                  </div>
                  <div className="h-2 bg-foreground/6 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${school.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${school.percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Opponent History */}
        {opponentStats.length > 0 && (
          <motion.div
            className="glass-card rounded-2xl p-6 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Swords className="w-4 h-4 text-foreground/50" />
              <h3 className="font-serif text-lg text-foreground">Debate Record</h3>
            </div>
            <div className="space-y-3">
              {opponentStats.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-foreground/8 flex items-center justify-center">
                      <span className="font-serif text-sm text-foreground/60">{opp.initials}</span>
                    </div>
                    <div>
                      <div className="text-[13px] text-foreground/70">{opp.name}</div>
                      <div className="text-[11px] text-foreground/30">{opp.school}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] text-foreground/60 font-serif">{opp.debates} {opp.debates === 1 ? "debate" : "debates"}</div>
                    <div className="text-[11px] text-foreground/30">avg {opp.avgScore} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div
          className="glass-card rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-foreground/50" />
            <h3 className="font-serif text-lg text-foreground">Achievements</h3>
            <span className="text-[11px] text-foreground/25 ml-auto">{unlockedIds.length} / {ACHIEVEMENTS.length}</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = unlockedIds.includes(ach.id);
              return (
                <div key={ach.id} className="text-center" title={`${ach.name}: ${ach.description}`}>
                  <div className={`text-xl mb-1 ${unlocked ? "" : "grayscale opacity-20"}`}>{ach.icon}</div>
                  <div className={`text-[9px] leading-tight ${unlocked ? "text-foreground/50" : "text-foreground/15"}`}>{ach.name}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-foreground/50" />
            <h3 className="font-serif text-lg text-foreground">Level Progress</h3>
          </div>
          <div className="text-center mb-4">
            <div className="font-serif text-[36px] text-foreground">{levelInfo.level}</div>
            <div className="text-[13px] text-primary/70">{levelInfo.title}</div>
            <div className="text-[11px] text-foreground/25 mt-1">{xp.total_xp} total XP</div>
          </div>
          {levelInfo.nextLevel && (
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-foreground/30">{xp.total_xp} XP</span>
                <span className="text-[11px] text-foreground/30">{levelInfo.nextLevel.xp} XP</span>
              </div>
              <div className="h-2.5 bg-foreground/6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <p className="text-[11px] text-foreground/25 text-center mt-2">
                {levelInfo.nextLevel.xp - xp.total_xp} XP to {levelInfo.nextLevel.title}
              </p>
            </div>
          )}
        </motion.div>

        {/* Empty state */}
        {!moralProfile && completedSessions.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-10 h-10 text-foreground/15 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-foreground/50 mb-2">Your journey begins</h3>
            <p className="text-[13px] text-foreground/30 font-light max-w-[260px] mx-auto leading-relaxed">
              Complete dilemma quizzes and sparring sessions to build your philosophical profile.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => navigate("/dilemma")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px]">
                Take Dilemma Quiz
              </button>
              <button onClick={() => navigate("/arena")} className="px-5 py-2.5 rounded-xl border border-border/40 text-foreground/60 text-[13px]">
                Start Sparring
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
