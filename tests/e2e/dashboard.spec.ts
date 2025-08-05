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
        body: JSON.stringify({ pagination: { totalItems: 5 } }),
      });
    });
    // Stub recent flashcards
    await page.route("**/api/flashcards?page=1&pageSize=5**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ id: "1", front: "Q1", back: "A1", tags: [] }],
          pagination: { page: 1, pageSize: 5, totalItems: 1 },
        }),
      });
    });
    // Stub performance stats
    await page.route("**/api/stats/performance**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ totalReviews: 10, correctPercentage: 80 }),
      });
    });
    // Stub tag stats
    await page.route("**/api/stats/tags**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { tagId: "1", tagName: "tag1", cardCount: 2 },
          { tagId: "2", tagName: "tag2", cardCount: 3 },
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
        body: JSON.stringify({ cards: [{ id: "1", front: "R1", interval: 1, ease_factor: 2.5 }] }),
      });
    });
    // Navigate to dashboard
    await page.goto("/dashboard");
    // Wait for network idle to ensure all data loaded
    await page.waitForLoadState("networkidle");
    // Wait for the dashboard to be fully loaded
    await page.waitForTimeout(1000);
  });

  test("displays key stats", async ({ page }) => {
    // Wait for stats to be visible and use more specific selectors
    await expect(page.getByText("Łącznie fiszek")).toBeVisible({ timeout: 10000 });

    // Find the stats tile containing "Łącznie fiszek" and check its value
    const totalFlashcardsTile = page.locator("div").filter({ hasText: "Łącznie fiszek" });
    await expect(totalFlashcardsTile.locator("span.text-2xl").getByText("5")).toBeVisible();

    await expect(page.getByText("Łącznie powtórek")).toBeVisible();
    await expect(page.getByText("10")).toBeVisible();
    await expect(page.getByText("Poprawność")).toBeVisible();
    // Find the stats tile containing "Poprawność" and check its value (allow for decimals)
    const correctTile = page.locator("div").filter({ hasText: "Poprawność" });
    await expect(correctTile.locator("span.text-2xl").getByText(/80(\.0)?%/)).toBeVisible();
    await expect(page.getByText("Tagów")).toBeVisible();
    // Find the stats tile containing "Tagów" and check its value
    const tagsTile = page.locator("div").filter({ hasText: "Tagów" });
    await expect(tagsTile.locator("span.text-2xl").getByText("2")).toBeVisible();
  });

  test("lists recent and due flashcards and quick actions", async ({ page }) => {
    // Wait for content to be visible
    await expect(page.getByText("Ostatnio dodane fiszki")).toBeVisible({ timeout: 10000 });
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
