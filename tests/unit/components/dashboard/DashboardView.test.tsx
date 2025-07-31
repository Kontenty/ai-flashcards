import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "../../../../tests/mocks/server";
import { http, HttpResponse } from "msw";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Add mock for Supabase client before other imports
vi.mock("@/db/supabase.client", () => ({
  supabaseClient: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
  },
}));

// Setup mock data for DashboardView
beforeEach(() => {
  server.use(
    http.get("/api/flashcards?page=1&pageSize=1", () =>
      HttpResponse.json({ pagination: { total: 3 } }),
    ),
    http.get("/api/flashcards?page=1&pageSize=5&sort=created_desc", () =>
      HttpResponse.json({
        items: [{ id: "1", front: "Q", back: "A", tags: [] }],
        pagination: { page: 1, pageSize: 5, total: 1 },
      }),
    ),
    http.get("/api/stats/performance", () =>
      HttpResponse.json({ totalReviewed: 20, correctPercent: 90 }),
    ),
    http.get("/api/stats/tags", () => HttpResponse.json([{ tag: "science", count: 4 }])),
    http.get("/api/reviews/session", () =>
      HttpResponse.json({ cards: [{ id: "1", front: "Q", interval: 2, ease_factor: 2.2 }] }),
    ),
    http.get("/api/reviews/session?history=14", () =>
      HttpResponse.json([{ date: "2025-06-01", reviews: 5 }]),
    ),
  );
});

describe("DashboardView", () => {
  it("renders correctly and matches snapshot after data loads", async () => {
    const { container } = render(<DashboardView />);
    // wait for stats to appear
    await waitFor(() => screen.getByText("Łącznie fiszek"));
    expect(container).toMatchSnapshot();
  });
});
