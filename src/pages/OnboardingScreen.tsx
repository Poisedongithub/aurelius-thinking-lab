import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Brain, BookOpen, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Swords className="w-12 h-12" />,
    title: "Philosophical Sparring",
    subtitle: "Debate the greatest minds",
    description: "Challenge AI-powered philosophers like Marcus Aurelius, Socrates, Nietzsche, and Sun Tzu. Defend your ideas, sharpen your logic, and earn points for every argument.",
    accent: "from-amber-500/20 to-red-500/20",
  },
  {
    icon: <Brain className="w-12 h-12" />,
    title: "Moral Dilemmas",
    subtitle: "Discover your moral compass",
    description: "Face 30+ ethical scenarios that reveal your philosophical alignment. Are you a Utilitarian? A Kantian? A Virtue Ethicist? Your choices build a unique moral profile.",
    accent: "from-purple-500/20 to-blue-500/20",
  },
  {
    icon: <BookOpen className="w-12 h-12" />,
    title: "Philosophy Library",
    subtitle: "Explore the great traditions",
    description: "Dive into Stoicism, Existentialism, Taoism, and more. Learn the ideas that shaped civilization — then test them in the arena.",
    accent: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: <TrendingUp className="w-12 h-12" />,
    title: "Track Your Growth",
    subtitle: "See your mind evolve",
    description: "Earn XP, unlock new philosophers, maintain streaks, and watch your philosophical profile develop over time. Every debate and dilemma shapes who you become.",
    accent: "from-blue-500/20 to-cyan-500/20",
  },
];

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("aurelius-onboarded", "true");
      navigate("/auth");
    } else {
      setCurrent(current + 1);
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleSkip = () => {
    localStorage.setItem("aurelius-onboarded", "true");
    navigate("/auth");
  };

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background overflow-hidden ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
      {/* Skip button */}
      <div className="shrink-0 flex justify-end px-7 pt-6">
        <button
          onClick={handleSkip}
          className="text-[13px] text-foreground/30 tracking-wider uppercase hover:text-foreground/50 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon with gradient background */}
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${step.accent} flex items-center justify-center mb-8`}>
              <div className="text-foreground/70">
                {step.icon}
              </div>
            </div>

            {/* Step number */}
            <span className="text-[11px] text-foreground/20 tracking-[0.2em] uppercase mb-3">
              {current + 1} of {steps.length}
            </span>

            {/* Title */}
            <h1 className="font-serif text-[32px] leading-tight text-foreground mb-2">
              {step.title}
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] text-primary/70 font-light tracking-wide mb-6">
              {step.subtitle}
            </p>

            {/* Description */}
            <p className="text-[14px] text-foreground/40 font-light leading-[1.8] max-w-[320px]">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 px-7 pb-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-primary/60"
                  : i < current
                  ? "w-1.5 bg-primary/30"
                  : "w-1.5 bg-foreground/10"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`flex items-center gap-1 text-[13px] text-foreground/30 transition-colors ${
              current === 0 ? "opacity-0 pointer-events-none" : "hover:text-foreground/50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            {isLast ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
