import { describe, it, expect, vi } from "vitest";
import { createReviewService, type SubmitReviewCommand } from "@/lib/services/review.service";

/**
 * Creates a lightweight stub of the Supabase JS client containing only the
 * members that the ReviewService interacts with. Each test can mutate the
 * spies to simulate various scenarios.
 */
function createSupabaseStub() {
  // Builder chain returned from supabase.from(...)
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
  };

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
    from: vi.fn().mockReturnValue(builder),
    rpc: vi.fn(),
  } as unknown as Parameters<typeof createReviewService>[0];

  return { supabase, builder };
}

describe("ReviewService", () => {
  describe("getDueFlashcards", () => {
    it("returns cards on success", async () => {
      const { supabase, builder } = createSupabaseStub();
      // Simulate DB returning data
      builder.select.mockReturnValueOnce({
        eq: () => ({
          lte: () => ({ data: [{ id: "c1", front: "F", back: "B" }], error: null }),
        }),
      });

      const service = createReviewService(supabase);
      const result = await service.getDueFlashcards();

      expect(result.isSuccess).toBe(true);
      expect(result.value[0]).toMatchObject({ id: "c1" });
    });

    it("propagates database errors via Result.error", async () => {
      const { supabase, builder } = createSupabaseStub();
      builder.select.mockReturnValueOnce({
        eq: () => ({ lte: () => ({ data: null, error: new Error("db fail") }) }),
      });

      const service = createReviewService(supabase);
      const result = await service.getDueFlashcards();

      expect(result.isError).toBe(true);
      expect(result.error).toContain("db fail");
    });
  });

  describe("processReview", () => {
    it("returns ok on success", async () => {
      const { supabase } = createSupabaseStub();
      supabase.rpc = vi.fn().mockResolvedValue({ error: null });

      const service = createReviewService(supabase);
      const cmd: SubmitReviewCommand = { flashcardId: "abc", quality: 4 };
      const result = await service.processReview(cmd);

      expect(supabase.rpc).toHaveBeenCalledWith("process_flashcard_review", {
        p_flashcard_id: "abc",
        p_quality: 4,
      });
      expect(result.isSuccess).toBe(true);
    });

    it("maps known error codes", async () => {
      const { supabase } = createSupabaseStub();
      supabase.rpc = vi.fn().mockResolvedValue({ error: { code: "22P02", message: "invalid" } });

      const service = createReviewService(supabase);
      const result = await service.processReview({ flashcardId: "x", quality: 3 });

      expect(result.isError).toBe(true);
      expect(result.error).toBe("Invalid flashcard ID");
    });
  });
});
