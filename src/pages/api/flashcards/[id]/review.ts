import type { APIRoute } from "astro";
import { logService } from "@/lib/services/log.service";
import { createReviewService } from "@/lib/services/review.service";
import { reviewParamsSchema, submitReviewSchema } from "@/lib/validators/review.schema";

export const prerender = false;

/**
 * POST /api/flashcards/{id}/review – submits a single review result for the
 * flashcard identified by `{id}`.
 */
export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    /* ----------------------------------------------------------------------- */
    /* 1. Validate input                                                       */
    /* ----------------------------------------------------------------------- */
    const parsedParams = reviewParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      logService.warn("Invalid path params in review endpoint", {
        details: parsedParams.error.format(),
      });
      return new Response(
        JSON.stringify({ message: "Invalid flashcard id", details: parsedParams.error.format() }),
        { status: 400 },
      );
    }
    const { id } = parsedParams.data;

    let json: unknown;
    try {
      json = await request.json();
    } catch (err) {
      logService.warn("Malformed JSON body in review endpoint", { error: err });
      return new Response(JSON.stringify({ message: "Malformed JSON body" }), { status: 400 });
    }

    const parsedBody = submitReviewSchema.safeParse(json);
    if (!parsedBody.success) {
      logService.warn("Invalid body in review endpoint", { details: parsedBody.error.format() });
      return new Response(
        JSON.stringify({ message: "Invalid request body", details: parsedBody.error.format() }),
        { status: 400 },
      );
    }
    const { quality } = parsedBody.data;

    /* ----------------------------------------------------------------------- */
    /* 2. Authentication                                                       */
    /* ----------------------------------------------------------------------- */
    if (!locals.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    /* ----------------------------------------------------------------------- */
    /* 3. Business logic                                                       */
    /* ----------------------------------------------------------------------- */
    const reviewService = createReviewService(locals.supabase);
    const result = await reviewService.processReview({ flashcardId: id, quality });

    if (result.isError) {
      // Map domain error messages to HTTP status codes
      const msg = result.error;
      if (msg === "User not authenticated") {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
      }
      if (msg === "Flashcard not found") {
        return new Response(JSON.stringify({ message: "Flashcard not found" }), { status: 404 });
      }
      if (msg === "Invalid flashcard ID") {
        return new Response(JSON.stringify({ message: msg }), { status: 400 });
      }

      logService.error("Failed to process flashcard review", { error: msg });
      return new Response(JSON.stringify({ message: "Internal server error", details: msg }), {
        status: 500,
      });
    }

    /* ----------------------------------------------------------------------- */
    /* 4. Success                                                              */
    /* ----------------------------------------------------------------------- */
    return new Response(JSON.stringify({ message: "Review processed successfully." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logService.error("Unhandled error in flashcard review endpoint", {
      error: error instanceof Error ? error.message : error,
    });
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
