import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

const SESSION_ID = "writespeak-guest";

// Fallback local state when backend is not running
const defaultProgress = {
  sessionId: SESSION_ID,
  alphabetsDone: [],
  numbersDone: [],
  stars: 0,
  score: 0,
  streak: 0,
  accuracy: 100.0,
  correctCount: 0,
  totalAttempts: 0,
};

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("writespeak_progress");
      return saved ? JSON.parse(saved) : defaultProgress;
    } catch {
      return defaultProgress;
    }
  });

  const persist = useCallback((updated) => {
    setProgress(updated);
    localStorage.setItem("writespeak_progress", JSON.stringify(updated));
    // Best-effort backend sync
    api.markCorrect(SESSION_ID, "", "").catch(() => {});
  }, []);

  const markCorrect = useCallback(
    async (charType, charValue) => {
      const updated = { ...progress };

      if (charType === "alphabet" && !updated.alphabetsDone.includes(charValue)) {
        updated.alphabetsDone = [...updated.alphabetsDone, charValue];
      } else if (charType === "number" && !updated.numbersDone.includes(charValue)) {
        updated.numbersDone = [...updated.numbersDone, charValue];
      }

      updated.stars += 1;
      updated.score += 10;
      updated.correctCount += 1;
      updated.totalAttempts += 1;
      updated.streak += 1;
      updated.accuracy =
        updated.totalAttempts > 0
          ? Math.round((updated.correctCount / updated.totalAttempts) * 100)
          : 100;

      persist(updated);

      // Bonus: streak rewards
      if (updated.streak === 3) {
        updated.stars += 3;
        updated.score += 20;
      }
      if (charType === "alphabet" && updated.alphabetsDone.length === 26) {
        updated.stars += 10;
        updated.score += 100;
      }
      if (charType === "number" && updated.numbersDone.length === 10) {
        updated.stars += 5;
        updated.score += 50;
      }

      try {
        const data = await api.markCorrect(SESSION_ID, charType, charValue);
        setProgress(data);
        localStorage.setItem("writespeak_progress", JSON.stringify(data));
      } catch {
        // fallback already applied above
      }
    },
    [progress, persist]
  );

  const markWrong = useCallback(async () => {
    const updated = {
      ...progress,
      totalAttempts: progress.totalAttempts + 1,
      streak: 0,
    };
    updated.accuracy =
      updated.totalAttempts > 0
        ? Math.round((updated.correctCount / updated.totalAttempts) * 100)
        : 100;

    persist(updated);

    try {
      const data = await api.markWrong(SESSION_ID);
      setProgress(data);
      localStorage.setItem("writespeak_progress", JSON.stringify(data));
    } catch {
      // fallback already applied above
    }
  }, [progress, persist]);

  const level = Math.floor(progress.score / 100);

  const badges = [];
  if (progress.alphabetsDone.length >= 1) badges.push({ emoji: "🌱", label: "First Letter" });
  if (progress.stars >= 5)               badges.push({ emoji: "⭐", label: "Star Collector" });
  if (progress.streak >= 3)              badges.push({ emoji: "🔥", label: "On Fire!" });
  if (progress.alphabetsDone.length >= 13) badges.push({ emoji: "📚", label: "Half Way!" });
  if (progress.numbersDone.length >= 1)  badges.push({ emoji: "🔢", label: "Number Starter" });
  if (progress.alphabetsDone.length === 26 && progress.numbersDone.length === 10)
                                          badges.push({ emoji: "🏆", label: "Champion!" });

  return { progress, level, badges, markCorrect, markWrong };
}
