import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { pickDilemmas, calculateMorality, type Dilemma } from "@/lib/dilemmas";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

const BASE_QUESTIONS = 30;

const DilemmaQuiz = () => {
  const navigate = useNavigate();
  useAuth();
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";
  const { onDilemmaAnswer } = useGamification();
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const baseQuestions = useMemo(() => pickDilemmas(BASE_QUESTIONS), []);
  const [questions, setQuestions] = useState<Dilemma[]>(baseQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ dilemmaId: string; choiceIndex: number }[]>([]);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiError, setAiError] = useState(false);
  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = (currentIndex / totalQuestions) * 100;

  const fetchAIDilemmas = useCallback(async () => {
    if (loadingAI) return;
    setLoadingAI(true);
    try {
      const previousIds = questions.map(q => q.id);
      const resp = await fetch("/api/generate-dilemma", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ previousIds, count: 5 }) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data?.dilemmas?.length > 0) { setQuestions(prev => [...prev, ...data.dilemmas]); setAiError(false); }
      else { throw new Error("No dilemmas returned"); }
    } catch (e: any) {
      console.error("AI dilemma error:", e);
      setAiError(true);
      if (e?.message?.includes("429") || e?.status === 429) { toast.error("Rate limited — please wait a moment"); }
      else if (e?.message?.includes("402") || e?.status === 402) { toast.error("AI credits exhausted"); }
    } finally { setLoadingAI(false); }
  }, [loadingAI, questions]);

  useEffect(() => { if (currentIndex >= questions.length - 3 && !loadingAI && !aiError) { fetchAIDilemmas(); } }, [currentIndex, questions.length, loadingAI, aiError, fetchAIDilemmas]);
  useEffect(() => { if (currentIndex >= BASE_QUESTIONS && !aiMode) { setAiMode(true); } }, [currentIndex, aiMode]);

  const handleChoice = async (choiceIndex: number) => {
    if (selecting !== null) return;
    setSelecting(choiceIndex);
    const newAnswers = [...answers, { dilemmaId: current.id, choiceIndex }];
    setAnswers(newAnswers);
    try {
      await apiPost("dilemma_responses", { session_id: sessionId, dilemma_id: current.id, choice_index: choiceIndex });
      await onDilemmaAnswer(newAnswers.length);
    } catch { /* ignore */ }
    setTimeout(() => {
      setSelecting(null);
      if (!aiMode && currentIndex + 1 >= BASE_QUESTIONS) { finishQuiz(newAnswers); }
      else if (currentIndex + 1 >= questions.length && aiError) { finishQuiz(newAnswers); }
      else { setCurrentIndex(currentIndex + 1); }
    }, 600);
  };

  const finishQuiz = async (finalAnswers: { dilemmaId: string; choiceIndex: number }[]) => {
    const result = calculateMorality(finalAnswers, questions);
    try {
      await apiPost("morality_profiles", {
        alignment: result.alignment, alignment_description: result.alignmentDescription,
        compassion_vs_logic: result.spectrums.compassion_vs_logic, individual_vs_collective: result.spectrums.individual_vs_collective,
        rules_vs_outcomes: result.spectrums.rules_vs_outcomes, idealism_vs_pragmatism: result.spectrums.idealism_vs_pragmatism,
        mercy_vs_justice: result.spectrums.mercy_vs_justice, total_answered: finalAnswers.length,
      });
    } catch (e) {
      console.error("Failed to save morality profile:", e);
    }
    navigate("/dilemma/results", { state: result });
  };

  if (!current) {
    if (loadingAI) {
      return (<div className={`phone-container min-h-screen flex flex-col items-center justify-center bg-background gap-4 ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}><Loader2 className="w-6 h-6 text-foreground/40 animate-spin" /><p className="text-sm text-foreground/40 font-light">Generating new dilemma…</p></div>);
    }
    return null;
  }

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
      <div className="shrink-0 px-7 pt-6 pb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate("/home")} className="text-foreground/40 hover:text-foreground/60 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            {aiMode && <Sparkles className="w-3.5 h-3.5 text-foreground/25" />}
            <span className="text-[13px] text-foreground/35 font-light tracking-wide">{currentIndex + 1}{!aiMode ? ` of ${BASE_QUESTIONS}` : ""}</span>
          </div>
        </div>
        {!aiMode ? (
          <div className="h-1 bg-foreground/6 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.8))" }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
          </div>
        ) : (<div className="h-1 bg-foreground/6 rounded-full overflow-hidden"><div className="h-full bg-foreground/12 rounded-full w-full" /></div>)}
      </div>
      <div className="flex-1 px-7 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }} className="flex-1 flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[11px] text-foreground/25 tracking-[0.15em] uppercase font-light">{current.category}</span>
              {aiMode && <span className="text-[10px] text-foreground/15 tracking-wider uppercase flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI</span>}
            </div>
            <h2 className="font-serif text-[28px] leading-[1.15] text-foreground/90 mb-3">{current.title}</h2>
            <p className="text-[14px] text-foreground/40 font-light leading-[1.7] mb-8">{current.scenario}</p>
            <div className="flex flex-col gap-3 mt-auto pb-10">
              {current.choices.map((choice, i) => (
                <motion.button key={i} onClick={() => handleChoice(i)} disabled={selecting !== null}
                  className={`text-left rounded-2xl px-5 py-[18px] transition-all duration-300 border ${selecting === i ? "bg-primary/15 border-primary/30" : "bg-card/30 border-border/40 hover:bg-card/50 hover:border-border/60"}`}
                  whileTap={{ scale: 0.985 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.06 }}>
                  <span className="text-[14px] text-foreground/70 font-light leading-relaxed">{choice.text}</span>
                </motion.button>
              ))}
              {aiMode && currentIndex >= BASE_QUESTIONS && (
                <button onClick={() => finishQuiz(answers)} className="mt-3 py-3.5 rounded-2xl border border-border/25 text-foreground/35 text-[13px] font-light hover:border-border/40 hover:text-foreground/50 transition-all">
                  See my results · {answers.length} answered
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {loadingAI && aiMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 text-foreground/20 text-[12px] font-light"><Loader2 className="w-3 h-3 animate-spin" />Loading more…</div>
        </div>
      )}
    </div>
  );
};

export default DilemmaQuiz;
