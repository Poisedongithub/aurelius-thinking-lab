import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { philosophers } from "@/lib/philosophers";
import { supabase } from "@/integrations/supabase/client";

// Ocean palette
const ocean = {
  deepBlue: "#006895",
  brightTeal: "#0699ba",
  turquoise: "#1ea5b0",
  seafoam: "#8ec2b7",
  sand: "#dfdcd2",
};

type CourtPhase = "loading" | "case" | "prosecution" | "defense" | "deliberation" | "verdict" | "results";

interface CourtCase {
  id: string;
  title: string;
  category: string;
  scenario: string;
  defendant: string;
  charge: string;
  prosecution: { philosopher: string; position: string };
  defense: { philosopher: string; position: string };
  verdict_options: { label: string; description: string }[];
  moral_dimensions: string[];
  case_date: string;
}

interface VerdictStats {
  [key: string]: { count: number; percentage: number };
}

function getPhilosopherName(id: string): string {
  const p = philosophers.find(ph => ph.id === id);
  return p?.name || id.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function getPhilosopherInitials(id: string): string {
  const p = philosophers.find(ph => ph.id === id);
  return p?.initials || id[0].toUpperCase();
}

const MoralCourt = () => {
  const navigate = useNavigate();
  useAuth();
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";

  const [phase, setPhase] = useState<CourtPhase>("loading");
  const [courtCase, setCourtCase] = useState<CourtCase | null>(null);
  const [prosecutionArg, setProsecutionArg] = useState("");
  const [defenseArg, setDefenseArg] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [verdictSubmitted, setVerdictSubmitted] = useState(false);
  const [existingVerdict, setExistingVerdict] = useState<string | null>(null);
  const [communityStats, setCommunityStats] = useState<VerdictStats>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [judgeQuestion, setJudgeQuestion] = useState("");
  const [questionTarget, setQuestionTarget] = useState<"prosecution" | "defense" | null>(null);
  const [questionResponse, setQuestionResponse] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch today's case
  useEffect(() => {
    fetchDailyCase();
  }, []);

  const fetchDailyCase = async () => {
    try {
      setPhase("loading");
      setError(null);
      const resp = await fetch("/api/court/daily-case");
      if (!resp.ok) throw new Error("Failed to load case");
      const data = await resp.json();
      setCourtCase(data.case);

      // Check if user already submitted a verdict
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && data.case?.id) {
        const vResp = await fetch(`/api/court/my-verdict?case_id=${data.case.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const vData = await vResp.json();
        if (vData.data) {
          setExistingVerdict(vData.data.verdict);
          setSelectedVerdict(vData.data.verdict);
          setReasoning(vData.data.reasoning || "");
          setVerdictSubmitted(true);
          // Fetch community stats
          await fetchStats(data.case.id);
          setPhase("results");
          return;
        }
      }
      setPhase("case");
    } catch (err: any) {
      console.error("Court case error:", err);
      setError("Failed to load today's case. Please try again.");
      setPhase("loading");
    }
  };

  const fetchStats = async (caseId: string) => {
    try {
      const resp = await fetch(`/api/court/stats?case_id=${caseId}`);
      const data = await resp.json();
      setCommunityStats(data.stats || {});
      setTotalVotes(data.total || 0);
    } catch { /* ignore */ }
  };

  // Stream an argument from a philosopher
  const streamArgument = useCallback(async (side: "prosecution" | "defense", userQuestion?: string) => {
    if (!courtCase) return;
    setIsStreaming(true);
    const sideData = side === "prosecution" ? courtCase.prosecution : courtCase.defense;

    try {
      const resp = await fetch("/api/court/argument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          philosopher: sideData.philosopher,
          position: sideData.position,
          scenario: courtCase.scenario,
          side,
          userQuestion,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              if (userQuestion) {
                setQuestionResponse(accumulated);
              } else if (side === "prosecution") {
                setProsecutionArg(accumulated);
              } else {
                setDefenseArg(accumulated);
              }
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
    }
    setIsStreaming(false);
  }, [courtCase]);

  // Submit verdict
  const submitVerdict = async () => {
    if (!selectedVerdict || !courtCase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await fetch("/api/court/verdict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          case_id: courtCase.id,
          case_date: courtCase.case_date,
          verdict: selectedVerdict,
          reasoning,
        }),
      });

      setVerdictSubmitted(true);
      await fetchStats(courtCase.id);
      setPhase("results");
    } catch (err) {
      console.error("Verdict submit error:", err);
    }
  };

  // Ask a question to prosecution or defense
  const askQuestion = async () => {
    if (!judgeQuestion.trim() || !questionTarget || !courtCase) return;
    setIsAskingQuestion(true);
    setQuestionResponse("");
    await streamArgument(questionTarget, judgeQuestion);
    setIsAskingQuestion(false);
    setJudgeQuestion("");
  };

  // Phase transition handlers
  const startProsecution = () => {
    setPhase("prosecution");
    setProsecutionArg("");
    setTimeout(() => streamArgument("prosecution"), 500);
  };

  const startDefense = () => {
    setPhase("defense");
    setDefenseArg("");
    setTimeout(() => streamArgument("defense"), 500);
  };

  const startDeliberation = () => {
    setPhase("deliberation");
  };

  // Scroll to bottom when content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [prosecutionArg, defenseArg, questionResponse, phase]);

  // Theme-aware colors
  const accentColor = isStoic ? "#ffffff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))";
  const accentBg = isStoic ? "rgba(255,255,255,0.04)" : isOcean ? ocean.deepBlue + "10" : "hsl(var(--primary) / 0.08)";
  const cardBg = isStoic ? "rgba(255,255,255,0.03)" : isOcean ? "#ffffff" : "hsl(var(--card))";
  const cardBorder = isStoic ? "rgba(255,255,255,0.06)" : isOcean ? ocean.seafoam + "40" : "hsl(var(--border) / 0.4)";
  const mutedText = isStoic ? "rgba(255,255,255,0.35)" : isOcean ? ocean.turquoise : "hsl(var(--muted-foreground))";
  const headingColor = isStoic ? "#ffffff" : isOcean ? ocean.deepBlue : "hsl(var(--foreground))";
  const bodyText = isStoic ? "rgba(255,255,255,0.7)" : isOcean ? ocean.deepBlue + "dd" : "hsl(var(--foreground) / 0.8)";
  const prosecutionColor = isStoic ? "#ff4444" : isOcean ? "#c0392b" : "#dc2626";
  const defenseColor = isStoic ? "#44ff44" : isOcean ? "#27ae60" : "#16a34a";
  const sandHighlight = isOcean ? ocean.sand : isStoic ? "rgba(255,255,255,0.08)" : "hsl(var(--secondary))";

  if (error) {
    return (
      <div className={`phone-container min-h-screen flex flex-col bg-background ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
        <div className="flex-1 flex items-center justify-center px-7">
          <div className="text-center">
            <p className="text-lg mb-4" style={{ color: headingColor }}>Court is not in session</p>
            <p className="text-sm mb-6" style={{ color: mutedText }}>{error}</p>
            <button onClick={fetchDailyCase} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ background: accentColor, color: isStoic ? "#000" : "#fff" }}>
              Try Again
            </button>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background relative overflow-hidden ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
      {/* Background */}
      {isStoic ? (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-950" />
      ) : isOcean ? (
        <div className="absolute top-0 left-0 right-0 h-[200px]" style={{
          background: `linear-gradient(180deg, ${ocean.deepBlue} 0%, ${ocean.brightTeal} 50%, ${ocean.sand}30 100%)`
        }} />
      ) : null}

      <div ref={scrollRef} className="relative z-10 flex-1 flex flex-col px-7 pt-12 pb-4 overflow-y-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate("/home")} className="text-sm opacity-50 hover:opacity-80" style={{ color: headingColor }}>
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: prosecutionColor }} />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: mutedText }}>
                {phase === "loading" ? "LOADING" : "COURT IN SESSION"}
              </span>
            </div>
          </div>
          {isStoic ? (
            <h1 className="stoic-text text-[32px] tracking-[0.04em]" style={{ color: headingColor }}>MORAL COURT</h1>
          ) : (
            <h1 className="font-serif text-3xl" style={{ color: headingColor }}>Daily Moral Court</h1>
          )}
          <p className="text-xs mt-1" style={{ color: mutedText }}>
            {courtCase?.case_date ? new Date(courtCase.case_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Today's Case"}
          </p>
        </motion.div>

        {/* Loading */}
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `${accentColor}20`, borderTopColor: accentColor }} />
                <p className="text-sm" style={{ color: mutedText }}>Preparing today's case...</p>
              </div>
            </motion.div>
          )}

          {/* Case Presentation */}
          {phase === "case" && courtCase && (
            <motion.div key="case" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1">
              {/* Category badge */}
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider mb-4"
                style={{ background: sandHighlight, color: isStoic ? "#fff" : ocean.deepBlue, border: isOcean ? `1px solid ${ocean.seafoam}` : undefined }}>
                {courtCase.category}
              </div>

              {/* Case title */}
              <h2 className={`text-2xl mb-4 ${isStoic ? "stoic-text tracking-[0.03em]" : "font-serif"}`} style={{ color: headingColor }}>
                {isStoic ? courtCase.title.toUpperCase() : courtCase.title}
              </h2>

              {/* Scenario */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-sm leading-relaxed" style={{ color: bodyText }}>{courtCase.scenario}</p>
              </div>

              {/* Defendant & Charge */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: accentBg, border: `1px solid ${cardBorder}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg" style={{ background: isStoic ? "rgba(255,255,255,0.06)" : ocean.deepBlue + "15", color: headingColor }}>
                    ⚖
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: mutedText }}>Defendant</p>
                    <p className="text-sm font-medium mb-2" style={{ color: headingColor }}>{courtCase.defendant}</p>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: mutedText }}>Charge</p>
                    <p className="text-sm" style={{ color: bodyText }}>{courtCase.charge}</p>
                  </div>
                </div>
              </div>

              {/* Prosecution & Defense preview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl p-4" style={{ background: prosecutionColor + "10", border: `1px solid ${prosecutionColor}25` }}>
                  <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: prosecutionColor }}>Prosecution</p>
                  <p className="text-xs font-medium" style={{ color: headingColor }}>{getPhilosopherName(courtCase.prosecution.philosopher)}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: defenseColor + "10", border: `1px solid ${defenseColor}25` }}>
                  <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: defenseColor }}>Defense</p>
                  <p className="text-xs font-medium" style={{ color: headingColor }}>{getPhilosopherName(courtCase.defense.philosopher)}</p>
                </div>
              </div>

              {/* Begin button */}
              <motion.button onClick={startProsecution} whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl text-sm font-medium tracking-wider uppercase"
                style={{
                  background: isStoic ? "#fff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))",
                  color: isStoic ? "#000" : "#fff",
                }}>
                {isStoic ? "HEAR THE PROSECUTION" : "Hear the Prosecution"}
              </motion.button>
            </motion.div>
          )}

          {/* Prosecution Argument */}
          {phase === "prosecution" && courtCase && (
            <motion.div key="prosecution" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif"
                  style={{ background: prosecutionColor + "20", color: prosecutionColor, border: `2px solid ${prosecutionColor}40` }}>
                  {getPhilosopherInitials(courtCase.prosecution.philosopher)}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: prosecutionColor }}>Prosecution</p>
                  <p className="text-sm font-medium" style={{ color: headingColor }}>{getPhilosopherName(courtCase.prosecution.philosopher)}</p>
                </div>
                {isStreaming && <div className="w-2 h-2 rounded-full animate-pulse ml-auto" style={{ background: prosecutionColor }} />}
              </div>

              <div className="rounded-2xl p-5 mb-4 min-h-[120px]" style={{ background: prosecutionColor + "08", border: `1px solid ${prosecutionColor}20` }}>
                <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                  {prosecutionArg || <span className="animate-pulse" style={{ color: mutedText }}>The prosecution prepares their argument...</span>}
                </p>
              </div>

              {/* Judge question area */}
              {!isStreaming && prosecutionArg && (
                <>
                  {questionResponse && questionTarget === "prosecution" && (
                    <div className="rounded-2xl p-4 mb-4" style={{ background: prosecutionColor + "05", border: `1px solid ${prosecutionColor}15` }}>
                      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: prosecutionColor }}>Response to your question</p>
                      <p className="text-sm leading-relaxed" style={{ color: bodyText }}>{questionResponse}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mb-4">
                    <input
                      value={judgeQuestion}
                      onChange={e => setJudgeQuestion(e.target.value)}
                      placeholder="Ask the prosecution a question..."
                      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: headingColor }}
                      onKeyDown={e => { if (e.key === "Enter") { setQuestionTarget("prosecution"); askQuestion(); } }}
                    />
                    <button
                      onClick={() => { setQuestionTarget("prosecution"); askQuestion(); }}
                      disabled={!judgeQuestion.trim() || isAskingQuestion}
                      className="px-4 py-3 rounded-xl text-sm"
                      style={{ background: prosecutionColor + "20", color: prosecutionColor, opacity: judgeQuestion.trim() ? 1 : 0.4 }}>
                      Ask
                    </button>
                  </div>

                  <motion.button onClick={startDefense} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl text-sm font-medium tracking-wider uppercase"
                    style={{
                      background: isStoic ? "#fff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))",
                      color: isStoic ? "#000" : "#fff",
                    }}>
                    {isStoic ? "HEAR THE DEFENSE" : "Hear the Defense"}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* Defense Argument */}
          {phase === "defense" && courtCase && (
            <motion.div key="defense" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif"
                  style={{ background: defenseColor + "20", color: defenseColor, border: `2px solid ${defenseColor}40` }}>
                  {getPhilosopherInitials(courtCase.defense.philosopher)}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: defenseColor }}>Defense</p>
                  <p className="text-sm font-medium" style={{ color: headingColor }}>{getPhilosopherName(courtCase.defense.philosopher)}</p>
                </div>
                {isStreaming && <div className="w-2 h-2 rounded-full animate-pulse ml-auto" style={{ background: defenseColor }} />}
              </div>

              <div className="rounded-2xl p-5 mb-4 min-h-[120px]" style={{ background: defenseColor + "08", border: `1px solid ${defenseColor}20` }}>
                <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                  {defenseArg || <span className="animate-pulse" style={{ color: mutedText }}>The defense prepares their argument...</span>}
                </p>
              </div>

              {!isStreaming && defenseArg && (
                <>
                  {questionResponse && questionTarget === "defense" && (
                    <div className="rounded-2xl p-4 mb-4" style={{ background: defenseColor + "05", border: `1px solid ${defenseColor}15` }}>
                      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: defenseColor }}>Response to your question</p>
                      <p className="text-sm leading-relaxed" style={{ color: bodyText }}>{questionResponse}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mb-4">
                    <input
                      value={judgeQuestion}
                      onChange={e => setJudgeQuestion(e.target.value)}
                      placeholder="Ask the defense a question..."
                      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: headingColor }}
                      onKeyDown={e => { if (e.key === "Enter") { setQuestionTarget("defense"); askQuestion(); } }}
                    />
                    <button
                      onClick={() => { setQuestionTarget("defense"); askQuestion(); }}
                      disabled={!judgeQuestion.trim() || isAskingQuestion}
                      className="px-4 py-3 rounded-xl text-sm"
                      style={{ background: defenseColor + "20", color: defenseColor, opacity: judgeQuestion.trim() ? 1 : 0.4 }}>
                      Ask
                    </button>
                  </div>

                  <motion.button onClick={startDeliberation} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl text-sm font-medium tracking-wider uppercase"
                    style={{
                      background: isStoic ? "#fff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))",
                      color: isStoic ? "#000" : "#fff",
                    }}>
                    {isStoic ? "DELIVER YOUR VERDICT" : "Deliver Your Verdict"}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* Deliberation — verdict selection */}
          {phase === "deliberation" && courtCase && (
            <motion.div key="deliberation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⚖️</div>
                <h2 className={`text-xl mb-2 ${isStoic ? "stoic-text tracking-[0.03em]" : "font-serif"}`} style={{ color: headingColor }}>
                  {isStoic ? "YOUR VERDICT" : "Your Verdict"}
                </h2>
                <p className="text-xs" style={{ color: mutedText }}>Consider both arguments carefully before ruling</p>
              </div>

              {/* Verdict options */}
              <div className="flex flex-col gap-3 mb-6">
                {(courtCase.verdict_options || []).map((opt) => (
                  <motion.button key={opt.label} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVerdict(opt.label)}
                    className="rounded-2xl p-5 text-left transition-all"
                    style={{
                      background: selectedVerdict === opt.label
                        ? (isStoic ? "rgba(255,255,255,0.08)" : isOcean ? ocean.deepBlue + "12" : "hsl(var(--primary) / 0.1)")
                        : cardBg,
                      border: `2px solid ${selectedVerdict === opt.label
                        ? (isStoic ? "rgba(255,255,255,0.3)" : isOcean ? ocean.deepBlue : "hsl(var(--primary))")
                        : cardBorder}`,
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: selectedVerdict === opt.label ? accentColor : cardBorder }}>
                        {selectedVerdict === opt.label && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: accentColor }} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: headingColor }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: mutedText }}>{opt.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Reasoning */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: mutedText }}>Your reasoning (optional)</p>
                <textarea
                  value={reasoning}
                  onChange={e => setReasoning(e.target.value)}
                  placeholder="Explain your verdict..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: headingColor }}
                />
              </div>

              {/* Submit */}
              <motion.button
                onClick={submitVerdict}
                disabled={!selectedVerdict}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl text-sm font-medium tracking-wider uppercase transition-opacity"
                style={{
                  background: isStoic ? "#fff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))",
                  color: isStoic ? "#000" : "#fff",
                  opacity: selectedVerdict ? 1 : 0.4,
                }}>
                {isStoic ? "SUBMIT VERDICT" : "Submit Verdict"}
              </motion.button>
            </motion.div>
          )}

          {/* Results — community stats */}
          {phase === "results" && courtCase && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏛️</div>
                <h2 className={`text-xl mb-2 ${isStoic ? "stoic-text tracking-[0.03em]" : "font-serif"}`} style={{ color: headingColor }}>
                  {isStoic ? "VERDICT DELIVERED" : "Verdict Delivered"}
                </h2>
                <p className="text-sm" style={{ color: mutedText }}>
                  You ruled: <strong style={{ color: headingColor }}>{selectedVerdict || existingVerdict}</strong>
                </p>
              </div>

              {/* Your reasoning */}
              {reasoning && (
                <div className="rounded-2xl p-5 mb-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: mutedText }}>Your Reasoning</p>
                  <p className="text-sm italic leading-relaxed" style={{ color: bodyText }}>"{reasoning}"</p>
                </div>
              )}

              {/* Community Stats */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: accentBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-4" style={{ color: mutedText }}>
                  Community Verdicts · {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                </p>
                {(courtCase.verdict_options || []).map((opt) => {
                  const stat = communityStats[opt.label];
                  const pct = stat?.percentage || 0;
                  const isUserChoice = (selectedVerdict || existingVerdict) === opt.label;
                  return (
                    <div key={opt.label} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm" style={{ color: headingColor, fontWeight: isUserChoice ? 600 : 400 }}>
                          {opt.label} {isUserChoice && "← You"}
                        </span>
                        <span className="text-sm font-medium" style={{ color: accentColor }}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: isStoic ? "rgba(255,255,255,0.06)" : isOcean ? ocean.seafoam + "30" : "hsl(var(--muted))" }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          style={{
                            background: isUserChoice
                              ? (isStoic ? "#fff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))")
                              : (isStoic ? "rgba(255,255,255,0.2)" : isOcean ? ocean.turquoise : "hsl(var(--primary) / 0.4)"),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Case summary */}
              <div className="rounded-2xl p-5 mb-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: mutedText }}>Case Summary</p>
                <p className="text-sm mb-3" style={{ color: bodyText }}>{courtCase.scenario}</p>
                <div className="flex gap-2 flex-wrap">
                  {(courtCase.moral_dimensions || []).map(dim => (
                    <span key={dim} className="px-2 py-1 rounded-full text-[10px]"
                      style={{ background: sandHighlight, color: isStoic ? "#fff" : ocean.deepBlue }}>
                      {dim}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button onClick={() => navigate("/home")}
                  className="flex-1 py-3 rounded-xl text-sm"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: headingColor }}>
                  Home
                </button>
                <button onClick={() => navigate("/court/history")}
                  className="flex-1 py-3 rounded-xl text-sm"
                  style={{ background: isStoic ? "#fff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))", color: isStoic ? "#000" : "#fff" }}>
                  {isStoic ? "JUDICIAL RECORD" : "Judicial Record"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <TabBar />
    </div>
  );
};

export default MoralCourt;
