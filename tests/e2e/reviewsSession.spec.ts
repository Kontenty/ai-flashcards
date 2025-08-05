import dotenv from "dotenv";
import path from "node:path";
import { test, expect } from "@playwright/test";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

test.describe("Reviews Session E2E Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("returns 200 with cards when cards are available", async ({ page }) => {
    // This test assumes there are cards available for review
    // The actual response will depend on the database state
    const response = await page.request.get("/api/reviews/session");

    // Should return either 200 with cards or 204 if no cards due
    expect([200, 204]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("cards");
      expect(Array.isArray(data.cards)).toBe(true);

      if (data.cards.length > 0) {
        const card = data.cards[0];
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("front");
        expect(card).toHaveProperty("back");
        expect(card).toHaveProperty("interval");
        expect(card).toHaveProperty("ease_factor");
      }
    }
  });
});
