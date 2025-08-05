import type { APIRoute } from "astro";
import { createReviewService } from "@/lib/services/review.service";
import { logService } from "@/lib/services/log.service";
import type { ReviewSessionResponseDto } from "@/types";

export const prerender = false;

/**
 * GET /api/reviews/session – returns flashcards scheduled for review **today**
 * for the logged-in user.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // 1. Authentication ------------------------------------------------------
    if (!locals.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    // 2. Business logic ------------------------------------------------------
    const reviewService = createReviewService(locals.supabase);
    const result = await reviewService.getDueFlashcards();

    if (result.isError) {
      logService.error("Failed to fetch due flashcards", { error: result.error });
      return new Response(
        JSON.stringify({ message: "Internal server error", details: result.error }),
        { status: 500 },
      );
    }

    // 3. Build response ------------------------------------------------------
    const response: ReviewSessionResponseDto = {
      cards: result.value,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Unhandled error in review session endpoint", {
      error: error instanceof Error ? error.message : error,
    });
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
