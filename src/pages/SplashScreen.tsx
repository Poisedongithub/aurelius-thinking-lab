import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { glowColor } = useTheme();
  useEffect(() => { const timer = setTimeout(() => navigate("/home"), 3000); return () => clearTimeout(timer); }, [navigate]);

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
