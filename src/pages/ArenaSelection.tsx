import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { philosophers, topics } from "@/lib/philosophers";
import { getAllArenas, tierNames, type Arena } from "@/lib/arenas";
import { apiGet } from "@/lib/api";
import { TabBar } from "@/components/TabBar";
import { ArrowLeft, Lock, Check, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface ProgressMap { [level: number]: { passed: boolean; bestScore: number; attempts: number }; }

const ArenaSelection = () => {
  const navigate = useNavigate();
  const { philosopherId, topicId } = useParams();
  const philosopher = philosophers.find((p) => p.id === philosopherId);
  const topic = topics.find((t) => t.id === topicId);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [expandedTier, setExpandedTier] = useState<number>(1);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet("arena_progress");
        const data = res.data || [];
        const filtered = data.filter((d: any) => d.philosopher_id === philosopherId);
        const map: ProgressMap = {};
        filtered.forEach((d: any) => { map[d.arena_level] = { passed: d.passed, bestScore: d.best_score, attempts: d.attempts }; });
        setProgress(map);
        const highestPassed = Math.max(0, ...filtered.filter((d: any) => d.passed).map((d: any) => d.arena_level));
        setExpandedTier(Math.ceil((highestPassed + 1) / 10) || 1);
      } catch (e) {
        console.error("Failed to load arena progress:", e);
      }
    };
    load();
  }, [philosopherId]);

  if (!philosopher || !topicId) return null;

  const arenas = getAllArenas(topicId);
  const highestPassed = Math.max(0, ...Object.entries(progress).filter(([, v]) => v.passed).map(([k]) => Number(k)));
  const tiers = tierNames.map((name, i) => ({ tier: i + 1, name, arenas: arenas.slice(i * 10, (i + 1) * 10) }));
  const isUnlocked = (level: number) => level <= highestPassed + 1;

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background">
      <button onClick={() => navigate(`/arena/topic/${philosopherId}`)} className="p-7 pb-0 text-foreground/50"><ArrowLeft className="w-5 h-5" /></button>
      <div className="px-7 pt-3 pb-5">
        <h2 className="font-serif text-[26px] text-foreground">{topic?.name || topicId} Arenas</h2>
        <p className="text-[11px] text-foreground/35 tracking-[0.12em] uppercase mt-1">{philosopher.name} · {highestPassed}/100 completed</p>
      </div>
      <div className="flex-1 overflow-y-auto px-7 pb-4">
        {tiers.map(({ tier, name, arenas: tierArenas }) => {
          const tierUnlocked = isUnlocked((tier - 1) * 10 + 1);
          const tierCompleted = tierArenas.every((a) => progress[a.level]?.passed);
          const isExpanded = expandedTier === tier;
          return (
            <div key={tier} className="mb-3">
              <button onClick={() => setExpandedTier(isExpanded ? 0 : tier)}
                className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-colors ${tierCompleted ? "bg-foreground/8 border border-foreground/15" : tierUnlocked ? "glass-card" : "bg-card/20 border border-border/20 opacity-50"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-foreground/30 uppercase tracking-[0.15em] w-6">{tier < 10 ? `0${tier}` : tier}</span>
                  <span className="font-serif text-[15px] text-foreground">{name}</span>
                  {tierCompleted && <Check className="w-3.5 h-3.5 text-foreground/50" />}
                  {!tierUnlocked && <Lock className="w-3.5 h-3.5 text-foreground/25" />}
                </div>
                {tierUnlocked && (isExpanded ? <ChevronUp className="w-4 h-4 text-foreground/30" /> : <ChevronDown className="w-4 h-4 text-foreground/30" />)}
              </button>
              {isExpanded && tierUnlocked && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 flex flex-col gap-2 pl-2">
                  {tierArenas.map((arena) => {
                    const unlocked = isUnlocked(arena.level);
                    const p = progress[arena.level];
                    const passed = p?.passed;
                    return (
                      <button key={arena.level} disabled={!unlocked} onClick={() => navigate(`/arena/spar/${philosopherId}/${topicId}/${arena.level}`)}
                        className={`flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${passed ? "bg-foreground/5 border border-foreground/10" : unlocked ? "glass-card hover:bg-card/60" : "opacity-30 cursor-not-allowed"}`}>
                        <div className="flex items-center justify-center w-7 h-7 rounded-full border border-border/40 shrink-0 mt-0.5">
                          {passed ? <Check className="w-3.5 h-3.5 text-foreground/60" /> : !unlocked ? <Lock className="w-3 h-3 text-foreground/20" /> : <span className="text-[10px] font-serif text-foreground/50">{arena.level}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-foreground/80 leading-snug">{arena.challenge}</div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] text-foreground/25 uppercase tracking-wider">{arena.rounds}r</span>
                            <span className="text-[9px] text-foreground/25 uppercase tracking-wider">Pass: {arena.passScore}/{arena.maxScore}</span>
                            {p?.bestScore !== undefined && p.bestScore > 0 && <span className="flex items-center gap-0.5 text-[9px] text-foreground/35"><Zap className="w-2.5 h-2.5" /> {p.bestScore}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      <TabBar />
    </div>
  );
};

export default ArenaSelection;
