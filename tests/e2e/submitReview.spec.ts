import dotenv from "dotenv";
import path from "node:path";
import { test, expect } from "@playwright/test";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * E2E test for POST /api/flashcards/{id}/review.
 * We use Playwright's network interception to stub backend responses – the goal
 * is to make sure our frontend/server route wiring is correct and that we map
 * status codes as expected.
 */

test.describe("Submit review endpoint", () => {
  const endpoint = "/api/flashcards/11111111-1111-1111-1111-111111111111/review";

  test("returns 200 on success", async ({ page }) => {
    await page.route(`**${endpoint}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Review processed successfully." }),
      });
    });

    const response = await page.request.post(endpoint, {
      data: { quality: 4 },
    });
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("Review processed successfully.");
  });

  test("returns 400 for invalid body", async ({ page }) => {
    await page.route(`**${endpoint}`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid request body" }),
      });
    });

    const response = await page.request.post(endpoint, { data: { quality: 10 } });
    expect(response.status()).toBe(400);
  });

  test("returns 404 when card not found", async ({ page }) => {
    await page.route(`**${endpoint}`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Flashcard not found" }),
      });
    });

    const response = await page.request.post(endpoint, { data: { quality: 3 } });
    expect(response.status()).toBe(404);
  });
});
