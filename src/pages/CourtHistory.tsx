import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";

const ocean = {
  deepBlue: "#006895",
  brightTeal: "#0699ba",
  turquoise: "#1ea5b0",
  seafoam: "#8ec2b7",
  sand: "#dfdcd2",
};

interface VerdictRecord {
  case_id: string;
  case_date: string;
  verdict: string;
  reasoning: string;
  case_title: string;
  case_category: string;
  created_at: string;
}

const CourtHistory = () => {
  const navigate = useNavigate();
  useAuth();
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";

  const [history, setHistory] = useState<VerdictRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const resp = await fetch("/api/court/history", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await resp.json();
      setHistory(data.data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate judicial stats
  const totalCases = history.length;
  const guiltyCount = history.filter(h => h.verdict === "Guilty").length;
  const notGuiltyCount = history.filter(h => h.verdict === "Not Guilty").length;
  const mercyCount = history.filter(h => h.verdict === "Guilty with Mercy").length;

  const getJudicialTitle = () => {
    if (totalCases === 0) return "Novice Judge";
    if (totalCases < 5) return "Apprentice Judge";
    if (totalCases < 15) return "Circuit Judge";
    if (totalCases < 30) return "High Court Justice";
    return "Supreme Justice";
  };

  const getMoralLeaning = () => {
    if (totalCases === 0) return "Undetermined";
    const strictRatio = guiltyCount / totalCases;
    if (strictRatio > 0.6) return "Strict Moralist";
    if (strictRatio < 0.3) return "Compassionate Advocate";
    if (mercyCount / totalCases > 0.3) return "Merciful Judge";
    return "Balanced Arbiter";
  };

  // Theme colors
  const headingColor = isStoic ? "#ffffff" : isOcean ? ocean.deepBlue : "hsl(var(--foreground))";
  const bodyText = isStoic ? "rgba(255,255,255,0.7)" : isOcean ? ocean.deepBlue + "dd" : "hsl(var(--foreground) / 0.8)";
  const mutedText = isStoic ? "rgba(255,255,255,0.35)" : isOcean ? ocean.turquoise : "hsl(var(--muted-foreground))";
  const cardBg = isStoic ? "rgba(255,255,255,0.03)" : isOcean ? "#ffffff" : "hsl(var(--card))";
  const cardBorder = isStoic ? "rgba(255,255,255,0.06)" : isOcean ? ocean.seafoam + "40" : "hsl(var(--border) / 0.4)";
  const accentColor = isStoic ? "#ffffff" : isOcean ? ocean.deepBlue : "hsl(var(--primary))";
  const sandHighlight = isOcean ? ocean.sand : isStoic ? "rgba(255,255,255,0.08)" : "hsl(var(--secondary))";

  const verdictColor = (v: string) => {
    if (v === "Guilty") return isStoic ? "#ff4444" : "#dc2626";
    if (v === "Not Guilty") return isStoic ? "#44ff44" : "#16a34a";
    return isStoic ? "#ffaa44" : "#f59e0b";
  };

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background relative overflow-hidden ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
      {isStoic ? (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-zinc-950" />
      ) : isOcean ? (
        <div className="absolute top-0 left-0 right-0 h-[200px]" style={{
          background: `linear-gradient(180deg, ${ocean.deepBlue} 0%, ${ocean.brightTeal} 50%, ${ocean.sand}30 100%)`
        }} />
      ) : null}

      <div className="relative z-10 flex-1 flex flex-col px-7 pt-12 pb-4 overflow-y-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm opacity-50 hover:opacity-80 mb-3" style={{ color: headingColor }}>
            ← Back
          </button>
          {isStoic ? (
            <h1 className="stoic-text text-[32px] tracking-[0.04em]" style={{ color: headingColor }}>JUDICIAL RECORD</h1>
          ) : (
            <h1 className="font-serif text-3xl" style={{ color: headingColor }}>Judicial Record</h1>
          )}
          <p className="text-xs mt-1" style={{ color: mutedText }}>Your history of moral judgments</p>
        </motion.div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: `${accentColor}20`, borderTopColor: accentColor }} />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 mb-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: sandHighlight, border: isOcean ? `2px solid ${ocean.seafoam}` : undefined }}>
                  ⚖️
                </div>
                <div>
                  <p className={`text-lg font-medium ${isStoic ? "stoic-text" : "font-serif"}`} style={{ color: headingColor }}>{getJudicialTitle()}</p>
                  <p className="text-xs" style={{ color: mutedText }}>{getMoralLeaning()} · {totalCases} cases judged</p>
                </div>
              </div>

              {/* Verdict breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ background: "#dc262610" }}>
                  <p className="text-xl font-bold" style={{ color: verdictColor("Guilty") }}>{guiltyCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>Guilty</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: "#16a34a10" }}>
                  <p className="text-xl font-bold" style={{ color: verdictColor("Not Guilty") }}>{notGuiltyCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>Not Guilty</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: "#f59e0b10" }}>
                  <p className="text-xl font-bold" style={{ color: verdictColor("Guilty with Mercy") }}>{mercyCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>Mercy</p>
                </div>
              </div>
            </motion.div>

            {/* Conviction rate bar */}
            {totalCases > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-5 mb-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: mutedText }}>Conviction Rate</p>
                <div className="h-3 rounded-full overflow-hidden flex" style={{ background: isStoic ? "rgba(255,255,255,0.06)" : isOcean ? ocean.seafoam + "20" : "hsl(var(--muted))" }}>
                  {guiltyCount > 0 && (
                    <div className="h-full" style={{ width: `${(guiltyCount / totalCases) * 100}%`, background: verdictColor("Guilty") }} />
                  )}
                  {mercyCount > 0 && (
                    <div className="h-full" style={{ width: `${(mercyCount / totalCases) * 100}%`, background: verdictColor("Guilty with Mercy") }} />
                  )}
                  {notGuiltyCount > 0 && (
                    <div className="h-full" style={{ width: `${(notGuiltyCount / totalCases) * 100}%`, background: verdictColor("Not Guilty") }} />
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px]" style={{ color: verdictColor("Guilty") }}>Strict</span>
                  <span className="text-[10px]" style={{ color: verdictColor("Not Guilty") }}>Lenient</span>
                </div>
              </motion.div>
            )}

            {/* Case History */}
            <p className={`text-sm uppercase tracking-wider mb-3 ${isStoic ? "stoic-text" : ""}`} style={{ color: mutedText }}>
              Past Rulings
            </p>

            {history.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: mutedText }}>No cases judged yet</p>
                <button onClick={() => navigate("/court")} className="mt-4 px-6 py-3 rounded-xl text-sm"
                  style={{ background: accentColor, color: isStoic ? "#000" : "#fff" }}>
                  {isStoic ? "ENTER THE COURT" : "Enter the Court"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-4">
                {history.map((record, i) => (
                  <motion.div key={record.case_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: headingColor }}>{record.case_title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: mutedText }}>
                          {record.case_category} · {new Date(record.case_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium shrink-0 ml-2"
                        style={{ background: verdictColor(record.verdict) + "15", color: verdictColor(record.verdict) }}>
                        {record.verdict}
                      </span>
                    </div>
                    {record.reasoning && (
                      <p className="text-xs italic leading-relaxed" style={{ color: bodyText }}>"{record.reasoning}"</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <TabBar />
    </div>
  );
};

export default CourtHistory;
