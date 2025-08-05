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

// Mock the lazy-loaded ActivityChart component
vi.mock("@/components/dashboard/ActivityChart", () => ({
  ActivityChart: vi.fn(() => <div data-testid="activity-chart">Activity Chart</div>),
}));

// Mock the CreateFlashcardModal component
vi.mock("@/components/flashcards/CreateFlashcardModal", () => ({
  CreateFlashcardModal: vi.fn(({ open }) =>
    open ? <div data-testid="create-flashcard-modal">Create Flashcard Modal</div> : null,
  ),
}));

// Setup mock data for DashboardView
beforeEach(() => {
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
            totalItems: 3,
            totalPages: 3,
          },
        });
      }

      if (page === "1" && pageSize === "5" && sort === "created_desc") {
        return HttpResponse.json({
          items: [
            {
              id: "1",
              front: "Test Question",
              back: "Test Answer",
              tags: [],
              next_review_date: null,
              ease_factor: 2.5,
              interval: 1,
            },
          ],
          pagination: {
            page: 1,
            pageSize: 5,
            totalItems: 1,
            totalPages: 1,
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
          totalReviews: 20,
          correctPercentage: 90,
          dailyStats: [
            {
              reviewDate: "2025-01-01",
              cardsReviewed: 5,
              meanQuality: 4.2,
            },
            {
              reviewDate: "2025-01-02",
              cardsReviewed: 3,
              meanQuality: 3.8,
            },
          ],
        });
      }

      return HttpResponse.json({
        totalReviews: 20,
        correctPercentage: 90,
      });
    }),
    http.get("/api/stats/tags", () =>
      HttpResponse.json([
        {
          tagId: "1",
          tagName: "science",
          cardCount: 4,
        },
        {
          tagId: "2",
          tagName: "math",
          cardCount: 2,
        },
      ]),
    ),
    http.get("/api/reviews/session", () =>
      HttpResponse.json({
        cards: [
          {
            id: "1",
            front: "Due Question",
            back: "Due Answer",
            interval: 2,
            ease_factor: 2.2,
          },
        ],
      }),
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

  it("displays loading state initially", () => {
    render(<DashboardView />);
    // Check for loading skeleton elements
    const skeletonElements = document.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("displays all stats tiles when data loads", async () => {
    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByText("Łącznie fiszek")).toBeInTheDocument();
      expect(screen.getByText("Łącznie powtórek")).toBeInTheDocument();
      expect(screen.getByText("Poprawność")).toBeInTheDocument();
      expect(screen.getByText("Tagów")).toBeInTheDocument();
    });

    // Check that values are displayed
    expect(screen.getByText("3")).toBeInTheDocument(); // total flashcards
    expect(screen.getByText("20")).toBeInTheDocument(); // total reviews
    expect(screen.getByText("90.0%")).toBeInTheDocument(); // correct percentage
    expect(screen.getByText("2")).toBeInTheDocument(); // number of tags
  });

  it("displays quick actions", async () => {
    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByText("Generuj AI")).toBeInTheDocument();
      expect(screen.getByText("Dodaj fiszkę")).toBeInTheDocument();
      expect(screen.getByText("Rozpocznij powtórkę")).toBeInTheDocument();
    });
  });

  it("displays recent and due flashcards sections", async () => {
    render(<DashboardView />);

    await waitFor(() => {
      // Check for recent flashcards section - it shows the flashcards when they exist
      expect(screen.getByText("Test Question")).toBeInTheDocument();
      expect(screen.getByText("Test Answer")).toBeInTheDocument();

      // Check for due flashcards section
      expect(screen.getByText("Due Question")).toBeInTheDocument();
      expect(screen.getByText("Interval: 2, EF: 2.2")).toBeInTheDocument();
    });
  });

  it("displays activity chart", async () => {
    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByTestId("activity-chart")).toBeInTheDocument();
    });
  });
});
