import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { MoralityResult } from "@/lib/dilemmas";

const spectrumLabels: Record<string, [string, string]> = {
  compassion_vs_logic: ["Compassion", "Logic"], individual_vs_collective: ["Individual", "Collective"],
  rules_vs_outcomes: ["Rules", "Outcomes"], idealism_vs_pragmatism: ["Idealism", "Pragmatism"],
  mercy_vs_justice: ["Mercy", "Justice"],
};

const DilemmaResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as MoralityResult | undefined;

  if (!result) {
    return (<div className="phone-container min-h-screen flex items-center justify-center bg-background"><div className="text-center px-7"><p className="text-foreground/40 mb-4">No results to display</p><button onClick={() => navigate("/dilemma")} className="px-6 py-3 rounded-xl bg-foreground text-background text-sm">Take the Quiz</button></div></div>);
  }

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-7 pt-12 pb-10 flex flex-col">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-24 h-24 rounded-full border-2 border-foreground/20 mx-auto mb-5 flex items-center justify-center"><span className="font-serif text-[36px] text-foreground">{result.alignment[0]}</span></div>
          <h1 className="font-serif text-[32px] text-foreground leading-tight mb-2">{result.alignment}</h1>
          <p className="text-sm text-foreground/45 font-light leading-relaxed max-w-[300px] mx-auto">{result.alignmentDescription}</p>
        </motion.div>
        <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h3 className="font-serif text-lg text-foreground/70 mb-5">Your Moral Spectrum</h3>
          {Object.entries(result.spectrums).map(([key, value], i) => {
            const labels = spectrumLabels[key] || [key, key];
            const pct = ((value + 1) / 2) * 100;
            return (
              <motion.div key={key} className="mb-5 last:mb-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
                <div className="flex justify-between mb-1.5"><span className="text-[11px] text-foreground/40 font-light">{labels[0]}</span><span className="text-[11px] text-foreground/40 font-light">{labels[1]}</span></div>
                <div className="h-[6px] bg-foreground/8 rounded-full relative overflow-hidden">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-foreground/15" />
                  <motion.div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground/60 border border-foreground/30"
                    initial={{ left: "50%" }} animate={{ left: `${pct}%` }} transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }} style={{ marginLeft: "-6px" }} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <div className="mt-auto flex gap-3 pt-8">
          <button onClick={() => navigate("/profile")} className="flex-1 py-3.5 rounded-xl border border-border/40 text-foreground/60 text-sm font-light">View Profile</button>
          <button onClick={() => navigate("/dilemma")} className="flex-1 py-3.5 rounded-xl bg-foreground text-background text-sm font-medium">Retake Quiz</button>
        </div>
      </div>
    </div>
  );
};

export default DilemmaResults;
