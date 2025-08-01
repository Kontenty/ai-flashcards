import type { APIRoute } from "astro";
import type { ReviewSessionResponseDto } from "@/types";
import { reviewService } from "@/lib/services/review.service";
import { logService } from "@/lib/services/log.service";

// Disable prerendering for API routes
export const prerender = false;

// Handler for review session (due cards)
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = locals.user.id;
  try {
    const cards = await reviewService.getDueCards(userId);
    const response: ReviewSessionResponseDto = { cards };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error(error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
