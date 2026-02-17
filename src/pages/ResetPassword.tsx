import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { glowColor } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    // Also check if we already have a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
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

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="font-serif text-lg text-foreground mb-2">Password Updated</h3>
            <p className="text-xs text-foreground/40 font-light mb-6 leading-relaxed">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
            <button onClick={() => navigate("/auth")}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
              Go to Sign In
            </button>
          </div>
        ) : !sessionReady ? (
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="font-serif text-lg text-foreground mb-2">Verifying your link...</h3>
            <p className="text-xs text-foreground/40 font-light mb-6 leading-relaxed">
              Please wait while we verify your reset link. If this takes too long, try clicking the link in your email again.
            </p>
            <button onClick={() => navigate("/auth")}
              className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors">
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h3 className="font-serif text-lg text-foreground">Set a new password</h3>
            <p className="text-xs text-foreground/40 font-light -mt-2">Enter your new password below.</p>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full glass-card rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/50">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full glass-card rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder:text-foreground/25 font-light outline-none focus:border-foreground/30 transition-colors bg-transparent"
              />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/50">
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium mt-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
