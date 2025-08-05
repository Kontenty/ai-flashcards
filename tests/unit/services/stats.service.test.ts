import { describe, it, expect, vi } from "vitest";
import { createStatsService } from "@/lib/services/stats.service";
import type { Mock } from "vitest";

function createSupabaseStub() {
  const builder = {
    select: vi.fn(),
  } as unknown as {
    select: Mock<
      (...args: string[]) => Promise<{
        data: { review_date: string; cards_reviewed: number; mean_quality: number }[] | null;
        error: { message: string } | null;
      }>
    >;
  };

  const supabase = {
    rpc: vi.fn(),
    from: vi.fn().mockReturnValue(builder),
  } as unknown as Parameters<typeof createStatsService>[0];

  return { supabase, builder };
}

describe("StatsService.getPerformanceStats", () => {
  it("returns aggregated stats without daily data", async () => {
    const { supabase } = createSupabaseStub();

    // Mock the get_performance_stats view query
    const mockSelect = vi.fn().mockResolvedValue({
      data: [{ total_reviews: 12, correct_percentage: 75.5 }],
      error: null,
    });

    supabase.from = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u1");

    expect(res.isSuccess).toBe(true);
    expect(res.value).toMatchObject({
      totalReviews: 12,
      correctPercentage: 75.5,
    });
    expect(res.value.dailyStats).toBeUndefined();
  });

  it("includes daily stats when requested", async () => {
    const { supabase, builder } = createSupabaseStub();

    // Mock the get_performance_stats view query
    const mockAggSelect = vi.fn().mockResolvedValue({
      data: [{ total_reviews: 2, correct_percentage: 50 }],
      error: null,
    });

    // Mock the daily_review_stats view query
    const mockDailySelect = vi.fn().mockResolvedValue({
      data: [
        {
          review_date: "2025-06-17",
          cards_reviewed: 5,
          mean_quality: 4.25,
        },
      ],
      error: null,
    });

    // Mock both from() calls
    supabase.from = vi
      .fn()
      .mockReturnValueOnce({ select: mockAggSelect }) // for get_performance_stats
      .mockReturnValueOnce({ select: mockDailySelect }); // for daily_review_stats

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u2", { includeDaily: true });

    expect(res.isSuccess).toBe(true);
    expect(res.value.dailyStats?.length).toBe(1);
    expect(res.value.dailyStats?.[0]).toMatchObject({
      reviewDate: "2025-06-17",
      cardsReviewed: 5,
      meanQuality: 4.25,
    });
  });

  it("returns Result.error when RPC fails", async () => {
    const { supabase } = createSupabaseStub();

    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "rpc fail" },
      }),
    });

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u3");

    expect(res.isError).toBe(true);
    expect(res.error).toContain("rpc fail");
  });

  it("returns Result.error when daily query fails", async () => {
    const { supabase } = createSupabaseStub();

    // Mock successful aggregate query
    const mockAggSelect = vi.fn().mockResolvedValue({
      data: [{ total_reviews: 0, correct_percentage: 0 }],
      error: null,
    });

    // Mock failed daily query
    const mockDailySelect = vi.fn().mockResolvedValue({
      data: [],
      error: { message: "view error" },
    });

    // Mock both from() calls
    supabase.from = vi
      .fn()
      .mockReturnValueOnce({ select: mockAggSelect }) // for get_performance_stats
      .mockReturnValueOnce({ select: mockDailySelect }); // for daily_review_stats

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u4", { includeDaily: true });

    expect(res.isError).toBe(true);
    expect(res.error).toContain("view error");
  });
});
