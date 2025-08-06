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
      http.get("/api/flashcards", ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page");
        const pageSize = url.searchParams.get("pageSize");
        const sort = url.searchParams.get("sort");

        if (page === "1" && pageSize === "1") {
          return HttpResponse.json({
            items: [],
            pagination: {
              page: 1,
              pageSize: 1,
              totalItems: 5,
              totalPages: 5,
            },
          });
        }

        if (page === "1" && pageSize === "5" && sort === "created_desc") {
          return HttpResponse.json({
            items: [],
            pagination: {
              page: 1,
              pageSize: 5,
              totalItems: 0,
              totalPages: 0,
            },
          });
        }

        return HttpResponse.json({
          items: [],
          pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
        });
      }),
      http.get("/api/stats/performance", ({ request }) => {
        const url = new URL(request.url);
        const include = url.searchParams.get("include");

        if (include === "daily_stats") {
          return HttpResponse.json({
            totalReviews: 10,
            correctPercentage: 80,
            dailyStats: [
              {
                reviewDate: "2025-01-01",
                cardsReviewed: 2,
                meanQuality: 4.0,
              },
            ],
          });
        }

        return HttpResponse.json({
          totalReviews: 10,
          correctPercentage: 80,
        });
      }),
      http.get("/api/stats/tags", () =>
        HttpResponse.json([
          {
            tagId: "1",
            tagName: "math",
            cardCount: 3,
          },
        ]),
      ),
      http.get("/api/reviews/session", () =>
        HttpResponse.json({
          cards: [
            {
              id: "1",
              front: "Card 1",
              back: "Answer 1",
              interval: 1,
              ease_factor: 2.5,
            },
          ],
        }),
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
