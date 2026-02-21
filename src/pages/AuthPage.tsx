import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { apiPost } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { ArrowLeft } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

// Ocean palette
const ocean = {
  deepBlue: "#006895",
  brightTeal: "#0699ba",
  turquoise: "#1ea5b0",
  seafoam: "#8ec2b7",
  sand: "#dfdcd2",
};

// Cherry Blossom palette
const sakura = {
  deepPink: "#D6275A",
  mediumPink: "#E8527A",
  coralPink: "#F4A0B0",
  blush: "#F8C8D4",
  powderBlue: "#C5D1E0",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { glowColor, theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";
  const isCherry = theme === "cherry-blossom";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setResetSent(true);
        toast({ title: "Reset link sent", description: "Check your email for a password reset link." });
      }
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        try { await apiPost("profiles", { display_name: email.split("@")[0], avatar_initials: email.slice(0, 2).toUpperCase() }); } catch {}
        navigate("/home");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { display_name: displayName || email.split("@")[0] } },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        const name = displayName || email.split("@")[0];
        try { await apiPost("profiles", { display_name: name, avatar_initials: name.slice(0, 2).toUpperCase() }); } catch {}
        toast({ title: "Account created!", description: "You can now sign in." });
        navigate("/home");
      }
    }
    setLoading(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setResetSent(false);
  };

  const inputClass = isStoic
    ? "w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 font-light outline-none border border-white/[0.08] bg-white/[0.03] focus:border-white/20 transition-colors"
    : isOcean
    ? "w-full rounded-xl px-4 py-3 text-sm font-light outline-none transition-colors"
    : "w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent";

  const btnClass = isStoic
    ? "w-full bg-white text-black rounded-xl py-3 text-sm font-medium mt-2 hover:bg-white/90 transition-colors disabled:opacity-50 stoic-text tracking-[0.1em]"
    : isOcean
    ? "w-full rounded-xl py-3 text-sm font-medium mt-2 transition-colors disabled:opacity-50"
    : "w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50";

  // Ocean input: white bg with seafoam border on sand background
  const oceanInputStyle = isOcean ? {
    color: ocean.deepBlue,
    background: "rgba(255,255,255,0.75)",
    border: `1px solid ${ocean.seafoam}`,
    borderRadius: "0.75rem",
  } : {};

  const oceanInputFocusClass = isOcean ? "focus:border-[#0699ba] placeholder:text-[#8ec2b7]" : "";

  // Ocean button: deep blue bg with sand text
  const oceanBtnStyle = isOcean ? {
    background: ocean.deepBlue,
    color: ocean.sand,
  } : {};

  return (
    <div className={`phone-container min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-7 ${isStoic ? "stoic-grain" : ""}`}
      style={isOcean ? { background: `linear-gradient(180deg, ${ocean.brightTeal} 0%, ${ocean.seafoam} 40%, ${ocean.sand} 100%)` } : {}}>
      {/* Background */}
      {isStoic ? (
        <>
          <div className="absolute inset-0">
            <img src="/images/stoic-thinker-ai.jpg" alt="" className="w-full h-full object-cover object-top opacity-20" style={{ filter: "grayscale(100%) contrast(1.3)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />
            <div className="stoic-vignette absolute inset-0" />
          </div>
        </>
      ) : isOcean ? (
        <>
          {/* Ocean: calm horizon image as auth background */}
          <div className="absolute inset-0">
            <img src="/images/ocean-horizon.jpg" alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to top, ${ocean.sand}ee 0%, ${ocean.seafoam}80 40%, ${ocean.brightTeal}40 70%, transparent 100%)`
            }} />
          </div>
        </>
      ) : isCherry ? (
        <>
          {/* Cherry Blossom: dreamy pathway image as auth background */}
          <div className="absolute inset-0">
            <img src="/images/sakura-pathway.jpg" alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to top, ${sakura.blush}ee 0%, ${sakura.coralPink}80 40%, ${sakura.mediumPink}40 70%, transparent 100%)`
            }} />
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center top, ${glowColor} 0%, transparent 70%)`, maskImage: "radial-gradient(ellipse at center top, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center top, black 20%, transparent 70%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/40 pointer-events-none" />
        </>
      )}

      <motion.div className="relative z-10 w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {isStoic ? (
          <>
            <h1 className="stoic-text text-[44px] text-white text-center mb-0 tracking-[0.04em]">AURELIUS</h1>
            <p className="stoic-text text-[10px] tracking-[0.5em] text-white/30 text-center mb-10">THINKING LAB</p>
          </>
        ) : isOcean ? (
          <>
            {/* Wave icon */}
            <div className="flex justify-center mb-4">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <path d="M4 20c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke={ocean.deepBlue} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <path d="M4 26c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke={ocean.deepBlue} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
              </svg>
            </div>
            <h1 className="font-serif text-[36px] text-center mb-1" style={{ color: ocean.deepBlue }}>Aurelius</h1>
            <p className="text-[10px] tracking-[0.35em] uppercase text-center mb-10" style={{ color: ocean.deepBlue + "80" }}>Thinking Lab</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-[36px] text-foreground text-center mb-1">Aurelius</h1>
            <p className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 text-center mb-10">Thinking Lab</p>
          </>
        )}

        <AnimatePresence mode="wait">
          {mode === "forgot" ? (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {resetSent ? (
                <div className="text-center">
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className={`text-lg mb-2 ${isStoic ? "stoic-text text-white tracking-[0.04em]" : "font-serif"}`}
                    style={isOcean ? { color: ocean.deepBlue } : {}}>
                    {isStoic ? "CHECK YOUR EMAIL" : "Check your email"}
                  </h3>
                  <p className={`text-xs font-light mb-6 leading-relaxed ${isStoic ? "text-white/35" : ""}`}
                    style={isOcean ? { color: ocean.deepBlue + "90" } : {}}>
                    We sent a password reset link to <span style={isOcean ? { color: ocean.brightTeal } : {}} className={isStoic ? "text-white/60" : isOcean ? "" : "text-foreground/70"}>{email}</span>. Click the link in the email to set a new password.
                  </p>
                  <button onClick={() => switchMode("login")} className={btnClass} style={oceanBtnStyle}>
                    {isStoic ? "BACK TO SIGN IN" : "Back to Sign In"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <button type="button" onClick={() => switchMode("login")} className={`flex items-center gap-1 text-xs transition-colors mb-2 ${isStoic ? "text-white/30 hover:text-white/50" : ""}`}
                    style={isOcean ? { color: ocean.deepBlue + "80" } : {}}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                  </button>
                  <h3 className={`text-lg -mt-2 ${isStoic ? "stoic-text text-white tracking-[0.04em]" : "font-serif"}`}
                    style={isOcean ? { color: ocean.deepBlue } : {}}>
                    {isStoic ? "RESET YOUR PASSWORD" : "Reset your password"}
                  </h3>
                  <p className={`text-xs font-light -mt-2 ${isStoic ? "text-white/30" : ""}`}
                    style={isOcean ? { color: ocean.turquoise } : {}}>
                    Enter your email and we'll send you a reset link.
                  </p>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className={`${inputClass} ${oceanInputFocusClass}`} style={oceanInputStyle} />
                  <button type="submit" disabled={loading} className={btnClass} style={oceanBtnStyle}>
                    {loading ? "Sending..." : isStoic ? "SEND RESET LINK" : "Send Reset Link"}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "signup" && (
                  <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className={`${inputClass} ${oceanInputFocusClass}`} style={oceanInputStyle} />
                )}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className={`${inputClass} ${oceanInputFocusClass}`} style={oceanInputStyle} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className={`${inputClass} ${oceanInputFocusClass}`} style={oceanInputStyle} />
                {mode === "login" && (
                  <button type="button" onClick={() => switchMode("forgot")} className={`text-xs text-right -mt-2 transition-colors ${isStoic ? "text-white/25 hover:text-white/40" : ""}`}
                    style={isOcean ? { color: ocean.deepBlue + "70" } : {}}>
                    Forgot password?
                  </button>
                )}
                <button type="submit" disabled={loading} className={btnClass} style={oceanBtnStyle}>
                  {loading ? "..." : mode === "login" ? (isStoic ? "ENTER" : "Enter") : (isStoic ? "JOIN THE ACADEMY" : "Join the Academy")}
                </button>
              </form>
              <button onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className={`text-xs mt-6 text-center w-full transition-colors ${isStoic ? "text-white/25 hover:text-white/40" : ""}`}
                style={isOcean ? { color: ocean.deepBlue + "70" } : {}}>
                {mode === "login" ? "New to the academy? Create an account" : "Already a member? Sign in"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
