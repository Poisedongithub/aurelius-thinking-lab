import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeId = "cherry-blossom" | "original" | "ocean";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  preview: { bg: string; accent: string; text: string };
}

export const themes: ThemeOption[] = [
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    description: "Pink & powder blue",
    preview: { bg: "#FBCDD6", accent: "#D63B6F", text: "#E85A82" },
  },
  {
    id: "original",
    name: "Original",
    description: "Black & white",
    preview: { bg: "#0a0a0a", accent: "#e6e6e6", text: "#ededed" },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Bondi blue & sand",
    preview: { bg: "#0b1e26", accent: "#c2956b", text: "#f2f2f2" },
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  glowColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "cherry-blossom",
  setTheme: () => {},
  glowColor: "hsl(340 62% 54%)",
});

const glowColors: Record<ThemeId, string> = {
  "cherry-blossom": "hsl(340 62% 54%)",
  "original": "hsl(0 0% 70%)",
  "ocean": "hsl(185 50% 55%)",
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem("aurelius-theme");
    return (saved as ThemeId) || "cherry-blossom";
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem("aurelius-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, glowColor: glowColors[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
