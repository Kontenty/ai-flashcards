import dotenv from "dotenv";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { FlashcardListPage } from "./page-objects/flashcardList.page";
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Test suite for FlashcardList component within GenerateFlashcardsView
test.describe("FlashcardList E2E Tests", () => {
  let flashcardListPage: FlashcardListPage;

  test.beforeEach(async ({ page }) => {
    // Stub generation API to return two flashcard suggestions
    await page.route("**/api/flashcards/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          suggestions: [
            { front: "Front 1", back: "Back 1" },
            { front: "Front 2", back: "Back 2" },
          ],
        }),
      });
    });

    // Navigate to the generate page and trigger generation
    await page.goto("/flashcards/generate");
    const textarea = page.getByPlaceholder("Enter your text here...");
    await textarea.click();
    await page.keyboard.type(
      "Testing flashcards generation with sufficiently long input to exceed minimum length",
      { delay: 20 },
    );
    const generateButton = page.getByTestId("generate-flashcards-button");
    await expect(generateButton).toBeEnabled({ timeout: 10000 });
    await generateButton.click();

    flashcardListPage = new FlashcardListPage(page);
    // Wait for the list container to appear
    await expect(flashcardListPage.list).toBeVisible();
  });

  test("displays generated flashcards", async () => {
    // Verify both flashcards are rendered with correct content
    await expect(flashcardListPage.getCard(0)).toBeVisible();
    await expect(flashcardListPage.getFront(0)).toHaveText("Front 1");
    await expect(flashcardListPage.getBack(0)).toHaveText("Back 1");

    await expect(flashcardListPage.getCard(1)).toBeVisible();
    await expect(flashcardListPage.getFront(1)).toHaveText("Front 2");
    await expect(flashcardListPage.getBack(1)).toHaveText("Back 2");
  });

  test("rejects a flashcard", async () => {
    // Click reject on the first card and confirm
    await flashcardListPage.rejectCard(0);
    await expect(flashcardListPage.rejectDialog).toBeVisible();
    await flashcardListPage.confirmReject();

    // The "Front 1" flashcard should no longer be present
    await expect(flashcardListPage.page.getByText("Front 1")).toHaveCount(0);
  });

  test("cancels rejection of a flashcard", async () => {
    // Open reject dialog and cancel
    await flashcardListPage.rejectCard(1);
    await expect(flashcardListPage.rejectDialog).toBeVisible();
    await flashcardListPage.cancelReject();

    // The second card should still be visible
    await expect(flashcardListPage.getCard(1)).toBeVisible();
  });

  test("bulk saves flashcards successfully", async ({ page }) => {
    // Stub bulk save API to succeed
    await page.route("**/api/flashcards", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    // Trigger bulk save flow
    await flashcardListPage.saveAll();
    await expect(flashcardListPage.bulkSaveDialog).toBeVisible();
    await flashcardListPage.confirmBulkSave();

    // After saving, user should be redirected to the flashcards list page
    await expect(page).toHaveURL("/flashcards");
    // The FlashcardTable header should be visible
    await expect(page.getByText("Front")).toBeVisible();
  });

  test("shows error on bulk save failure", async ({ page }) => {
    // Stub bulk save API to return an error
    await page.route("**/api/flashcards", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Server error" }),
      });
    });

    // Trigger bulk save flow
    await flashcardListPage.saveAll();
    await expect(flashcardListPage.bulkSaveDialog).toBeVisible();
    await flashcardListPage.confirmBulkSave();

    // Error alert should be displayed with correct message
    await expect(flashcardListPage.errorAlert).toBeVisible();
    await expect(flashcardListPage.errorAlert).toContainText("Server error");
  });
});
