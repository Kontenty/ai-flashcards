import { createStatsService } from "@/lib/services/stats.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMock = {
  from: vi.fn(() => supabaseMock),
  select: vi.fn(() => supabaseMock),
  eq: vi.fn(),
  rpc: vi.fn(),
};

describe("StatsService", () => {
  let statsService: ReturnType<typeof createStatsService>;

  beforeEach(() => {
    statsService = createStatsService(supabaseMock as unknown as SupabaseClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getTagStats", () => {
    it("should return tag statistics for a user", async () => {
      const userId = "user-123";
      const mockTags = [
        { name: "TagA", flashcard_tags: [{ count: 10 }] },
        { name: "TagB", flashcard_tags: [{ count: 5 }] },
        { name: "TagC", flashcard_tags: [] },
      ];

      supabaseMock.eq.mockResolvedValue({ data: mockTags, error: null });

      const result = await statsService.getTagStats(userId);

      expect(supabaseMock.from).toHaveBeenCalledWith("tags");
      expect(supabaseMock.select).toHaveBeenCalled();
      expect(supabaseMock.eq).toHaveBeenCalledWith("flashcard_tags.flashcards.user_id", userId);
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual([
          { tag: "TagA", count: 10 },
          { tag: "TagB", count: 5 },
        ]);
      }
    });
  });

  describe("getPerformanceStats", () => {
    it("should return performance statistics for a user", async () => {
      const userId = "user-123";
      const mockStats = [{ totalReviewed: 100, correctPercent: 85 }];
      supabaseMock.rpc.mockResolvedValue({ data: mockStats, error: null });

      const result = await statsService.getPerformanceStats(userId);

      expect(supabaseMock.rpc).toHaveBeenCalledWith("get_performance_stats", { p_user_id: userId });
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual({ totalReviewed: 100, correctPercent: 85 });
      }
    });
  });
});
