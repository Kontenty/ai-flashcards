import type { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/lib/utils/result";
import type { PerformanceStatsDto, TagStatisticDto } from "@/types";

export function createStatsService(supabase: SupabaseClient) {
  return {
    async getTagStats(userId: string): Promise<Result<TagStatisticDto[], Error>> {
      const { data, error } = await supabase
        .from("tags")
        .select(
          `
            name,
            flashcard_tags(count)
          `,
        )
        .eq("flashcard_tags.flashcards.user_id", userId);

      if (error) {
        return Result.error(new Error(error.message));
      }

      const tagStats: TagStatisticDto[] = data
        .map((tag: { name: string; flashcard_tags: { count: number }[] }) => ({
          tag: tag.name,
          count: tag.flashcard_tags[0]?.count ?? 0,
        }))
        .filter((tag) => tag.count > 0);

      return Result.ok(tagStats);
    },

    async getPerformanceStats(userId: string): Promise<Result<PerformanceStatsDto, Error>> {
      const { data, error } = await supabase.rpc("get_performance_stats", {
        p_user_id: userId,
      });

      if (error) {
        return Result.error(new Error(error.message));
      }

      return Result.ok(data[0]);
    },
  };
}
