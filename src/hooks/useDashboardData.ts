import { useState, useEffect, useCallback } from "react";
import type { DashboardData, ActivityPoint } from "../types/dashboard";
import type {
  FlashcardListResponseDto,
  PerformanceStatsDto,
  TagStatisticDto,
  ReviewSessionResponseDto,
} from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(undefined);
    try {
      const totalFetch = fetch(`/api/flashcards?page=1&pageSize=1`, { signal });
      const performanceFetch = fetch(`/api/stats/performance?include=daily_stats`, { signal });
      const tagsFetch = fetch(`/api/stats/tags`, { signal });
      const recentFetch = fetch(`/api/flashcards?page=1&pageSize=5&sort=created_desc`, {
        signal,
      });
      const dueFetch = fetch(`/api/reviews/session`, { signal });

      const [totalRes, performanceRes, tagsRes, recentRes, dueRes] = await Promise.all([
        totalFetch,
        performanceFetch,
        tagsFetch,
        recentFetch,
        dueFetch,
      ]);

      if (!totalRes.ok) throw new Error("Failed to load total flashcards");
      if (!performanceRes.ok) throw new Error("Failed to load performance stats");
      if (!tagsRes.ok) throw new Error("Failed to load tag stats");
      if (!recentRes.ok) throw new Error("Failed to load recent flashcards");
      if (!dueRes.ok) throw new Error("Failed to load due flashcards");

      const totalJson = (await totalRes.json()) as FlashcardListResponseDto;
      const performanceJson = (await performanceRes.json()) as PerformanceStatsDto;
      const tagsJson = (await tagsRes.json()) as TagStatisticDto[];
      const recentJson = (await recentRes.json()) as FlashcardListResponseDto;
      const dueJson = (await dueRes.json()) as ReviewSessionResponseDto;
      const activityJson: ActivityPoint[] = (performanceJson.dailyStats ?? []).map((d) => ({
        date: d.reviewDate,
        reviews: d.cardsReviewed,
      }));

      setData({
        totalFlashcards: totalJson.pagination.totalItems,
        stats: performanceJson,
        tagStats: tagsJson,
        recent: recentJson.items,
        due: dueJson.cards,
        activity: activityJson,
      });
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name !== "AbortError") {
        setError(e.message || "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return { data, loading, error, reload };
}
