import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TabBar } from "@/components/TabBar";
import { dailyQuotes } from "@/lib/philosophers";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { Flame } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const dilemmas = [
  { title: "The Trolley Problem", desc: "Would you sacrifice one to save five?", path: "/dilemma/trolley-problem" },
  { title: "Ship of Theseus", desc: "If every part is replaced, is it still the same?", path: "/dilemma/ship-of-theseus" },
  { title: "Plato's Cave", desc: "Are you watching shadows or seeing truth?", path: "/dilemma/platos-cave" },
  { title: "Veil of Ignorance", desc: "What is fair if you don't know your place?", path: "/dilemma/veil-of-ignorance" },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  useAuth();
  const { streak, levelInfo, loading: gamLoading } = useGamification();
  const { glowColor } = useTheme();
  const quote = dailyQuotes[new Date().getDay() % dailyQuotes.length];

  const cards = [
    { title: "Choose Opponent", desc: "Select your philosophical challenger", action: () => navigate("/arena"),
      icon: (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="21" x2="15" y2="5"/><polyline points="13,3 17,3 17,7"/><line x1="21" y1="21" x2="9" y2="5"/><polyline points="7,3 11,3 7,7"/><line x1="8" y1="16" x2="16" y2="16"/></svg>) },
    { title: "Library", desc: "Explore philosophical concepts", action: () => navigate("/library"),
      icon: (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 14c0-5 3-9 7-10 4 1 7 5 7 10"/><line x1="3" y1="14" x2="21" y2="14"/><path d="M5 14c0 3 1 5 3 6h8c2-1 3-3 3-6"/></svg>) },
    { title: "Daily Challenge", desc: "Today's philosophical question", action: () => navigate("/dilemma"),
      icon: (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="2" x2="18" y2="2"/><line x1="6" y1="22" x2="18" y2="22"/><path d="M8 2c0 4 0 6 4 10-4 4-4 6-4 10"/><path d="M16 2c0 4 0 6-4 10 4 4 4 6 4 10"/></svg>) },
  ];

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[480px] opacity-40" style={{ background: `radial-gradient(ellipse at center top, ${glowColor} 0%, transparent 70%)`, maskImage: "linear-gradient(to bottom, black 20%, rgba(0,0,0,0.4) 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 20%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-gradient-to-b from-background/30 via-background/60 to-background pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col px-7 pt-16 pb-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl leading-tight text-foreground">Sharpen<br />Your Mind</h1>
              <p className="text-sm text-foreground/40 font-light mt-1">The arena awaits</p>
            </div>
            {!gamLoading && (
              <div className="flex flex-col items-end gap-1">
                {streak.current_streak > 0 && (
                  <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5">
                    <Flame className="w-4 h-4 text-foreground/60" />
                    <span className="font-serif text-lg text-foreground">{streak.current_streak}</span>
                  </div>
                )}
                <div className="text-[10px] text-foreground/30 tracking-[0.1em] uppercase">Lv.{levelInfo.level} · {levelInfo.title}</div>
              </div>
            )}
          </div>
          {!gamLoading && levelInfo.nextLevel && (
            <div className="mt-4 mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-foreground/25">{levelInfo.totalXp} XP</span>
                <span className="text-[10px] text-foreground/25">{levelInfo.nextLevel.xp} XP</span>
              </div>
              <div className="h-[3px] bg-foreground/8 rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary/60 rounded-full" initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          )}
          {gamLoading && <div className="mb-10" />}
          {!gamLoading && !levelInfo.nextLevel && <div className="mb-6" />}
        </motion.div>

        <div className="flex flex-col gap-3">
          {cards.map((card, i) => (
            <motion.button key={card.title} onClick={card.action}
              className="glass-card rounded-2xl p-6 flex items-center gap-5 text-left transition-all hover:bg-card/60 hover:border-border"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}>
              <div className="w-12 h-12 border border-border/60 rounded-xl flex items-center justify-center shrink-0 text-foreground/55">{card.icon}</div>
              <div>
                <h3 className="font-serif text-xl text-foreground">{card.title}</h3>
                <p className="text-xs text-foreground/35 font-light">{card.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <h2 className="font-serif text-2xl text-foreground mb-1">Visual Philosophy</h2>
          <p className="text-xs text-foreground/35 font-light mb-5">Classic dilemmas that define moral thought</p>
          <motion.button onClick={() => navigate("/dilemma")} className="w-full glass-card rounded-2xl overflow-hidden mb-4" whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
            <div className="relative h-[200px]">
              <div className="w-full h-full bg-gradient-to-br from-muted to-background" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-xl text-foreground leading-snug">Moral Dilemma Quiz</h3>
                <p className="text-[12px] text-foreground/40 font-light mt-1">30 questions to reveal your moral alignment</p>
              </div>
            </div>
          </motion.button>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-7 px-7 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {dilemmas.map((d, i) => (
              <motion.button key={d.title} onClick={() => navigate(d.path)} className="shrink-0 w-[220px] snap-start group"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}>
                <div className="relative w-full h-[280px] rounded-2xl overflow-hidden mb-3">
                  <div className="w-full h-full bg-gradient-to-br from-muted to-background transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-lg text-foreground leading-snug">{d.title}</h3>
                    <p className="text-[11px] text-foreground/40 font-light mt-1">{d.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="mt-6 py-6 border-t border-border/40 mb-2">
          <p className="font-serif italic text-[15px] text-foreground/45 leading-relaxed">"{quote.text}"</p>
          <span className="text-[10px] text-foreground/25 tracking-[0.1em] uppercase mt-2 block">{quote.author}</span>
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default HomeScreen;
