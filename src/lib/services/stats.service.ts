/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SupabaseClient } from "@supabase/supabase-js";
import { Result } from "@/lib/utils/result";
import type { PerformanceStatsDto, TagStatisticDto } from "@/types";

export function createStatsService(supabase: SupabaseClient) {
  return {
    async getPerformanceStats(userId: string): Promise<Result<PerformanceStatsDto, Error>> {
      const mockPerf: PerformanceStatsDto = { totalReviewed: 100, correctPercent: 85 };
      return Result.ok(mockPerf);
    },
  };
}
