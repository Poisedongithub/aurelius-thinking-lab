import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TabBar } from "@/components/TabBar";
import { useNavigate } from "react-router-dom";
import { Zap, BookOpen } from "lucide-react";
import { philosophers, topics } from "@/lib/philosophers";
import { apiGet } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";

interface Session { id: string; opponent: string; topic: string; score: number; rounds_scored: number; created_at: string; }

const philosopherNames: Record<string, string> = Object.fromEntries(philosophers.map((p) => [p.id, p.name]));
const topicNames: Record<string, string> = Object.fromEntries(topics.map((t) => [t.id, t.name]));

const LibraryScreen = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet("sparring_sessions");
        if (res.data) setSessions(res.data);
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const formatDate = (iso: string) => { const d = new Date(iso); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background ${isStoic ? "stoic-grain" : ""}`}>
      <div className="px-7 pt-8 pb-4">
        <h1 className="font-serif text-[28px] text-foreground">Library</h1>
        <p className="text-[11px] text-foreground/35 tracking-[0.15em] uppercase mt-1">Past sparring sessions</p>
      </div>
      <div className="flex-1 px-7 pb-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="text-foreground/30 text-sm">Loading…</div></div>
        ) : sessions.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-20 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BookOpen className="w-10 h-10 text-foreground/15" />
            <p className="text-foreground/30 text-sm text-center">No sessions yet.<br />Start a spar to build your library.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s, i) => (
              <motion.div key={s.id} className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-card/60 transition-colors"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => navigate(`/arena/spar/${s.opponent}/${s.topic}`)}>
                <div className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center font-serif text-lg text-foreground shrink-0">{(philosopherNames[s.opponent] || s.opponent)[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[15px] text-foreground truncate">{philosopherNames[s.opponent] || s.opponent}</div>
                  <div className="text-[10px] text-foreground/30 tracking-[0.1em] uppercase">{topicNames[s.topic] || s.topic} · {formatDate(s.created_at)}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0"><Zap className="w-3.5 h-3.5 text-foreground/40" /><span className="font-serif text-lg text-foreground">{s.score}</span></div>
                {s.rounds_scored > 0 && <div className="text-[9px] text-foreground/25 shrink-0">{s.rounds_scored}r</div>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
};

export default LibraryScreen;
