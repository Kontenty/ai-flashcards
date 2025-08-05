import React from "react";
import { renderHook, act } from "@testing-library/react";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import { ReviewSessionProvider, useReviewSession } from "../../../src/hooks/useReviewSession";
import { describe, it, beforeEach, expect } from "vitest";

// Helper to wrap hooks with provider
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReviewSessionProvider>{children}</ReviewSessionProvider>
);

describe("useReviewSession", () => {
  beforeEach(() => {
    server.use(
      http.get("/api/reviews/session", () =>
        HttpResponse.json({
          cards: [{ id: "1", front: "Front", back: "Back", interval: 0, ease_factor: 2.5 }],
        }),
      ),
      http.post("/api/flashcards/1/review", () => HttpResponse.json({ message: "ok" })),
    );
  });

  it("starts session and rates a card", async () => {
    const { result } = renderHook(() => useReviewSession(), { wrapper });

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.state.cards.length).toBe(1);
    expect(result.current.state.currentIndex).toBe(0);

    // flip card
    act(() => {
      result.current.flip();
    });

    // rate
    await act(async () => {
      await result.current.rate(5);
    });

    expect(result.current.state.summary?.total).toBe(1);
    expect(result.current.state.summary?.averageQuality).toBe(5);
  });
});
