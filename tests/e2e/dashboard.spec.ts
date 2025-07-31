import dotenv from "dotenv";
import path from "path";
import { test, expect } from "@playwright/test";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

test.describe("Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Stub total flashcards
    await page.route("**/api/flashcards?page=1&pageSize=1**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ pagination: { total: 5 } }),
      });
    });
    // Stub recent flashcards
    await page.route("**/api/flashcards?page=1&pageSize=5**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ id: "1", front: "Q1", back: "A1", tags: [] }],
          pagination: { page: 1, pageSize: 5, total: 1 },
        }),
      });
    });
    // Stub performance stats
    await page.route("**/api/stats/performance**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ totalReviewed: 10, correctPercent: 80 }),
      });
    });
    // Stub tag stats
    await page.route("**/api/stats/tags**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { tag: "tag1", count: 2 },
          { tag: "tag2", count: 3 },
        ]),
      });
    });
    // Stub due flashcards
    await page.route("**/api/reviews/session?history=14**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ date: "2025-01-01", reviews: 4 }]),
      });
    });
    await page.route("**/api/reviews/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ cards: [{ id: "1", front: "R1", interval: 1, easeFactor: 2.5 }] }),
      });
    });
    // Navigate to dashboard
    await page.goto("/dashboard");
    // Wait for network idle to ensure all data loaded
    await page.waitForLoadState("networkidle");
  });

  test("displays key stats", async ({ page }) => {
    // Verify stats tiles
    await expect(page.getByText("Łącznie fiszek")).toBeVisible();
    await expect(page.getByText("5")).toBeVisible();
    await expect(page.getByText("Łącznie recenzji")).toBeVisible();
    await expect(page.getByText("10")).toBeVisible();
    await expect(page.getByText("Poprawność")).toBeVisible();
    await expect(page.getByText("80%")).toBeVisible();
    await expect(page.getByText("Tagów")).toBeVisible();
    await expect(page.getByText("2")).toBeVisible();
  });

  test("lists recent and due flashcards and quick actions", async ({ page }) => {
    // Recent flashcards list
    await expect(page.getByText("Ostatnio dodane fiszki")).toBeVisible();
    await expect(page.getByText("Q1")).toBeVisible();
    // Due flashcards list
    await expect(page.getByText("Fiszki do powtórki")).toBeVisible();
    await expect(page.getByText("R1")).toBeVisible();
    // Quick actions
    await expect(page.getByText("Generuj AI")).toBeVisible();
    await expect(page.getByText("Dodaj fiszkę")).toBeVisible();
    await expect(page.getByText("Rozpocznij powtórkę")).toBeVisible();
  });
});
