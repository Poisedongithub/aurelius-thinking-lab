import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { apiPost } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { glowColor } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else {
        // Ensure profile exists on server
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
        // Create profile on server
        const name = displayName || email.split("@")[0];
        try { await apiPost("profiles", { display_name: name, avatar_initials: name.slice(0, 2).toUpperCase() }); } catch {}
        toast({ title: "Account created!", description: "You can now sign in." });
        navigate("/home");
      }
    }
    setLoading(false);
  };

  return (
    <div className="phone-container min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-7">
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center top, ${glowColor} 0%, transparent 70%)`, maskImage: "radial-gradient(ellipse at center top, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center top, black 20%, transparent 70%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/40 pointer-events-none" />
      <motion.div className="relative z-10 w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-serif text-[36px] text-foreground text-center mb-1">Aurelius</h1>
        <p className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 text-center mb-10">Thinking Lab</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="w-full glass-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? "..." : isLogin ? "Enter" : "Join the Academy"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="text-xs text-foreground/40 mt-6 text-center w-full hover:text-foreground/60 transition-colors">
          {isLogin ? "New to the academy? Create an account" : "Already a member? Sign in"}
        </button>
      </motion.div>
    </div>
  );
};

export default AuthPage;
