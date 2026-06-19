import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const BASE = "http://localhost:8080/api";

const defaultProgress = {
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
  const { user, authFetch } = useAuth();
  const [progress, setProgress] = useState(defaultProgress);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authFetch(`${BASE}/progress`);
      const data = await res.json();
      setProgress(data);
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markCorrect = useCallback(
    async (charType, charValue) => {
      try {
        const res = await authFetch(`${BASE}/progress/correct`, {
          method: "POST",
          body: JSON.stringify({ charType, charValue }),
        });
        const data = await res.json();
        setProgress(data);
        return data;
      } catch (err) {
        console.error("Failed to mark correct:", err);
      }
    },
    [authFetch]
  );

  const markWrong = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/progress/wrong`, {
        method: "POST",
      });
      const data = await res.json();
      setProgress(data);
      return data;
    } catch (err) {
      console.error("Failed to mark wrong:", err);
    }
  }, [authFetch]);

  const awardBonus = useCallback(
    async (score, stars) => {
      try {
        const res = await authFetch(`${BASE}/progress/bonus`, {
          method: "POST",
          body: JSON.stringify({ score, stars }),
        });
        const data = await res.json();
        setProgress(data);
        return data;
      } catch (err) {
        console.error("Failed to award bonus:", err);
      }
    },
    [authFetch]
  );

  const level = Math.floor(progress.score / 100) + 1;

  const badges = [];
  if (progress.alphabetsDone.length >= 1) badges.push({ emoji: "🌱", label: "First Letter" });
  if (progress.stars >= 5)               badges.push({ emoji: "⭐", label: "Star Collector" });
  if (progress.streak >= 3)              badges.push({ emoji: "🔥", label: "On Fire!" });
  if (progress.alphabetsDone.length >= 13) badges.push({ emoji: "📚", label: "Half Way!" });
  if (progress.numbersDone.length >= 1)  badges.push({ emoji: "🔢", label: "Number Starter" });
  if (progress.alphabetsDone.length === 26 && progress.numbersDone.length === 10)
                                          badges.push({ emoji: "🏆", label: "Champion!" });

  return { progress, level, badges, loading, markCorrect, markWrong, awardBonus, refreshProgress: fetchProgress };
}
