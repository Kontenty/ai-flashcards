import type { APIRoute } from "astro";
import type { PerformanceStatsDto } from "@/types";

// Disable prerendering for API routes
export const prerender = false;

// Handler for performance stats
export const GET: APIRoute = async () => {
  const stub: PerformanceStatsDto = {
    totalReviewed: 0,
    correctPercent: 0,
  };
  return new Response(JSON.stringify(stub), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
