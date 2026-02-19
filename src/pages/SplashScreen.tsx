import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { glowColor, theme } = useTheme();
  useEffect(() => { const timer = setTimeout(() => navigate("/home"), 3000); return () => clearTimeout(timer); }, [navigate]);

  const isStoic = theme === "original";
  const isOcean = theme === "ocean";

  if (isStoic) {
    return (
      <div className="phone-container min-h-screen flex flex-col items-center justify-end bg-black relative overflow-hidden cursor-pointer stoic-grain" onClick={() => navigate("/home")}>
        <div className="absolute inset-0">
          <img src="/images/stoic-hero.jpg" alt="" className="w-full h-full object-cover object-top opacity-50" style={{ filter: "grayscale(100%) contrast(1.2)" }} />
          <div className="stoic-overlay absolute inset-0" />
          <div className="stoic-vignette absolute inset-0" />
        </div>
        <motion.div className="relative z-10 text-center pb-24 px-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: "easeOut" }}>
          <motion.p className="stoic-text text-white/40 text-[11px] tracking-[0.5em] mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>DISCIPLINE IS DESTINY</motion.p>
          <h1 className="stoic-text text-[52px] leading-[0.95] text-white font-normal tracking-[0.04em]">BORN TO<br />CONQUER.</h1>
          <motion.div className="w-12 h-[1px] bg-white/20 mx-auto mt-6" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.8 }} />
          <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }}>
            <p className="font-serif text-[28px] text-white/80 tracking-[0.02em]">Aurelius</p>
            <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mt-1">Thinking Lab</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isOcean) {
    return (
      <div className="phone-container min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => navigate("/home")}
        style={{ background: "linear-gradient(180deg, #002a3d 0%, #003f5e 25%, #006895 50%, #0699ba 75%, #1ea5b0 100%)" }}>
        {/* Animated water light caustics */}
        <div className="absolute inset-0 opacity-20" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 30% 60%, hsla(191, 94%, 38%, 0.4) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 70% 40%, hsla(185, 71%, 40%, 0.3) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 80%, hsla(167, 30%, 66%, 0.2) 0%, transparent 50%)
          `
        }} />
        {/* Subtle wave lines */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 40px, hsla(191, 94%, 38%, 0.3) 40px, transparent 41px),
              repeating-linear-gradient(0deg, transparent, transparent 65px, hsla(185, 71%, 40%, 0.2) 65px, transparent 66px)
            `
          }}
        />
        {/* Bottom sand gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{
          background: "linear-gradient(to top, hsla(46, 17%, 85%, 0.08) 0%, transparent 100%)"
        }} />

        <motion.div className="relative z-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }}>
          {/* Decorative wave icon */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none">
              <path d="M4 20c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="#8ec2b7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M4 26c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="#0699ba" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <path d="M4 14c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="#1ea5b0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
          </motion.div>

          <h1 className="font-serif text-[42px] tracking-[0.06em] leading-tight" style={{ color: "#dfdcd2" }}>Aurelius</h1>
          <p className="text-[10px] tracking-[0.35em] uppercase mt-4" style={{ color: "#8ec2b7" }}>Thinking Lab</p>

          {/* Gradient divider using all 5 colors */}
          <motion.div
            className="h-[2px] w-16 mx-auto mt-6 rounded-full"
            style={{ background: "linear-gradient(90deg, #006895, #0699ba, #1ea5b0, #8ec2b7, #dfdcd2)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />

          <motion.p
            className="text-[10px] tracking-[0.2em] uppercase mt-5"
            style={{ color: "hsla(167, 30%, 66%, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            Dive Deeper
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="phone-container min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden cursor-pointer" onClick={() => navigate("/home")}>
      <div className="absolute inset-0 opacity-35" style={{ background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`, maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/80 pointer-events-none" />
      <motion.div className="relative z-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }}>
        <h1 className="font-serif text-[42px] tracking-[0.06em] leading-tight text-foreground">Aurelius</h1>
        <p className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 mt-4">Thinking Lab</p>
        <motion.div className="w-10 h-px bg-foreground/30 mx-auto mt-6" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6 }} />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
