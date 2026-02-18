import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { philosophers, topics } from "@/lib/philosophers";
import { getArena } from "@/lib/arenas";
import { streamChat, type Msg } from "@/lib/streaming";
import { ArrowLeft, Send, Zap, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { apiPost, apiPut, apiGet } from "@/lib/api";

interface ScoreResult { total_points: number; logic: number; rhetoric: number; strategy: number; ethics: number; creativity: number; brief_feedback: string; }

const EVAL_URL = "/api/evaluate-argument";

const SparringArena = () => {
  const navigate = useNavigate();
  const { philosopherId, topicId, arenaLevel } = useParams();
  const { toast } = useToast();
  const { onSparComplete } = useGamification();
  const philosopher = philosophers.find((p) => p.id === philosopherId);
  const topic = topics.find((t) => t.id === topicId);
  const level = arenaLevel ? parseInt(arenaLevel) : undefined;
  const arena = level && topicId ? getArena(topicId, level) : undefined;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [roundsScored, setRoundsScored] = useState(0);
  const [lastScore, setLastScore] = useState<ScoreResult | null>(null);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [arenaComplete, setArenaComplete] = useState<"passed" | "failed" | null>(null);
  const [resuming, setResuming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!philosopher || !topic || initRef.current) return;
    initRef.current = true;

    const initSession = async () => {
      // Check for an active (in-progress) session first
      try {
        const params = new URLSearchParams({ opponent: philosopher.id, topic: topic.id });
        if (level) params.set("arena_level", String(level));
        const res = await apiGet(`sparring_sessions/active?${params.toString()}`);
        
        if (res.data && res.data.messages && res.data.messages.length > 0) {
          // Resume the active session
          setResuming(true);
          setSessionId(res.data.id);
          setMessages(res.data.messages);
          setSessionScore(res.data.score || 0);
          setRoundsScored(res.data.rounds_scored || 0);
          setResuming(false);
          return; // Don't create a new session or generate an opening
        }
      } catch (e) {
        console.error("Failed to check for active session:", e);
      }

      // No active session found — create a new one
      try {
        const createData: any = { opponent: philosopher.id, topic: topic.id, messages: [] };
        if (level) createData.arena_level = level;
        const res = await apiPost("sparring_sessions", createData);
        if (res.data?.id) setSessionId(res.data.id);
      } catch (e) {
        console.error("Failed to create session:", e);
      }

      // Generate the philosopher's opening message
      const challengeContext = arena ? `\n\nThe debater must: "${arena.challenge}". Open the debate by challenging them on this specific topic. Be direct.` : "";
      setIsLoading(true);
      let assistantSoFar = "";
      streamChat({
        messages: [], philosopher: philosopher.id, topic: topic.id, systemSuffix: challengeContext,
        onDelta: (chunk) => { assistantSoFar += chunk; setMessages([{ role: "assistant", content: assistantSoFar }]); },
        onDone: () => setIsLoading(false),
        onError: (err) => { setIsLoading(false); toast({ title: "Error", description: err, variant: "destructive" }); },
      });
    };

    initSession();
  }, [philosopher?.id, topic?.id, level]);

  const saveSession = async (msgs: Msg[], score: number, rounds: number, completed?: boolean) => {
    if (!sessionId) return;
    try {
      const body: any = { messages: msgs, score, rounds_scored: rounds };
      if (completed !== undefined) body.completed = completed;
      await apiPut(`sparring_sessions/${sessionId}`, body);
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  };

  const saveArenaProgress = async (totalScore: number, totalRounds: number) => {
    if (!arena || !philosopherId) return;
    const passed = totalScore >= arena.passScore;
    try {
      await apiPost("arena_progress", {
        philosopher_id: philosopherId,
        arena_level: arena.level,
        score: totalScore,
        passed,
        best_score: totalScore,
        attempts: 1,
      });
    } catch (e) {
      console.error("Failed to save arena progress:", e);
    }
    // Mark the session as completed
    saveSession(messages, totalScore, totalRounds, true);
    setArenaComplete(passed ? "passed" : "failed");
  };

  const evaluateArgument = async (userMsg: string, aiResponse: string) => {
    if (!philosopher || !topic) return;
    try {
      const resp = await fetch(EVAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userMsg, assistantMessage: aiResponse, philosopher: philosopher.name, topic: topic.name, challenge: arena?.challenge, difficulty: arena ? `Tier ${arena.tier} (${arena.tierName})` : undefined }),
      });
      if (!resp.ok) return;
      const score: ScoreResult = await resp.json();
      if (score.total_points !== undefined) {
        const newScore = sessionScore + score.total_points;
        const newRounds = roundsScored + 1;
        setSessionScore(newScore); setRoundsScored(newRounds);
        setLastScore(score); setShowScorePopup(true);
        setTimeout(() => setShowScorePopup(false), 3000);
        const arenaPassed = arena && newRounds >= arena.rounds && newScore >= arena.passScore;
        if (arena && newRounds >= arena.rounds) { saveArenaProgress(newScore, newRounds); }
        try {
          const countRes = await apiGet("sparring_sessions/count");
          const sparCount = countRes.count ?? 0;
          await onSparComplete(score.total_points, sparCount, newScore, !!arenaPassed);
        } catch { /* ignore */ }
        return { score: newScore, rounds: newRounds };
      }
    } catch { /* Silently fail */ }
    return null;
  };

  const send = async () => {
    if (!input.trim() || isLoading || !philosopher || !topic || arenaComplete) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const userText = input.trim();
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(""); setIsLoading(true);
    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...newMessages, { role: "assistant", content: assistantSoFar }];
      });
    };
    try {
      await streamChat({
        messages: newMessages, philosopher: philosopher.id, topic: topic.id,
        systemSuffix: arena ? `\n\nThe debater is trying to: "${arena.challenge}". Challenge their reasoning rigorously. This is Tier ${arena.tier} difficulty.` : "",
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          const final = [...newMessages, { role: "assistant" as const, content: assistantSoFar }];
          const result = await evaluateArgument(userText, assistantSoFar);
          saveSession(final, result?.score ?? sessionScore, result?.rounds ?? roundsScored);
        },
        onError: (err) => { setIsLoading(false); toast({ title: "Error", description: err, variant: "destructive" }); },
      });
    } catch { setIsLoading(false); }
  };

  if (!philosopher || !topic) return null;
  const roundsLeft = arena ? arena.rounds - roundsScored : null;

  return (
    <div className="phone-container h-screen flex flex-col bg-background">
      <div className="shrink-0">
        <div className="flex items-center justify-between px-7 pt-5">
          <button onClick={() => arena ? navigate(`/arena/arenas/${philosopherId}/${topicId}`) : navigate("/home")} className="text-foreground/50"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-foreground/60" />
            <span className="font-serif text-2xl text-foreground">{sessionScore}</span>
            {arena && <span className="text-[11px] text-foreground/30 uppercase tracking-wider">/ {arena.passScore} to pass</span>}
          </div>
        </div>
        <div className="px-7 pt-2 pb-4 border-b border-border/40">
          <h2 className="font-serif text-[32px] text-foreground">{philosopher.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[12px] tracking-[0.15em] uppercase text-foreground/40 border border-border/60 px-3 py-1 rounded-full">{topic.name}</span>
            {arena && (<><span className="text-[12px] tracking-[0.12em] uppercase text-foreground/30 border border-border/30 px-2 py-0.5 rounded-full">Arena {arena.level}</span><span className="text-[12px] tracking-[0.1em] text-foreground/25">{arena.tierName}</span></>)}
            {roundsLeft !== null && roundsLeft > 0 && <span className="text-[12px] tracking-[0.1em] text-foreground/30">{roundsLeft} round{roundsLeft !== 1 ? "s" : ""} left</span>}
          </div>
          {arena && <p className="text-[13px] text-foreground/40 mt-2 italic leading-relaxed">"{arena.challenge}"</p>}
        </div>
      </div>

      <AnimatePresence>
        {showScorePopup && lastScore && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-36 left-1/2 -translate-x-1/2 z-50 glass-card rounded-2xl px-5 py-4 w-[85%] max-w-[330px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-foreground/70" /><span className="font-serif text-2xl text-foreground">+{lastScore.total_points}</span></div>
              <span className="text-[12px] text-foreground/40 italic font-light">{lastScore.brief_feedback}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[{ label: "Logic", val: lastScore.logic }, { label: "Rhet.", val: lastScore.rhetoric }, { label: "Strat.", val: lastScore.strategy }, { label: "Ethics", val: lastScore.ethics }, { label: "Create.", val: lastScore.creativity }].map((s) => (
                <div key={s.label} className="text-center"><div className="font-serif text-base text-foreground">{s.val}</div><div className="text-[10px] text-foreground/30 uppercase">{s.label}</div></div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {arenaComplete && arena && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-8 mx-7 text-center max-w-[340px]">
              {arenaComplete === "passed" ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-foreground/10 border border-foreground/20 mx-auto mb-4 flex items-center justify-center"><Check className="w-8 h-8 text-foreground/70" /></div>
                  <h3 className="font-serif text-[24px] text-foreground mb-1">Arena Passed</h3>
                  <p className="text-[11px] text-foreground/40 tracking-[0.1em] uppercase mb-4">{arena.tierName} · Level {arena.level}</p>
                  <div className="flex items-center justify-center gap-2 mb-6"><Zap className="w-5 h-5 text-foreground/60" /><span className="font-serif text-3xl text-foreground">{sessionScore}</span><span className="text-[10px] text-foreground/30">/ {arena.passScore} needed</span></div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-foreground/5 border border-border/30 mx-auto mb-4 flex items-center justify-center"><X className="w-8 h-8 text-foreground/30" /></div>
                  <h3 className="font-serif text-[24px] text-foreground mb-1">Not Yet</h3>
                  <p className="text-[11px] text-foreground/40 tracking-[0.1em] uppercase mb-4">Score: {sessionScore} / {arena.passScore} needed</p>
                  <p className="text-[12px] text-foreground/35 font-light mb-6">Sharpen your argument and try again.</p>
                </>
              )}
              <div className="flex gap-3">
                <button onClick={() => navigate(`/arena/arenas/${philosopherId}/${topicId}`)} className="flex-1 py-3 rounded-xl border border-border/40 text-foreground/60 text-sm font-light">Back</button>
                {arenaComplete === "passed" && level && level < 100 ? (
                  <button onClick={() => { setArenaComplete(null); setSessionScore(0); setRoundsScored(0); setMessages([]); initRef.current = false; navigate(`/arena/spar/${philosopherId}/${topicId}/${level + 1}`); }}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Next Level</button>
                ) : (
                  <button onClick={() => { setArenaComplete(null); setSessionScore(0); setRoundsScored(0); setMessages([]); initRef.current = false; navigate(`/arena/spar/${philosopherId}/${topicId}/${arena.level}`); }}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Retry</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">
        {resuming ? (
          <div className="self-center text-foreground/40 text-sm py-8">Resuming session...</div>
        ) : (
          messages.map((msg, i) => (
            <motion.div key={i} className={`max-w-[85%] px-5 py-4 rounded-2xl text-base font-light leading-relaxed ${msg.role === "assistant" ? "self-start glass-card rounded-bl-sm" : "self-end bg-foreground/10 border border-border/60 rounded-br-sm"}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {msg.role === "assistant" && <div className="font-serif text-sm text-foreground/50 mb-1.5 tracking-wider">{philosopher.name}</div>}
              <div className="prose prose-pink prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
            </motion.div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="self-start glass-card rounded-2xl rounded-bl-sm px-5 py-4">
            <div className="font-serif text-sm text-foreground/50 mb-1.5">{philosopher.name}</div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 px-7 pt-4 pb-10 border-t border-border/40">
        {arenaComplete ? (
          <div className="text-center text-[11px] text-foreground/30 py-3">Arena complete</div>
        ) : (
          <div className="flex items-center gap-3 glass-card rounded-full px-5 py-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="State your position..." className="flex-1 bg-transparent text-base text-foreground placeholder:text-foreground/25 font-light outline-none" disabled={isLoading} />
            <button onClick={send} disabled={isLoading || !input.trim()} className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity">
              <Send className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SparringArena;
