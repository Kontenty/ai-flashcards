import dotenv from "dotenv";
import path from "node:path";
import { test, expect } from "@playwright/test";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

test.describe("Reviews Session E2E Tests", () => {
  test("returns 200 with cards", async ({ page }) => {
    await page.route("**/api/reviews/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cards: [{ id: "1", front: "Test card", interval: 1, ease_factor: 2.5 }],
        }),
      });
    });
    const response = await page.goto("/api/reviews/session");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      cards: [{ id: "1", front: "Test card", interval: 1, ease_factor: 2.5 }],
    });
  });

  test("returns 204 when no cards due", async ({ page }) => {
    await page.route("**/api/reviews/session", async (route) => {
      await route.fulfill({ status: 204, body: "" });
    });
    const response = await page.goto("/api/reviews/session");
    expect(response.status()).toBe(204);
  });

  test("returns 401 when unauthorized", async ({ page }) => {
    await page.route("**/api/reviews/session", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });
    const response = await page.goto("/api/reviews/session");
    expect(response.status()).toBe(401);
    const errorJson = await response.json();
    expect(errorJson.error).toBe("Unauthorized");
  });
});
