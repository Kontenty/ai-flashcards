import { describe, it, expect, vi } from "vitest";
import { createStatsService } from "@/lib/services/stats.service";

function createSupabaseStub() {
  const builder = {
    select: vi.fn(),
  } as unknown as Record<string, any>;

  const supabase = {
    rpc: vi.fn(),
    from: vi.fn().mockReturnValue(builder),
  } as unknown as Parameters<typeof createStatsService>[0];

  return { supabase, builder };
}

describe("StatsService.getPerformanceStats", () => {
  it("returns aggregated stats without daily data", async () => {
    const { supabase } = createSupabaseStub();

    supabase.rpc = vi.fn().mockResolvedValue({
      data: [{ total_reviews: 12, correct_percentage: 75.5 }],
      error: null,
    });

    // ensure daily query not executed
    supabase.from = vi.fn();

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

    supabase.rpc = vi.fn().mockResolvedValue({
      data: [{ total_reviews: 2, correct_percentage: 50 }],
      error: null,
    });

    // Mock daily stats query
    (builder.select as any).mockResolvedValueOnce({
      data: [
        {
          review_date: "2025-06-17",
          cards_reviewed: 5,
          mean_quality: 4.25,
        },
      ],
      error: null,
    });

    supabase.from = vi.fn().mockReturnValue(builder);

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u2", { includeDaily: true });

    expect(res.isSuccess).toBe(true);
    expect(res.value.dailyStats?.length).toBe(1);
    expect(res.value.dailyStats?.[0]).toMatchObject({
      reviewDate: "2025-06-17",
    });
  });

  it("returns Result.error when RPC fails", async () => {
    const { supabase } = createSupabaseStub();

    supabase.rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "rpc fail" },
    });

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u3");

    expect(res.isError).toBe(true);
    expect(res.error).toContain("rpc fail");
  });

  it("returns Result.error when daily query fails", async () => {
    const { supabase, builder } = createSupabaseStub();

    supabase.rpc = vi.fn().mockResolvedValue({
      data: [{ total_reviews: 0, correct_percentage: 0 }],
      error: null,
    });

    (builder.select as any).mockResolvedValueOnce({
      data: null,
      error: { message: "view error" },
    });

    supabase.from = vi.fn().mockReturnValue(builder);

    const service = createStatsService(supabase);
    const res = await service.getPerformanceStats("u4", { includeDaily: true });

    expect(res.isError).toBe(true);
    expect(res.error).toContain("view error");
  });
});
