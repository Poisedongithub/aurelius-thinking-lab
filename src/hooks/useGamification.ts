import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLevelInfo, XP_REWARDS, ACHIEVEMENTS, type Achievement } from "@/lib/gamification";
import { philosophers } from "@/lib/philosophers";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface StreakData { current_streak: number; longest_streak: number; last_activity_date: string | null; }
interface XpData { total_xp: number; level: number; }

export const useGamification = () => {
  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0, last_activity_date: null });
  const [xp, setXp] = useState<XpData>({ total_xp: 0, level: 1 });
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const levelInfo = getLevelInfo(xp.total_xp);

  const load = useCallback(async () => {
    try {
      const [streakRes, xpRes, achRes] = await Promise.all([
        apiGet("user_streaks"),
        apiGet("user_xp"),
        apiGet("user_achievements"),
      ]);
      if (streakRes.data) setStreak(streakRes.data);
      if (xpRes.data) setXp(xpRes.data);
      if (achRes.data) setUnlockedIds(achRes.data.map((a: any) => a.achievement_id));
    } catch (e) {
      console.error("Failed to load gamification data:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addXp = useCallback(async (amount: number) => {
    const newTotal = xp.total_xp + amount;
    const newLevel = getLevelInfo(newTotal).level;
    await apiPost("user_xp", { total_xp: newTotal, level: newLevel });
    if (newLevel > xp.level && xp.level > 0) {
      const info = getLevelInfo(newTotal);
      toast(`Level Up! You're now a ${info.title}`, { icon: "🎉" });
      const newlyUnlocked = philosophers.filter((p) => p.unlockLevel > xp.level && p.unlockLevel <= newLevel);
      newlyUnlocked.forEach((p) => {
        setTimeout(() => { toast(`${p.name} unlocked!`, { description: p.school, icon: "🔓" }); }, 1500);
      });
    }
    setXp({ total_xp: newTotal, level: newLevel });
    return newTotal;
  }, [xp]);

  const recordActivity = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    if (streak.last_activity_date === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const isConsecutive = streak.last_activity_date === yesterday;
    const newStreak = isConsecutive ? streak.current_streak + 1 : 1;
    const newLongest = Math.max(streak.longest_streak, newStreak);
    const payload = { current_streak: newStreak, longest_streak: newLongest, last_activity_date: today };
    await apiPost("user_streaks", payload);
    setStreak({ ...payload });
    if (isConsecutive && newStreak > 1) {
      await addXp(XP_REWARDS.STREAK_BONUS);
      toast(`${newStreak}-day streak! +${XP_REWARDS.STREAK_BONUS} XP`, { icon: "🔥" });
    }
    await checkAndUnlock("streak_3", newStreak >= 3);
    await checkAndUnlock("streak_7", newStreak >= 7);
    await checkAndUnlock("streak_30", newStreak >= 30);
  }, [streak, addXp]);

  const checkAndUnlock = useCallback(async (achievementId: string, condition: boolean) => {
    if (!condition || unlockedIds.includes(achievementId)) return;
    try {
      await apiPost("user_achievements", { achievement_id: achievementId });
      const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (ach) toast(`${ach.icon} Achievement Unlocked: ${ach.name}`, { description: ach.description });
      setUnlockedIds((prev) => [...prev, achievementId]);
    } catch { /* already exists */ }
  }, [unlockedIds]);

  const onSparComplete = useCallback(async (roundScore: number, totalSpars: number, totalPoints: number, arenaPassed?: boolean) => {
    const xpGained = XP_REWARDS.SPAR_ROUND + roundScore * XP_REWARDS.SPAR_SCORE_MULT;
    await addXp(xpGained);
    await recordActivity();
    await checkAndUnlock("first_spar", totalSpars >= 1);
    await checkAndUnlock("spar_5", totalSpars >= 5);
    await checkAndUnlock("spar_20", totalSpars >= 20);
    await checkAndUnlock("score_100", totalPoints >= 100);
    await checkAndUnlock("score_500", totalPoints >= 500);
    if (arenaPassed) {
      try {
        const res = await apiGet("arena_progress/count_passed");
        const count = res.count || 0;
        await checkAndUnlock("arena_first", count >= 1);
        await checkAndUnlock("arena_10", count >= 10);
      } catch { /* ignore */ }
    }
  }, [addXp, recordActivity, checkAndUnlock]);

  const onDilemmaAnswer = useCallback(async (totalAnswered: number) => {
    await addXp(XP_REWARDS.DILEMMA_ANSWER);
    await recordActivity();
    await checkAndUnlock("first_dilemma", totalAnswered >= 1);
    await checkAndUnlock("dilemma_10", totalAnswered >= 10);
    await checkAndUnlock("dilemma_30", totalAnswered >= 30);
    await checkAndUnlock("dilemma_50", totalAnswered >= 50);
    await checkAndUnlock("dilemma_100", totalAnswered >= 100);
  }, [addXp, recordActivity, checkAndUnlock]);

  return { streak, xp, levelInfo, unlockedIds, loading, onSparComplete, onDilemmaAnswer, reload: load };
};
