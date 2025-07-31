import { reviewService } from "../../../src/lib/services/review.service";
import { supabaseClient } from "../../../src/db/supabase.client";
import { vi, describe, it, beforeEach, expect, type Mock } from "vitest";

vi.mock("../../../src/db/supabase.client", () => {
  return {
    supabaseClient: {
      from: vi.fn(),
    },
  };
});

describe("ReviewService.getDueCards", () => {
  const mockData = [{ id: "1", front: "Sample Card", interval: 5, ease_factor: 2.6 }];

  beforeEach(() => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (onFulfilled: (res: unknown) => void) => onFulfilled({ data: mockData, error: null }),
    };
    (supabaseClient.from as unknown as Mock).mockReturnValue(builder);
  });

  it("returns due cards when query succeeds", async () => {
    const cards = await reviewService.getDueCards("user123");
    expect(cards).toEqual(mockData);
  });

  it("throws an error when query fails", async () => {
    const errorBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (onFulfilled: (res: unknown) => void) =>
        onFulfilled({ data: null, error: new Error("DB error") }),
    };
    (supabaseClient.from as unknown as Mock).mockReturnValue(errorBuilder);
    await expect(reviewService.getDueCards("user123")).rejects.toThrow("DB error");
  });
});
