import { test, expect } from "@playwright/test";

test.describe("Stats API Endpoints", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("GET /api/stats/tags should return tag statistics", async ({ request }) => {
    const response = await request.get("/api/stats/tags");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("tag");
      expect(data[0]).toHaveProperty("count");
    }
  });

  test("GET /api/stats/performance should return performance statistics", async ({ request }) => {
    const response = await request.get("/api/stats/performance");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("totalReviews");
    expect(data).toHaveProperty("correctPercentage");
  });

  test("GET /api/stats/performance?include=daily_stats should include daily breakdown", async ({
    request,
  }) => {
    const response = await request.get("/api/stats/performance?include=daily_stats");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("dailyStats");
    if (data.dailyStats) {
      expect(Array.isArray(data.dailyStats)).toBe(true);
    }
  });
});
