import { useState } from "react";
import { useTheme, themes, type ThemeId } from "@/hooks/useTheme";

const THEME_COLORS: Record<ThemeId, { ring: string; bg: string; label: string }> = {
  "cherry-blossom": { ring: "#D6275A", bg: "#D6275A", label: "Cherry Blossom" },
  "original": { ring: "#888888", bg: "#1a1a1a", label: "Dark Stoic" },
  "ocean": { ring: "#0699ba", bg: "#0699ba", label: "Ocean" },
  "steinberg": { ring: "#FF8C00", bg: "#FF8C00", label: "Steinberg Ultimate" },
};

export default function FloatingThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {/* Theme label tooltip */}
      {hoveredTheme && (
        <div
          className="px-3 py-1.5 rounded-lg text-[12px] font-mono tracking-wider whitespace-nowrap pointer-events-none transition-all duration-200"
          style={{
            background: "var(--t-bg-elevated)",
            border: "1px solid var(--t-border-hover)",
            color: "var(--t-text)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {THEME_COLORS[hoveredTheme].label}
        </div>
      )}

      {/* Expanded theme options */}
      {expanded && (
        <div
          className="flex flex-col gap-2 p-2.5 rounded-2xl transition-all duration-300"
          style={{
            background: "var(--t-bg-elevated)",
            border: "1px solid var(--t-border-hover)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 1px var(--t-border-hover)",
            backdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          {themes.map((t) => {
            const colors = THEME_COLORS[t.id];
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setExpanded(false);
                  setHoveredTheme(null);
                }}
                onMouseEnter={() => setHoveredTheme(t.id)}
                onMouseLeave={() => setHoveredTheme(null)}
                className="relative group transition-all duration-200"
                style={{ outline: "none" }}
                title={colors.label}
              >
                <div
                  className="w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: colors.bg,
                    border: isActive ? `3px solid ${colors.ring}` : "2px solid rgba(255,255,255,0.15)",
                    boxShadow: isActive
                      ? `0 0 12px ${colors.ring}50, 0 0 4px ${colors.ring}30`
                      : "0 2px 8px rgba(0,0,0,0.3)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {isActive && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group"
        style={{
          background: THEME_COLORS[theme].bg,
          border: `2px solid ${THEME_COLORS[theme].ring}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 16px ${THEME_COLORS[theme].ring}30`,
        }}
        title="Switch Theme"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
    </div>
  );
}
