import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useDashboardData } from "../../../src/hooks/useDashboardData";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";
import { vi, describe, it, beforeEach, expect } from "vitest";
vi.mock("../../../src/db/supabase.client", () => ({
  supabaseClient: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
  },
}));

function TestComponent() {
  const { data, loading, error } = useDashboardData();
  if (loading) {
    return <span>loading</span>;
  }
  if (error) {
    return <span>error: {error}</span>;
  }
  return <span>loaded: {data?.totalFlashcards}</span>;
}

describe("useDashboardData", () => {
  beforeEach(() => {
    // Supabase session is already mocked via module mock

    // Mock API endpoints
    server.use(
      http.get("/api/flashcards?page=1&pageSize=1", () =>
        HttpResponse.json({ pagination: { total: 5 } }),
      ),
      http.get("/api/flashcards?page=1&pageSize=5", () =>
        HttpResponse.json({ items: [], pagination: { page: 1, pageSize: 5, total: 0 } }),
      ),
      http.get("/api/stats/performance", () =>
        HttpResponse.json({ totalReviewed: 10, correctPercent: 80 }),
      ),
      http.get("/api/stats/tags", () => HttpResponse.json([{ tag: "math", count: 3 }])),
      http.get("/api/reviews/session", () =>
        HttpResponse.json({ cards: [{ id: "1", front: "Card 1", interval: 1, easeFactor: 2.5 }] }),
      ),
      http.get("/api/reviews/session?history=14", () =>
        HttpResponse.json([{ date: "2025-01-01", reviews: 2 }]),
      ),
    );
  });

  it("fetches and returns dashboard data", async () => {
    render(<TestComponent />);
    // initially loading
    expect(screen.getByText("loading")).toBeDefined();
    // after load
    await waitFor(() => {
      expect(screen.getByText("loaded: 5")).toBeDefined();
    });
  });
});
