import dotenv from "dotenv";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { ReviewsPage } from "./page-objects/reviews.page";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

test.describe("Reviews Flow E2E Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    // Stub review session API for due cards and session
    await page.route("**/api/reviews/session*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cards: [{ id: "1", front: "Question1", back: "Answer1", interval: 1, ease_factor: 2.5 }],
        }),
      });
    });
    // Stub submit review API
    await page.route("**/api/flashcards/*/review", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Review recorded" }),
      });
    });
  });

  test("should complete a review session", async ({ page }) => {
    const reviewsPage = new ReviewsPage(page);
    await reviewsPage.goto();

    // Verify start panel
    await expect(reviewsPage.startPanelLoading).toBeVisible();
    await expect(reviewsPage.startPanelLoading).toBeHidden();
    // Now verify start panel is visible
    await expect(reviewsPage.startPanel).toBeVisible();

    // Act: start session
    await reviewsPage.startSession();

    // Card panel should appear
    await expect(reviewsPage.cardPanel).toBeVisible();

    // Flip card
    await reviewsPage.flipCard();
    // Rating button '5' should be enabled
    const ratingButton = page.getByRole("button", { name: "5" });
    await expect(ratingButton).toBeEnabled();

    // Rate the card
    await ratingButton.click();

    // Summary panel should appear
    await expect(reviewsPage.summaryPanel).toBeVisible();

    // Navigate back to dashboard
    await reviewsPage.goBackToDashboard();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
