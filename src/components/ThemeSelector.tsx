import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { useTheme, themes, type ThemeId } from "@/hooks/useTheme";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="w-4 h-4 text-foreground/50" />
        <h4 className="font-serif text-base text-foreground/70">Color Theme</h4>
      </div>
      <div className="flex gap-3">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex-1 rounded-2xl p-3 border transition-all duration-300 ${
                isActive
                  ? "border-primary/60 ring-1 ring-primary/30"
                  : "border-border/40 hover:border-border/70"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {/* Preview circles */}
              <div className="flex justify-center gap-1.5 mb-2.5">
                <div
                  className="w-5 h-5 rounded-full border border-white/10"
                  style={{ backgroundColor: t.preview.bg }}
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/10"
                  style={{ backgroundColor: t.preview.accent }}
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/10"
                  style={{ backgroundColor: t.preview.text }}
                />
              </div>
              <div className="text-[11px] font-medium text-foreground/80 text-center leading-tight">
                {t.name}
              </div>
              <div className="text-[9px] text-foreground/35 text-center mt-0.5">
                {t.description}
              </div>
              {isActive && (
                <motion.div
                  className="flex justify-center mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="w-3.5 h-3.5 text-primary" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
