import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { apiPost } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { ArrowLeft } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { glowColor } = useTheme();

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

  return (
    <div className="phone-container min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-7">
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center top, ${glowColor} 0%, transparent 70%)`, maskImage: "radial-gradient(ellipse at center top, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center top, black 20%, transparent 70%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/40 pointer-events-none" />
      <motion.div className="relative z-10 w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-serif text-[36px] text-foreground text-center mb-1">Aurelius</h1>
        <p className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 text-center mb-10">Thinking Lab</p>

        <AnimatePresence mode="wait">
          {mode === "forgot" ? (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {resetSent ? (
                <div className="text-center">
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="font-serif text-lg text-foreground mb-2">Check your email</h3>
                  <p className="text-xs text-foreground/40 font-light mb-6 leading-relaxed">
                    We sent a password reset link to <span className="text-foreground/70">{email}</span>. Click the link in the email to set a new password.
                  </p>
                  <button onClick={() => switchMode("login")}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <button type="button" onClick={() => switchMode("login")} className="flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground/60 transition-colors mb-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                  </button>
                  <h3 className="font-serif text-lg text-foreground -mt-2">Reset your password</h3>
                  <p className="text-xs text-foreground/40 font-light -mt-2">Enter your email and we'll send you a reset link.</p>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "signup" && (
                  <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
                )}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
                {mode === "login" && (
                  <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-foreground/40 text-right -mt-2 hover:text-foreground/60 transition-colors">
                    Forgot password?
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {loading ? "..." : mode === "login" ? "Enter" : "Join the Academy"}
                </button>
              </form>
              <button onClick={() => switchMode(mode === "login" ? "signup" : "login")} className="text-xs text-foreground/40 mt-6 text-center w-full hover:text-foreground/60 transition-colors">
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
