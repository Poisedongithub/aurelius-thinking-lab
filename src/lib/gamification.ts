export const XP_LEVELS = [
  { level: 1, xp: 0, title: "Novice Thinker" },
  { level: 2, xp: 50, title: "Curious Mind" },
  { level: 3, xp: 150, title: "Apprentice" },
  { level: 4, xp: 300, title: "Dialectician" },
  { level: 5, xp: 500, title: "Rhetorician" },
  { level: 6, xp: 800, title: "Philosopher I" },
  { level: 7, xp: 1200, title: "Philosopher II" },
  { level: 8, xp: 1800, title: "Philosopher III" },
  { level: 9, xp: 2500, title: "Sage" },
  { level: 10, xp: 3500, title: "Grand Philosopher" },
] as const;

export const getLevelInfo = (totalXp: number) => {
  let current: (typeof XP_LEVELS)[number] = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (totalXp >= lvl.xp) current = lvl;
    else break;
  }
  const nextLevel = XP_LEVELS.find((l) => l.level === current.level + 1);
  const xpInLevel = totalXp - current.xp;
  const xpForNext = nextLevel ? nextLevel.xp - current.xp : 0;
  const progress = nextLevel ? Math.min((xpInLevel / xpForNext) * 100, 100) : 100;
  return { ...current, nextLevel, progress, totalXp };
};

export const XP_REWARDS = {
  DILEMMA_ANSWER: 10,
  SPAR_ROUND: 5,
  SPAR_SCORE_MULT: 2,
  STREAK_BONUS: 15,
  ARENA_PASS: 50,
} as const;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_spar", name: "First Blood", description: "Complete your first sparring session", icon: "⚔️" },
  { id: "first_dilemma", name: "Moral Compass", description: "Answer your first dilemma", icon: "🧭" },
  { id: "dilemma_10", name: "Deep Thinker", description: "Answer 10 dilemmas", icon: "🤔" },
  { id: "dilemma_30", name: "Ethical Explorer", description: "Complete the base dilemma set", icon: "🔍" },
  { id: "dilemma_50", name: "Moral Philosopher", description: "Answer 50 dilemmas", icon: "📜" },
  { id: "dilemma_100", name: "Ethics Master", description: "Answer 100 dilemmas", icon: "🏛️" },
  { id: "spar_5", name: "Debater", description: "Complete 5 sparring sessions", icon: "💬" },
  { id: "spar_20", name: "Veteran", description: "Complete 20 sparring sessions", icon: "🎖️" },
  { id: "streak_3", name: "On Fire", description: "Maintain a 3-day streak", icon: "🔥" },
  { id: "streak_7", name: "Dedicated", description: "Maintain a 7-day streak", icon: "💎" },
  { id: "streak_30", name: "Philosopher's Habit", description: "Maintain a 30-day streak", icon: "👑" },
  { id: "arena_first", name: "Arena Victor", description: "Pass your first arena challenge", icon: "🏆" },
  { id: "arena_10", name: "Arena Champion", description: "Pass 10 arena challenges", icon: "⭐" },
  { id: "score_100", name: "Century", description: "Score 100+ total points in spars", icon: "💯" },
  { id: "score_500", name: "Luminary", description: "Score 500+ total points in spars", icon: "✨" },
];

export const getAchievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
