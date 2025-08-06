import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { Result } from "@/lib/utils/result";
import type { PerformanceStatsDto } from "@/types";

/**
 * Factory for statistics-related operations. Encapsulates all database access
 * needed by the *performance statistics* API so that the route handler can stay
 * completely framework-agnostic.
 */
export function createStatsService(db: SupabaseClient<Database>) {
  return {
    /**
     * Returns aggregated *performance statistics* for the supplied user.
     *
     * Aggregates are fetched from the Postgres RPC function
     * `get_performance_stats` which is expected to return a single row with the
     * following columns (snake_case):
     *   - total_reviews        (integer)
     *   - correct_percentage   (numeric)
     *
     * When `opts.includeDaily === true` an additional query against the view
     * `daily_review_stats` is executed in parallel.
     */
    async getPerformanceStats(
      userId: string,
      opts: { includeDaily?: boolean } = {},
    ): Promise<Result<PerformanceStatsDto, string>> {
      try {
        // 1. Run queries in parallel – Postgres will handle them concurrently
        const aggPromise = db
          .from("get_performance_stats")
          .select("total_reviews,correct_percentage");

        const dailyPromise = opts.includeDaily
          ? db.from("daily_review_stats").select("review_date,cards_reviewed,mean_quality")
          : Promise.resolve({ data: null, error: null });

        const [aggRes, dailyRes] = await Promise.all([aggPromise, dailyPromise]);

        // 2. Handle database-level errors early
        if (aggRes.error) {
          return Result.error(aggRes.error.message);
        }
        if (
          dailyRes &&
          "error" in dailyRes &&
          (dailyRes as { error?: { message: string } }).error
        ) {
          // Narrowing for the generic Postgres response shape
          // Handle possible null for dailyRes.error
          const errorMessage =
            (dailyRes as { error?: { message?: string } })?.error?.message ??
            "Unknown error occurred while fetching daily stats";
          return Result.error(errorMessage);
        }

        // 3. Map response to DTO
        const { total_reviews, correct_percentage } = (Array.isArray(aggRes.data) &&
          aggRes.data[0]) || {
          total_reviews: 0,
          correct_percentage: 0,
        };

        return Result.ok<PerformanceStatsDto, string>({
          totalReviews: total_reviews ?? 0,
          correctPercentage: Number(correct_percentage ?? 0),
          dailyStats: opts.includeDaily
            ? dailyRes?.data?.map((row) => ({
                reviewDate: row.review_date,
                cardsReviewed: row.cards_reviewed ?? 0,
                meanQuality: Number(row.mean_quality),
              }))
            : undefined,
        });
      } catch (err) {
        return Result.error(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
  };
}
